const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.resolve(__dirname, 'database.sqlite');
const db = new sqlite3.Database(dbPath, sqlite3.OPEN_READONLY, (err) => {
    if (err) {
        console.error('Error connecting to database:', err.message);
        return;
    }
    
    console.log('\n=== USUARIOS ===');
    db.all("SELECT id, name, email FROM user_profiles", [], (err, rows) => {
        if (err) console.error(err);
        else console.table(rows);

        console.log('\n=== VEHÍCULOS ===');
        db.all("SELECT id, user_id, name, brand, model, odometer FROM vehicles", [], (err, rows) => {
            if (err) console.error(err);
            else console.table(rows);

            console.log('\n=== SERVICIOS / HISTORIAL ===');
            db.all("SELECT id, vehicle_id, category, title, mileage, cost, date FROM service_logs", [], (err, rows) => {
                if (err) console.error(err);
                else console.table(rows);
                
                db.close();
            });
        });
    });
});
