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
    const initial_km = req.body.initialKm || req.body.initial_km || odometer || 0;
    const initial_date = req.body.initialDate || req.body.initial_date || Date.now();
    const last_updated_date = req.body.lastUpdatedDate || req.body.last_updated_date || Date.now();
    const calculated_kpd = req.body.calculatedKpd || req.body.calculated_kpd || 0;
    const last_known_location = req.body.lastKnownLocation || req.body.last_known_location || null;
    const custom_illustration_url = req.body.customIllustrationUrl || req.body.custom_illustration_url || null;
    const usage_type = req.body.usageType || req.body.usage_type || 'PARTICULAR';

    try {
        const result = await run(
            `INSERT INTO vehicles (user_id, name, brand, model, year, license_plate, status, odometer, is_active, type, photo_uri, initial_km, initial_date, last_updated_date, calculated_kpd, last_known_location, custom_illustration_url, usage_type) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [req.user.userId, name, brand, model, year, licensePlate, status || 'Optimal', odometer || 0, isActive !== undefined ? (isActive ? 1 : 0) : 1, type || 'Car', photoUri, initial_km, initial_date, last_updated_date, calculated_kpd, last_known_location, custom_illustration_url, usage_type]
        );
        
        const newVehicle = await query('SELECT * FROM vehicles WHERE id = ?', [result.lastID]);
        res.status(201).json(newVehicle.rows[0]);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error del servidor' });
    }
});

router.put('/:id', auth, async (req, res) => {
    const { odometer, customIllustrationUrl, isActive, status } = req.body;
    const initial_km = req.body.initialKm !== undefined ? req.body.initialKm : req.body.initial_km;
    const last_known_location = req.body.lastKnownLocation !== undefined ? req.body.lastKnownLocation : req.body.last_known_location;
    const last_updated_date = req.body.lastUpdatedDate !== undefined ? req.body.lastUpdatedDate : req.body.last_updated_date;
    const calculated_kpd = req.body.calculatedKpd !== undefined ? req.body.calculatedKpd : req.body.calculated_kpd;
    const usage_type = req.body.usageType !== undefined ? req.body.usageType : req.body.usage_type;

    try {
        const check = await query('SELECT id FROM vehicles WHERE id = ? AND user_id = ?', [req.params.id, req.user.userId]);
        if (check.rows.length === 0) return res.status(404).json({ error: 'Vehículo no encontrado' });

        await run(
            `UPDATE vehicles SET 
                odometer = COALESCE(?, odometer), 
                initial_km = COALESCE(?, initial_km),
                custom_illustration_url = COALESCE(?, custom_illustration_url), 
                is_active = COALESCE(?, is_active),
                last_known_location = COALESCE(?, last_known_location),
                last_updated_date = COALESCE(?, last_updated_date),
                calculated_kpd = COALESCE(?, calculated_kpd),
                usage_type = COALESCE(?, usage_type),
                status = COALESCE(?, status)
            WHERE id = ?`,
            [
                odometer !== undefined ? odometer : null,
                initial_km !== undefined ? initial_km : null,
                customIllustrationUrl !== undefined ? customIllustrationUrl : null,
                isActive !== undefined ? (isActive ? 1 : 0) : null,
                last_known_location !== undefined ? last_known_location : null,
                last_updated_date !== undefined ? last_updated_date : null,
                calculated_kpd !== undefined ? calculated_kpd : null,
                usage_type !== undefined ? usage_type : null,
                status !== undefined ? status : null,
                req.params.id
            ]
        );
        
        const updated = await query('SELECT * FROM vehicles WHERE id = ?', [req.params.id]);
        res.status(200).json(updated.rows[0] || { message: 'Vehículo actualizado exitosamente' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error del servidor' });
    }
});

router.patch('/:id/telemetry', auth, async (req, res) => {
    const { odometerDelta, location, timestamp, odometer } = req.body;
    const calculated_kpd = req.body.calculatedKpd !== undefined ? req.body.calculatedKpd : req.body.calculated_kpd;
    try {
        const check = await query('SELECT id, odometer FROM vehicles WHERE id = ? AND user_id = ?', [req.params.id, req.user.userId]);
        if (check.rows.length === 0) return res.status(404).json({ error: 'Vehículo no encontrado' });

        let newOdometer = check.rows[0].odometer;
        if (odometer !== undefined && odometer !== null) {
            newOdometer = odometer;
        } else if (odometerDelta) {
            newOdometer += Number(odometerDelta);
        }

        await run(
            `UPDATE vehicles SET 
                odometer = ?, 
                last_known_location = COALESCE(?, last_known_location),
                last_updated_date = COALESCE(?, last_updated_date),
                calculated_kpd = COALESCE(?, calculated_kpd)
            WHERE id = ?`,
            [newOdometer, location || null, timestamp || Date.now(), calculated_kpd !== undefined ? calculated_kpd : null, req.params.id]
        );

        const updated = await query('SELECT * FROM vehicles WHERE id = ?', [req.params.id]);
        res.status(200).json(updated.rows[0]);
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
