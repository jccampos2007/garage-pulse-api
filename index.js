require('dotenv').config();
const express = require('express');
const cors = require('cors');

const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const vehicleRoutes = require('./routes/vehicles');
const serviceRoutes = require('./routes/services');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Middleware para ver los logs de peticiones en la terminal
app.use((req, res, next) => {
    console.log(`\n[${new Date().toISOString()}] ${req.method} ${req.url}`);
    if (req.body && Object.keys(req.body).length > 0) {
        console.log('Body:', req.body);
    }
    next();
});

const path = require('path');

// Configuración de rutas API
app.use('/api/auth', authRoutes);
app.use('/api/user', userRoutes);
app.use('/api/vehicles', vehicleRoutes);
app.use('/api/services', serviceRoutes);

// Servir archivos estáticos del portal web de GaragePulse
const portalDistPath = path.join(__dirname, 'web-portal', 'dist');
app.use(express.static(portalDistPath));

app.use((req, res, next) => {
    if (req.url.startsWith('/api')) {
        return res.status(404).json({ error: 'API endpoint no encontrado' });
    }
    res.sendFile(path.join(portalDistPath, 'index.html'), (err) => {
        if (err) next(err);
    });
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
