const messageContainer = document.getElementById('chat-messages');
const input = document.getElementById('ai-input');
const sendBtn = document.getElementById('ai-send-btn');

let chatHistory = [];

function logMsg(text, type = 'ai') {
    if (!messageContainer) return;
    const div = document.createElement('div');
    div.className = `msg ${type}`;
    // Use innerHTML instead of textContent since aiResponse includes <br> tags in index.html
    div.innerHTML = text;
    messageContainer.appendChild(div);
    messageContainer.scrollTop = messageContainer.scrollHeight;
}

async function handleInput() {
    const val = input.value.trim();
    if (!val) return;

    logMsg(val, 'user');
    input.value = '';

    try {
        const response = await fetch('/ai/chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ message: val, history: chatHistory })
        });

        const data = await response.json();
        const aiResponse = data.response;

        // Add to history
        chatHistory.push({ role: 'user', content: val });
        chatHistory.push({ role: 'assistant', content: aiResponse });
        if (chatHistory.length > 20) chatHistory.shift();

        logMsg(aiResponse);

        // Check for portfolio updates
        if (aiResponse.includes('[UPDATE_PORTFOLIO]')) {
            const match = aiResponse.match(/\[UPDATE_PORTFOLIO\]([\s\S]*?)\[\/UPDATE_PORTFOLIO\]/);
            if (match && match[1]) {
                try {
                    const updateData = JSON.parse(match[1]);
                    // Save to backend
                    await fetch('/ai/update_portfolio', {
                         method: 'POST',
                         headers: { 'Content-Type': 'application/json' },
                         body: JSON.stringify(updateData)
                    });
                    // Refresh from DB
                    updatePreviewPanel();
                } catch (e) {
                    console.error('Failed to parse portfolio update:', e);
                }
            }
        }
    } catch (err) {
        console.error('Frontend Fetch Error:', err);
        logMsg("Oops, I lost my train of thought. (Error: " + err.message + "). Make sure your server is running!");
    }
}

