const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { query, run } = require('../database');
const router = express.Router();

router.post('/register', async (req, res) => {
    const { name, email, password, vehicleBrand, vehicleModel, initialOdometer, licensePlate } = req.body;
    
    if (!name || !email || !password || !vehicleBrand || !vehicleModel || initialOdometer === undefined || !licensePlate) {
        return res.status(400).json({ error: 'Faltan campos obligatorios' });
    }

    try {
        // Verificar si el email ya existe
        const existingUser = await query('SELECT id FROM user_profiles WHERE email = ?', [email]);
        if (existingUser.rows.length > 0) {
            return res.status(409).json({ error: 'El email ya está registrado' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        await run('BEGIN TRANSACTION');
        
        const insertUser = await run(
            'INSERT INTO user_profiles (name, email, password) VALUES (?, ?, ?)',
            [name, email, hashedPassword]
        );
        const userId = insertUser.lastID;

        const vehicleName = `${vehicleBrand} ${vehicleModel}`;
        const insertVehicle = await run(
            `INSERT INTO vehicles (user_id, name, brand, model, year, license_plate, odometer, initial_km)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
            [userId, vehicleName, vehicleBrand, vehicleModel, new Date().getFullYear(), licensePlate, initialOdometer, initialOdometer]
        );
        const vehicleId = insertVehicle.lastID;

        await run('COMMIT');

        const token = jwt.sign({ userId }, process.env.JWT_SECRET || 'super_secret_garage_pulse_key', { expiresIn: '7d' });

        const userResult = await query('SELECT id, name, email, avatar_url as avatarUrl, use_km as useKm, is_premium as isPremium FROM user_profiles WHERE id = ?', [userId]);
        const vehicleResult = await query('SELECT * FROM vehicles WHERE id = ?', [vehicleId]);

        res.status(201).json({
            token,
            user: userResult.rows[0],
            vehicle: vehicleResult.rows[0]
        });

    } catch (error) {
        await run('ROLLBACK');
        console.error(error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
});

router.post('/login', async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ error: 'Email y contraseña son obligatorios' });
    }

    try {
        const userResult = await query(
            'SELECT id, name, email, password, avatar_url as avatarUrl, use_km as useKm, is_premium as isPremium FROM user_profiles WHERE email = ?',
            [email]
        );

        if (userResult.rows.length === 0) {
            return res.status(401).json({ error: 'Credenciales inválidas' });
        }

        const user = userResult.rows[0];
        const passwordMatch = await bcrypt.compare(password, user.password);

        if (!passwordMatch) {
            return res.status(401).json({ error: 'Credenciales inválidas' });
        }

        const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET || 'super_secret_garage_pulse_key', { expiresIn: '7d' });

        // Remove password from response
        delete user.password;
        user.useKm = !!user.useKm;
        user.isPremium = !!user.isPremium;

        res.status(200).json({
            token,
            user
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
});

module.exports = router;
