const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const bcrypt = require('bcryptjs');

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
        
        // Ensure user 1 has Juan Campos credentials and hashed password
        const hashedPassword = bcrypt.hashSync('12369*', 10);
        await run(`UPDATE user_profiles SET name = 'Juan Campos', email = 'ingdiazjc@gmail.com', password = ? WHERE id = 1`, [hashedPassword]);

        // Check if DB is empty and seed defaults
        const vCheck = await query('SELECT COUNT(*) as count FROM vehicles');
        if (vCheck.rows[0].count === 0) {
            await run(`INSERT INTO user_profiles (name, email, password, use_km, is_premium) VALUES ('Juan Campos', 'ingdiazjc@gmail.com', ?, 1, 0)`, [hashedPassword]);
            const now = Date.now();
            const vRes = await run(`INSERT INTO vehicles (user_id, name, brand, model, year, license_plate, status, odometer, is_active, type, initial_km, initial_date, last_updated_date, calculated_kpd, usage_type) VALUES (1, 'Chery Arauca', 'Chery', 'Arauca', 2013, 'AH678LA', 'Optimal', 15000, 1, 'Car', 15000, ?, ?, 0, 'PARTICULAR')`, [now - 30 * 86400000, now]);
            const vid = vRes.lastID || 1;
            await run(`INSERT INTO service_logs (vehicle_id, category, title, description, cost, mileage, date, type, details) VALUES (?, 'Motor', 'Goma de valvula', 'Reemplazo de gomas de válvula', 80.0, 14000, ?, 'PREVENTIVO', 'Goma de valvula')`, [vid, now - 15 * 86400000]);
            await run(`INSERT INTO service_logs (vehicle_id, category, title, description, cost, mileage, date, type, details) VALUES (?, 'Cambio de Aceite', 'Cambio de aceite', 'Cambio de aceite motor y filtro', 45.0, 14500, ?, 'PREVENTIVO', 'Cambio de aceite')`, [vid, now - 10 * 86400000]);
            await run(`INSERT INTO service_logs (vehicle_id, category, title, description, cost, mileage, date, type, details) VALUES (?, 'Filtros', 'filtro de gasolina', 'Cambio de filtro de combustible', 25.0, 14000, ?, 'PREVENTIVO', 'filtro de gasolina')`, [vid, now - 20 * 86400000]);
            await run(`INSERT INTO service_logs (vehicle_id, category, title, description, cost, mileage, date, type, details) VALUES (?, 'Motor', 'limpiesa de inyectores', 'Mantenimiento y limpieza de inyectores', 60.0, 14000, ?, 'PREVENTIVO', 'limpiesa de inyectores')`, [vid, now - 18 * 86400000]);
            console.log('Default vehicle Chery Arauca 2013 (AH678LA) and services seeded.');
        }
    } catch (error) {
        console.error('Error initializing database tables:', error);
    }
};

module.exports = { db, query, run };
