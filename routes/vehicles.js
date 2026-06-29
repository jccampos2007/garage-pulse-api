const express = require('express');
const { query, run } = require('../database');
const auth = require('../middleware/auth');
const router = express.Router();

router.get('/', auth, async (req, res) => {
    try {
        const vehicles = await query('SELECT * FROM vehicles WHERE user_id = ?', [req.user.userId]);
        // Convert boolean fields
        const formattedVehicles = vehicles.rows.map(v => ({
            ...v,
            is_active: !!v.is_active
        }));
        res.status(200).json(formattedVehicles);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error del servidor' });
    }
});

router.post('/', auth, async (req, res) => {
    const { name, brand, model, year, licensePlate, status, odometer, isActive, type, photoUri } = req.body;
    try {
        const result = await run(
            `INSERT INTO vehicles (user_id, name, brand, model, year, license_plate, status, odometer, is_active, type, photo_uri) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [req.user.userId, name, brand, model, year, licensePlate, status || 'Optimal', odometer || 0, isActive ? 1 : 0, type || 'Car', photoUri]
        );
        
        const newVehicle = await query('SELECT * FROM vehicles WHERE id = ?', [result.lastID]);
        res.status(201).json(newVehicle.rows[0]);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error del servidor' });
    }
});

router.put('/:id', auth, async (req, res) => {
    const { odometer, customIllustrationUrl, isActive } = req.body;
    try {
        const check = await query('SELECT id FROM vehicles WHERE id = ? AND user_id = ?', [req.params.id, req.user.userId]);
        if (check.rows.length === 0) return res.status(404).json({ error: 'Vehículo no encontrado' });

        await run(
            'UPDATE vehicles SET odometer = COALESCE(?, odometer), custom_illustration_url = COALESCE(?, custom_illustration_url), is_active = COALESCE(?, is_active) WHERE id = ?',
            [odometer, customIllustrationUrl, isActive !== undefined ? (isActive ? 1 : 0) : null, req.params.id]
        );
        
        res.status(200).json({ message: 'Vehículo actualizado exitosamente' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error del servidor' });
    }
});

router.delete('/:id', auth, async (req, res) => {
    try {
        const check = await query('SELECT id FROM vehicles WHERE id = ? AND user_id = ?', [req.params.id, req.user.userId]);
        if (check.rows.length === 0) return res.status(404).json({ error: 'Vehículo no encontrado' });

        await run('DELETE FROM vehicles WHERE id = ?', [req.params.id]);
        res.status(204).send();
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error del servidor' });
    }
});

// Obtener bitácora de servicios de un vehículo específico
router.get('/:vehicleId/services', auth, async (req, res) => {
    try {
        const vehicle = await query('SELECT id FROM vehicles WHERE id = ? AND user_id = ?', [req.params.vehicleId, req.user.userId]);
        if (vehicle.rows.length === 0) return res.status(404).json({ error: 'Vehículo no encontrado' });

        const services = await query('SELECT * FROM service_logs WHERE vehicle_id = ? ORDER BY date DESC', [req.params.vehicleId]);
        res.status(200).json(services.rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error del servidor' });
    }
});

module.exports = router;
