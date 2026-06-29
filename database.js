const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.resolve(__dirname, 'database.sqlite');
const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('Error connecting to SQLite database:', err.message);
    } else {
        console.log('Connected to SQLite database.');
        initDb();
    }
});

const query = (sql, params = []) => {
    return new Promise((resolve, reject) => {
        db.all(sql, params, (err, rows) => {
            if (err) reject(err);
            else resolve({ rows });
        });
    });
};

const run = (sql, params = []) => {
    return new Promise((resolve, reject) => {
        db.run(sql, params, function (err) {
            if (err) reject(err);
            else resolve(this);
        });
    });
};

const initDb = async () => {
    try {
        await run(`
            CREATE TABLE IF NOT EXISTS user_profiles (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL,
                email TEXT UNIQUE NOT NULL,
                password TEXT NOT NULL,
                avatar_url TEXT,
                use_km BOOLEAN DEFAULT 1,
                is_premium BOOLEAN DEFAULT 0
            );
        `);

        await run(`
            CREATE TABLE IF NOT EXISTS vehicles (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id INTEGER,
                name TEXT NOT NULL,
                brand TEXT,
                model TEXT,
                year INTEGER NOT NULL,
                license_plate TEXT NOT NULL,
                status TEXT DEFAULT 'Optimal',
                odometer REAL DEFAULT 0.0,
                is_active BOOLEAN DEFAULT 1,
                type TEXT DEFAULT 'Car',
                photo_uri TEXT,
                initial_km REAL,
                initial_date INTEGER,
                last_updated_date INTEGER,
                calculated_kpd REAL DEFAULT 0.0,
                last_known_location TEXT,
                custom_illustration_url TEXT,
                usage_type TEXT DEFAULT 'PARTICULAR',
                FOREIGN KEY (user_id) REFERENCES user_profiles(id)
            );
        `);

        await run(`
            CREATE TABLE IF NOT EXISTS service_logs (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                vehicle_id INTEGER,
                category TEXT NOT NULL,
                title TEXT NOT NULL,
                description TEXT,
                cost REAL NOT NULL,
                mileage REAL NOT NULL,
                date INTEGER NOT NULL,
                type TEXT NOT NULL,
                details TEXT,
                FOREIGN KEY (vehicle_id) REFERENCES vehicles(id) ON DELETE CASCADE
            );
        `);
        
        console.log('Database tables initialized.');
    } catch (error) {
        console.error('Error initializing database tables:', error);
    }
};

module.exports = { db, query, run };
