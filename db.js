const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, '../../data/bot.db');

const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('Database connection error:', err);
    } else {
        console.log('Connected to database');
        initDb();
    }
});

function initDb() {
    db.serialize(() => {
        // Tabel Admin
        db.run(`CREATE TABLE IF NOT EXISTS admin (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            number TEXT UNIQUE,
            name TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )`);

        // Tabel User
        db.run(`CREATE TABLE IF NOT EXISTS user (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            number TEXT UNIQUE,
            name TEXT,
            status TEXT DEFAULT 'active',
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )`);

        // Tabel Response
        db.run(`CREATE TABLE IF NOT EXISTS response (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_number TEXT,
            response_type TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )`);
    });
}

module.exports = db;
