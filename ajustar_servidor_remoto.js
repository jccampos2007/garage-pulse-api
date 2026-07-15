/**
 * Script de Ajuste del Servidor Remoto (GaragePulse Cloud API)
 * Dominio: https://garage-pulse-api.gscloud.us/api
 * 
 * Funcionalidad:
 * 1. Inicia sesión en el servidor remoto con las credenciales de administrador/usuario.
 * 2. Consulta el inventario actual en la nube.
 * 3. Elimina vehículos obsoletos o no deseados (ej. Toyotas de prueba).
 * 4. Inserta o verifica el vehículo correcto (ej. Moto Bera BR150 - AL6A86A).
 * 5. Muestra el estado final y sincronizado del servidor remoto.
 * 
 * Uso:
 * node ajustar_servidor_remoto.js
 */

const https = require('https');

// ========== CONFIGURACIÓN ==========
const CLOUD_HOST = 'garage-pulse-api.gscloud.us';
const API_PREFIX = '/api';

// Credenciales para autenticar en el servidor remoto
const CREDENTIALS = {
    email: 'ingdiazjc@gmail.com',
    password: '12369*'
};

// Configuración del vehículo a garantizar en el servidor remoto
const VEHICULO_A_AGREGAR = {
    name: 'Moto Bera BR150',
    brand: 'Bera',
    model: 'BR150',
    year: 2024,
    licensePlate: 'AL6A86A',
    status: 'Optimal',
    odometer: 41000,
    isActive: true,
    type: 'Motorcycle',
    initialKm: 41000,
    usageType: 'PARTICULAR'
};
// ===================================

/**
 * Función auxiliar para realizar peticiones HTTPS a la API
 */
function requestApi(method, path, data = null, token = null) {
    return new Promise((resolve, reject) => {
        const payload = data ? JSON.stringify(data) : null;
        const options = {
            hostname: CLOUD_HOST,
            path: API_PREFIX + path,
            method: method,
            headers: {
                'Content-Type': 'application/json',
                ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
                ...(payload ? { 'Content-Length': Buffer.byteLength(payload) } : {})
            }
        };

        const req = https.request(options, (res) => {
            let body = '';
            res.on('data', chunk => body += chunk);
            res.on('end', () => {
                try {
                    const parsed = body ? JSON.parse(body) : null;
                    resolve({ status: res.statusCode, data: parsed, raw: body });
                } catch (e) {
                    resolve({ status: res.statusCode, data: null, raw: body });
                }
            });
        });

        req.on('error', (err) => reject(err));
        if (payload) req.write(payload);
        req.end();
    });
}

async function ajustarServidorRemoto() {
    console.log(`\n🌐 [1/5] Conectando y autenticando en ${CLOUD_HOST}...`);
    const loginRes = await requestApi('POST', '/auth/login', CREDENTIALS);

    if (loginRes.status !== 200 || !loginRes.data?.token) {
        console.error('❌ Error de autenticación en el servidor remoto:', loginRes.raw);
        return;
    }
    const token = loginRes.data.token;
    console.log('✅ Autenticación exitosa. Token obtenido.');

    console.log(`\n📋 [2/5] Consultando vehículos actuales en el servidor...`);
    const listRes = await requestApi('GET', '/vehicles', null, token);
    if (listRes.status !== 200) {
        console.error('❌ Error al obtener vehículos:', listRes.raw);
        return;
    }

    const vehiculosActuales = listRes.data || [];
    console.log(`ℹ️ Vehículos encontrados en la nube: ${vehiculosActuales.length}`);
    vehiculosActuales.forEach(v => {
        console.log(`   - ID #${v.id} | ${v.name} (${v.brand} ${v.model}) | Placa: ${v.license_plate || v.licensePlate} | Km: ${v.odometer}`);
    });

    console.log(`\n🗑️ [3/5] Limpiando registros no deseados (ej. Toyota / pruebas)...`);
    let eliminados = 0;
    for (const v of vehiculosActuales) {
        const marca = (v.brand || '').toLowerCase();
        const nombre = (v.name || '').toLowerCase();
        const placa = (v.license_plate || v.licensePlate || '').toUpperCase();

        if (marca === 'toyota' || nombre.includes('toyota') || placa === 'PRUEBA') {
            console.log(`   ⏳ Eliminando vehículo ID #${v.id} (${v.name} - ${placa}) del servidor...`);
            const delRes = await requestApi('DELETE', `/vehicles/${v.id}`, null, token);
            if (delRes.status === 204 || delRes.status === 200) {
                console.log(`   ✅ Eliminado correctamente ID #${v.id}`);
                eliminados++;
            } else {
                console.error(`   ⚠️ No se pudo eliminar ID #${v.id}:`, delRes.status, delRes.raw);
            }
        }
    }
    if (eliminados === 0) console.log('   ℹ️ No se encontraron vehículos Toyota o de prueba para eliminar.');

    console.log(`\n🏍️ [4/5] Verificando presencia de la Moto Bera (${VEHICULO_A_AGREGAR.licensePlate})...`);
    // Refrescar lista desde el servidor
    const checkRes = await requestApi('GET', '/vehicles', null, token);
    const listaActualizada = checkRes.data || [];
    const beraExistente = listaActualizada.find(v => 
        (v.license_plate || v.licensePlate) === VEHICULO_A_AGREGAR.licensePlate || 
        ((v.brand || '') === VEHICULO_A_AGREGAR.brand && (v.model || '') === VEHICULO_A_AGREGAR.model)
    );

    if (!beraExistente) {
        console.log(`   ⏳ Agregando nueva ${VEHICULO_A_AGREGAR.name} a la nube...`);
        const addRes = await requestApi('POST', '/vehicles', VEHICULO_A_AGREGAR, token);
        if (addRes.status === 201 || addRes.status === 200) {
            console.log(`   ✅ Vehículo agregado exitosamente al servidor remoto con ID #${addRes.data.id}`);
        } else {
            console.error(`   ❌ Error agregando vehículo:`, addRes.status, addRes.raw);
        }
    } else {
        console.log(`   ✅ La Moto Bera ya está registrada en el servidor remoto con ID #${beraExistente.id}`);
    }

    console.log(`\n🔎 [5/5] Estado FINAL del inventario en el Servidor Remoto:`);
    const finalRes = await requestApi('GET', '/vehicles', null, token);
    const listaFinal = finalRes.data || [];
    listaFinal.forEach(v => {
        console.log(`   ⭐ ID #${v.id} | ${v.name} | Placa: ${v.license_plate || v.licensePlate} | Odómetro: ${v.odometer} km | Tipo: ${v.type}`);
    });
    console.log(`\n🚀 Sincronización del servidor remoto completada con éxito.\n`);
}

// Ejecutar script
ajustarServidorRemoto();
