const express = require('express');
const session = require('express-session');
const sqlite3 = require('sqlite3');
const { open } = require('sqlite');
const bcrypt = require('bcryptjs');
const path = require('path');
const bodyParser = require('body-parser');

const app = express();
let db;

(async () => {
    db = await open({
        filename: 'portfolio.db',
        driver: sqlite3.Database
    });

    await db.exec(`
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        email TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        bio TEXT,
        is_admin BOOLEAN DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS projects (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER,
        title TEXT NOT NULL,
        description TEXT,
        tech_stack TEXT,
        link TEXT,
        start_date TEXT,
        end_date TEXT,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      );

      CREATE TABLE IF NOT EXISTS skills (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER,
        name TEXT NOT NULL,
        level TEXT,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      );

      CREATE TABLE IF NOT EXISTS experience (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER,
        role TEXT NOT NULL,
        company TEXT NOT NULL,
        description TEXT,
        start_date TEXT,
        end_date TEXT,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      );
    `);
    const adminExists = await db.get('SELECT id FROM users WHERE is_admin = 1');
    if (!adminExists) {
        const hashedAdminPass = bcrypt.hashSync('admin123', 10);
        await db.run('INSERT INTO users (name, email, password, is_admin) VALUES (?, ?, ?, 1)',
            'Administrator', 'admin@portfolio.com', hashedAdminPass);
        console.log('Default Admin account created: admin@portfolio.com / admin123');
    }

    console.log('Database initialized.');
})();

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(session({
    secret: 'portfolio-secret-key',
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false }
}));

app.use(express.static(__dirname));

// --- AUTH API ---
app.post('/auth', async (req, res) => {
    const { action, email, password, name } = req.body;

    if (action === 'register') {
        const hashed = bcrypt.hashSync(password, 10);
        try {
            const result = await db.run('INSERT INTO users (name, email, password) VALUES (?, ?, ?)', name, email, hashed);
            req.session.userId = result.lastID;
            req.session.isAdmin = false;
            res.json({ success: true, user: { name, email, isAdmin: false } });
        } catch (e) {
            res.status(400).json({ success: false, message: 'Email already exists' });
        }
    } else if (action === 'login') {
        const user = await db.get('SELECT * FROM users WHERE email = ?', email);
        if (user && bcrypt.compareSync(password, user.password)) {
            req.session.userId = user.id;
            req.session.isAdmin = user.is_admin === 1;
            res.json({ success: true, user: { name: user.name, email: user.email, isAdmin: user.is_admin === 1 } });
        } else {
            res.status(401).json({ success: false, message: 'Invalid credentials' });
        }
    } else if (action === 'logout') {
        req.session.destroy();
        res.json({ success: true });
    } else if (action === 'update_profile') {
        if (!req.session.userId) return res.status(401).end();
        await db.run('UPDATE users SET name = ?, bio = ? WHERE id = ?', req.body.name, req.body.bio, req.session.userId);
        res.json({ success: true });
    }
});

// --- DASHBOARD API ---
app.get('/dashboard', async (req, res) => {
    if (!req.session.userId) return res.status(401).json({ message: 'Unauthorized' });

    const user = await db.get('SELECT name, email, bio FROM users WHERE id = ?', req.session.userId);
    const projects = await db.all('SELECT * FROM projects WHERE user_id = ?', req.session.userId);
    const skills = await db.all('SELECT * FROM skills WHERE user_id = ?', req.session.userId);
    const experience = await db.all('SELECT * FROM experience WHERE user_id = ?', req.session.userId);

    res.json({ profile: user, projects, skills, experience });
});

// --- PROJECT API ---
app.post('/project', async (req, res) => {
    if (!req.session.userId) return res.status(401).end();
    const { action, title, description, tech_stack, link, start_date, end_date } = req.body;
    if (action === 'add') {
        await db.run('INSERT INTO projects (user_id, title, description, tech_stack, link, start_date, end_date) VALUES (?, ?, ?, ?, ?, ?, ?)',
            req.session.userId, title, description, tech_stack, link, start_date, end_date);
        res.json({ success: true });
    }
});

