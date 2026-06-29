const express = require('express');
const { query, run } = require('../database');
const auth = require('../middleware/auth');
const router = express.Router();

router.get('/', auth, async (req, res) => {
    const { category, type } = req.query;
    try {
        let sql = `
            SELECT s.* FROM service_logs s
            JOIN vehicles v ON s.vehicle_id = v.id
            WHERE v.user_id = ?
        `;
        const params = [req.user.userId];

        if (category) {
            sql += ' AND s.category = ?';
            params.push(category);
        }
        if (type) {
            sql += ' AND s.type = ?';
            params.push(type);
        }
        
        sql += ' ORDER BY s.date DESC';

        const services = await query(sql, params);
        res.status(200).json(services.rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error del servidor' });
    }
});

router.post('/', auth, async (req, res) => {
    const { vehicleId, category, title, description, cost, mileage, date, type, details } = req.body;
    
    try {
        const vehResult = await query('SELECT id, odometer FROM vehicles WHERE id = ? AND user_id = ?', [vehicleId, req.user.userId]);
        if (vehResult.rows.length === 0) {
            return res.status(404).json({ error: 'Vehículo no encontrado o sin permisos' });
        }

        await run('BEGIN TRANSACTION');

        const insertResult = await run(
            `INSERT INTO service_logs (vehicle_id, category, title, description, cost, mileage, date, type, details)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [vehicleId, category, title, description, cost, mileage, date, type, details]
        );
        const serviceId = insertResult.lastID;

        const currentOdometer = vehResult.rows[0].odometer;
        if (mileage > currentOdometer) {
            await run('UPDATE vehicles SET odometer = ? WHERE id = ?', [mileage, vehicleId]);
        }

        await run('COMMIT');

        const newService = await query('SELECT * FROM service_logs WHERE id = ?', [serviceId]);
        res.status(201).json(newService.rows[0]);

    } catch (error) {
        await run('ROLLBACK');
        console.error(error);
        res.status(500).json({ error: 'Error interno al registrar mantenimiento.' });
    }
});

router.delete('/:id', auth, async (req, res) => {
    try {
        const check = await query(`
            SELECT s.id FROM service_logs s
            JOIN vehicles v ON s.vehicle_id = v.id
            WHERE s.id = ? AND v.user_id = ?
        `, [req.params.id, req.user.userId]);
        
        if (check.rows.length === 0) return res.status(404).json({ error: 'Servicio no encontrado' });

        await run('DELETE FROM service_logs WHERE id = ?', [req.params.id]);
        res.status(204).send();
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error del servidor' });
    }
});

module.exports = router;
