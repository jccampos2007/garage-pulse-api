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

// Configuración de rutas
app.use('/api/auth', authRoutes);
app.use('/api/user', userRoutes);
app.use('/api/vehicles', vehicleRoutes);
app.use('/api/services', serviceRoutes);

app.get('/', (req, res) => {
    res.send('GaragePulse API is running');
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