app.get('/project', async (req, res) => {
    if (!req.session.userId || req.query.action !== 'delete') return res.status(401).end();
    await db.run('DELETE FROM projects WHERE id = ? AND user_id = ?', req.query.id, req.session.userId);
    res.json({ success: true });
});

// --- SKILL API ---
app.post('/skill', async (req, res) => {
    if (!req.session.userId || req.body.action !== 'add') return res.status(401).end();
    await db.run('INSERT INTO skills (user_id, name, level) VALUES (?, ?, ?)', req.session.userId, req.body.name, req.body.level);
    res.json({ success: true });
});

app.get('/skill', async (req, res) => {
    if (!req.session.userId || req.query.action !== 'delete') return res.status(401).end();
    await db.run('DELETE FROM skills WHERE id = ? AND user_id = ?', req.query.id, req.session.userId);
    res.json({ success: true });
});

// --- EXPERIENCE API ---
app.post('/experience', async (req, res) => {
    if (!req.session.userId || req.body.action !== 'add') return res.status(401).end();
    const { role, company, description, start_date, end_date } = req.body;
    await db.run('INSERT INTO experience (user_id, role, company, description, start_date, end_date) VALUES (?, ?, ?, ?, ?, ?)',
        req.session.userId, role, company, description, start_date, end_date);
    res.json({ success: true });
});

app.get('/experience', async (req, res) => {
    if (!req.session.userId || req.query.action !== 'delete') return res.status(401).end();
    await db.run('DELETE FROM experience WHERE id = ? AND user_id = ?', req.query.id, req.session.userId);
    res.json({ success: true });
});

// --- ADMIN API ---
app.get('/admin', async (req, res) => {
    if (!req.session.isAdmin) return res.status(403).end();
    if (req.query.action === 'list_users') {
        const users = await db.all(`
      SELECT u.id, u.name, u.email, u.created_at as joined,
      (SELECT COUNT(*) FROM projects WHERE user_id = u.id) as projects,
      (SELECT COUNT(*) FROM skills WHERE user_id = u.id) as skills
      FROM users u ORDER BY u.created_at DESC
    `);
        res.json(users);
    }
});

app.post('/admin', async (req, res) => {
    if (!req.session.isAdmin || req.body.action !== 'delete_user') return res.status(403).end();
    if (req.body.id == req.session.userId) return res.status(400).json({ success: false, message: 'Cannot delete self' });
    await db.run('DELETE FROM users WHERE id = ?', req.body.id);
    res.json({ success: true });
});

// --- AI CHAT API ---
const GEMINI_API_KEY = 'AIzaSyB3RiCJOEswiXnDs4yMM_cOcQ_FmI3ao4I';

