@echo off
set /p email="Enter your email to make Admin: "
node -e "const sqlite3 = require('sqlite3'); const { open } = require('sqlite'); (async () => { const db = await open({ filename: 'portfolio.db', driver: sqlite3.Database }); await db.run('UPDATE users SET is_admin = 1 WHERE email = ?', '%email%'); console.log('Admin rights granted to ' + '%email%'); })()"
pause
