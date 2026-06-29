const express = require('express');
const { query, run } = require('../database');
const auth = require('../middleware/auth');
const router = express.Router();

router.get('/profile', auth, async (req, res) => {
    try {
        const userResult = await query('SELECT id, name, email, avatar_url as avatarUrl, use_km as useKm, is_premium as isPremium FROM user_profiles WHERE id = ?', [req.user.userId]);
        if (userResult.rows.length === 0) {
            return res.status(404).json({ error: 'Usuario no encontrado' });
        }
        
        const user = userResult.rows[0];
        user.useKm = !!user.useKm;
        user.isPremium = !!user.isPremium;

        res.status(200).json(user);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error del servidor' });
    }
});

router.put('/profile', auth, async (req, res) => {
    const { name, useKm } = req.body;
    try {
        const useKmInt = useKm ? 1 : 0;
        await run('UPDATE user_profiles SET name = ?, use_km = ? WHERE id = ?', [name, useKmInt, req.user.userId]);
        
        const userResult = await query('SELECT id, name, email, avatar_url as avatarUrl, use_km as useKm, is_premium as isPremium FROM user_profiles WHERE id = ?', [req.user.userId]);
        const user = userResult.rows[0];
        user.useKm = !!user.useKm;
        user.isPremium = !!user.isPremium;

        res.status(200).json(user);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error del servidor' });
    }
});

module.exports = router;