async function updatePreviewPanel() {
    const iframe = document.getElementById('preview-iframe');
    if (!iframe) return;

    try {
        const user = JSON.parse(localStorage.getItem('hbCurrentUser') || 'null');
        if (!user) return;

        // Fetch the absolute source of truth
        const response = await fetch('/dashboard');
        if (!response.ok) return;
        const portfolio = await response.json();

        // Save back to localStorage so other pages have latest
        localStorage.setItem(`portfolioData_${user.email}`, JSON.stringify(portfolio));

        const template = localStorage.getItem(`hbTemplate_${user.email}`) || 'hacker';

        // Fetch share.html CSS only
        const tplRes = await fetch('/share.html');
        const fullHtml = await tplRes.text();

        // Extract just the <style> block from share.html
        const styleMatch = fullHtml.match(/<style>([\s\S]*?)<\/style>/);
        const css = styleMatch ? styleMatch[1] : '';

        // Serialize portfolio data safely
        const safePortfolio = JSON.stringify(portfolio).replace(/<\/script>/gi, '<\\/script>');

        const previewHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <link href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@300;400;500;600;700&family=Syne:wght@700;800&family=Outfit:wght@300;400;600;700&family=Cormorant+Garamond:ital,wght@0,300;0,600;1,300&family=DM+Mono:wght@400;500&display=swap" rel="stylesheet">
  <style>* { margin: 0; padding: 0; box-sizing: border-box; } body { font-family: 'Space Grotesk', sans-serif; min-height: 100vh; } #rc { min-height: 100vh; }</style>
  <style>${css}</style>
</head>
<body>
  <div id="rc"></div>
  <script>
    const esc = s => String(s || '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
    const portfolio = ${safePortfolio};
    const p = portfolio.profile, pjs = portfolio.projects || [], sks = portfolio.skills || [], ex = portfolio.experience || [];

    function renderHacker(p,pjs,sks,ex){return\`<div class="tpl-hacker"><div class="h-prompt">$ portfolio --user="\${esc(p.email||'user')}"</div><div class="h-name">\${esc(p.name)||'Your Name'}</div><div class="h-role">\${esc(p.bio)||'// bio here'}</div><div class="h-email">\${esc(p.email)||''}</div><hr class="h-divider"><div class="h-section-title">projects</div>\${pjs.length?pjs.map(pr=>\`<div class="h-proj"><div class="h-proj-name">\${esc(pr.title)}</div>\${pr.desc?\`<div class="h-proj-desc">\${esc(pr.desc)}</div>\`:''}\${pr.tech?\`<div class="h-proj-tech">stack: \${esc(pr.tech)}</div>\`:''}\${pr.link?\`<a class="h-proj-link" href="\${esc(pr.link)}" target="_blank">→ view()</a>\`:''}</div>\`).join(''):'<div class="h-empty">// no projects</div>'}<hr class="h-divider"><div class="h-section-title">skills</div>\${sks.length?sks.map(s=>\`<span class="h-skill">\${esc(s.name)}<span class="h-skill-level">.\${esc(s.level).toLowerCase()}</span></span>\`).join(''):'<div class="h-empty">// no skills</div>'}</div>\`;}
    function renderEditorial(p,pjs,sks,ex){return\`<div class="tpl-editorial"><div class="e-header"><div class="e-eyebrow">Portfolio — \${new Date().getFullYear()}</div><div class="e-name">\${esc(p.name)||'Your Name'}</div>\${p.bio?\`<div class="e-tagline">\${esc(p.bio)}</div>\`:''}\${p.email?\`<div class="e-email">\${esc(p.email)}</div>\`:''}</div><div class="e-body"><div class="e-col-header"><div class="e-section-num">01</div><div class="e-section-title">Projects</div></div>\${pjs.map(pr=>\`<div class="e-proj"><div class="e-proj-name">\${esc(pr.title)}</div>\${pr.desc?\`<div class="e-proj-desc">\${esc(pr.desc)}</div>\`:''}</div>\`).join('')}<div class="e-col-header" style="margin-top:2rem;"><div class="e-section-num">02</div><div class="e-section-title">Skills</div></div>\${sks.map(s=>\`<span class="e-skill">\${esc(s.name)}</span>\`).join('')}</div></div>\`;}
    function renderGlass(p,pjs,sks,ex){const i=(p.name||'?').split(' ').map(w=>w[0]).join('').toUpperCase().slice(0,2)||'?';return\`<div class="tpl-glass"><div class="g-card"><div class="g-avatar-ring">\${i}</div><div class="g-name">\${esc(p.name)||'Your Name'}</div>\${p.email?\`<div class="g-email">\${esc(p.email)}</div>\`:''}\${p.bio?\`<div class="g-bio">\${esc(p.bio)}</div>\`:''}<hr class="g-divider"><div class="g-section-title">Projects</div>\${pjs.map(pr=>\`<div class="g-proj"><div class="g-proj-name">\${esc(pr.title)}</div>\${pr.desc?\`<div class="g-proj-desc">\${esc(pr.desc)}</div>\`:''}</div>\`).join('')}<hr class="g-divider"><div class="g-section-title">Skills</div>\${sks.map(s=>\`<span class="g-skill">\${esc(s.name)}</span>\`).join('')}</div></div>\`;}
    function renderLuxury(p,pjs,sks,ex){const pts=(p.name||'Your Name').split(' ');const first=pts[0],rest=pts.slice(1).join(' ')||'Name';return\`<div class="tpl-luxury"><div class="l-rule"></div><div class="l-name">\${esc(first)} <em>\${esc(rest)}</em></div>\${p.email?\`<div class="l-email">\${esc(p.email)}</div>\`:''}\${p.bio?\`<div class="l-bio">\${esc(p.bio)}</div>\`:''}<div class="l-section"><div class="l-section-head"><div class="l-section-label">Projects</div><div class="l-section-line"></div></div>\${pjs.map(pr=>\`<div class="l-proj"><div class="l-proj-name">\${esc(pr.title)}</div>\${pr.desc?\`<div class="l-proj-desc">\${esc(pr.desc)}</div>\`:''}</div>\`).join('')}</div><div class="l-section"><div class="l-section-head"><div class="l-section-label">Expertise</div><div class="l-section-line"></div></div>\${sks.map(s=>\`<span class="l-skill">\${esc(s.name)}</span>\`).join('')}</div></div>\`;}
    function renderNeon(p,pjs,sks,ex){return\`<div class="tpl-neon"><div class="n-header"><div class="n-name">\${esc((p.name||'Your').split(' ')[0])} <span>\${esc((p.name||'Name').split(' ').slice(1).join(' ')||'Name')}</span></div>\${p.email?\`<div class="n-email">\${esc(p.email)}</div>\`:''}\${p.bio?\`<div class="n-bio">\${esc(p.bio)}</div>\`:''}</div><div class="n-grid">\${pjs.map(pr=>\`<div class="n-proj-card"><div class="n-proj-tag">Project</div><div class="n-proj-name">\${esc(pr.title)}</div>\${pr.desc?\`<div class="n-proj-desc">\${esc(pr.desc)}</div>\`:''}</div>\`).join('')}</div><div class="n-skills-wrap"><div class="n-sec-label">Skills</div>\${sks.map(s=>\`<span class="n-skill"><span class="n-skill-dot"></span>\${esc(s.name)}</span>\`).join('')}</div></div>\`;}

    const renderers = { hacker: renderHacker, editorial: renderEditorial, glass: renderGlass, luxury: renderLuxury, neon: renderNeon };
    const fn = renderers['${template}'] || renderHacker;
    document.getElementById('rc').innerHTML = fn(p, pjs, sks, ex);
  </script>
</body>
</html>`;

        // Revoke any old blob URL to avoid memory leak
        if (iframe.dataset.blobUrl) URL.revokeObjectURL(iframe.dataset.blobUrl);
        const blob = new Blob([previewHtml], { type: 'text/html' });
        const blobUrl = URL.createObjectURL(blob);
        iframe.dataset.blobUrl = blobUrl;
        iframe.src = blobUrl;

    } catch (e) {
        console.error("Preview update failed:", e);
    }
}

// Initial load of the preview
window.addEventListener('load', () => {
    updatePreviewPanel(); // Load current portfolio state from DB
});

if (sendBtn) sendBtn.onclick = handleInput;
if (input) input.onkeypress = (e) => { if (e.key === 'Enter') handleInput(); };