app.post('/ai/chat', async (req, res) => {
    const { message, history } = req.body;

    // Configs to try: [apiVersion, modelName]
    const configs = [
        ['v1beta', 'gemini-2.5-flash'],
        ['v1beta', 'gemini-2.0-flash'],
        ['v1beta', 'gemini-flash-latest'],
        ['v1beta', 'gemini-pro-latest']
    ];

    let lastErrorMessage = "All attempts failed.";

    for (const [version, model] of configs) {
        try {
            const url = `https://generativelanguage.googleapis.com/${version}/models/${model}:generateContent?key=${GEMINI_API_KEY}`;

            const systemPrompt = `You are a helpful and professional Resume and Portfolio building AI assistant. Your goal is to gather information from the user to help them build their resume/portfolio. Ask questions one at a time or in small chunks. Keep responses concise and supportive. If they provide details, acknowledge them and ask for the next piece of information. The details you want to eventually gather include: 1. Full name, phone, email, LinkedIn/GitHub; 2. Education (degree, college, graduation year, CGPA); 3. Experience (internships/jobs); 4. Projects (name, tech stack, description); 5. Skills; 6. Certifications; 7. Achievements/Extracurriculars. 
            CRITICAL: If you want to suggest changes to the user's portfolio, wrap the suggested JSON data in [UPDATE_PORTFOLIO] tags. 
            Example: [UPDATE_PORTFOLIO]{ "bio": "New bio text", "projects": [{ "title": "New Proj" }] }[/UPDATE_PORTFOLIO]`;

            const contents = [
                { role: 'user', parts: [{ text: "Instructions: " + systemPrompt }] },
                { role: 'model', parts: [{ text: "Understood! I am the Resume Assistant. I will help the user gather their details." }] }
            ];

            // Re-map history to avoid object reference issues in the loop
            history.forEach(item => {
                contents.push({
                    role: item.role === 'user' ? 'user' : 'model',
                    parts: [{ text: item.content }]
                });
            });

            contents.push({ role: 'user', parts: [{ text: message }] });

            const response = await fetch(url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    contents: contents,
                    generationConfig: { maxOutputTokens: 300, temperature: 0.7 }
                })
            });

            const data = await response.json();

            if (response.ok) {
                const aiResponse = data.candidates?.[0]?.content?.parts?.[0]?.text || "I'm having a bit of trouble thinking... can you repeat that?";
                return res.json({ response: aiResponse });
            } else {
                console.warn(`[AIBrain] Attempt with ${model} (${version}) failed: ${data.error?.message}`);
                lastErrorMessage = `${model} (${version}): ${data.error?.message}`;
            }
        } catch (err) {
            console.error(`[AIBrain] Fetch error for ${model}:`, err.message);
            lastErrorMessage = err.message;
        }
    }

    res.status(500).json({
        response: "Sorry, I am having trouble connecting to the AI models. Please try again later.",
        detailed_error: lastErrorMessage
    });
});

// --- AI PORTFOLIO UPDATE API ---
app.post('/ai/update_portfolio', async (req, res) => {
    if (!req.session.userId) return res.status(401).end();
    const { name, bio, projects, skills, experience } = req.body;

    try {
        if (name !== undefined || bio !== undefined) {
             const currentUser = await db.get('SELECT name, bio FROM users WHERE id = ?', req.session.userId);
             const newName = name !== undefined ? name : currentUser.name;
             const newBio = bio !== undefined ? bio : currentUser.bio;
             await db.run('UPDATE users SET name = ?, bio = ? WHERE id = ?', newName, newBio, req.session.userId);
        }

        if (projects && Array.isArray(projects)) {
            for (const p of projects) {
                await db.run('INSERT INTO projects (user_id, title, description, tech_stack, link) VALUES (?, ?, ?, ?, ?)',
                    req.session.userId, p.title || p.name, p.description || p.desc, p.tech_stack || p.tech, p.link);
            }
        }

        if (skills && Array.isArray(skills)) {
            for (const s of skills) {
                await db.run('INSERT INTO skills (user_id, name, level) VALUES (?, ?, ?)', 
                    req.session.userId, s.name, s.level || 'Intermediate');
            }
        }
        
        if (experience && Array.isArray(experience)) {
            for (const e of experience) {
                await db.run('INSERT INTO experience (user_id, role, company, description, start_date, end_date) VALUES (?, ?, ?, ?, ?, ?)', 
                    req.session.userId, e.role, e.company, e.description || e.desc, e.start_date || e.duration, e.end_date);
            }
        }
        res.json({ success: true });
    } catch (e) {
        console.error("AI Portfolio Update Error:", e);
        res.status(500).json({ success: false, error: e.message });
    }
});

// --- AI DIAGNOSTIC API ---
app.get('/ai/models', async (req, res) => {
    try {
        const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${GEMINI_API_KEY}`;
        const response = await fetch(url);
        const data = await response.json();
        res.json(data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

const PORT = 8080;
app.listen(PORT, '0.0.0.0', () => {
    console.log(`Portfolio Builder running at http://localhost:${PORT}`);
});
