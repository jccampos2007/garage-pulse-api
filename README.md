# GaragePulse API REST

API REST backend para el ecosistema GaragePulse. Permite sincronizar los datos de la aplicación móvil (bajo una arquitectura Offline-First) con la nube, manejando perfiles de usuario, vehículos y una bitácora de mantenimiento y salud predictiva.

## Requisitos

- Node.js (v14 o superior recomendado)
- npm

## Instalación

1. Instala las dependencias del proyecto:
   ```bash
   npm install
   ```

2. Configura tus variables de entorno creando (o editando) un archivo `.env` en la raíz del proyecto:
   ```env
   PORT=3000
   JWT_SECRET=tu_secreto_seguro_generado_aqui
   ```

## Base de Datos

El sistema utiliza **SQLite** (`database.sqlite`) para un despliegue rápido y liviano sin dependencias externas. 
La base de datos y sus tablas se inicializarán automáticamente la primera vez que arranques el servidor:
- `user_profiles`: Gestión del conductor y preferencias globales.
- `vehicles`: Flota de automóviles y/o motocicletas.
- `service_logs`: Bitácora granular de mantenimientos.

## Arrancar el Servidor

Para levantar la API, simplemente ejecuta:
```bash
node index.js
```
El servidor escuchará de forma predeterminada en el puerto `3000` (Ej. `http://localhost:3000`).

## Catálogo de Endpoints

### 🔐 Autenticación (`/api/auth`)
- `POST /register`: Onboarding inicial. Crea un usuario junto a su primer vehículo obligatoriamente y retorna el token JWT.
- `POST /login`: Inicia sesión con `email` y `password` para obtener un token de acceso JWT.

### 👤 Perfil del Conductor (`/api/user`) *Requiere Auth*
- `GET /profile`: Retorna la información y ajustes (Premium, unidades, etc.) del usuario.
- `PUT /profile`: Modifica ajustes o el nombre.

### 🚗 Vehículos (`/api/vehicles`) *Requiere Auth*
- `GET /`: Lista toda la flota de vehículos del conductor.
- `POST /`: Registra un nuevo vehículo al garaje general.
- `PUT /:id`: Actualiza métricas del vehículo (como el odómetro de forma manual).
- `DELETE /:id`: Elimina un vehículo y cascadea sus servicios.
- `GET /:vehicleId/services`: Extrae la bitácora particular de un único vehículo.

### 🛠️ Mantenimiento (`/api/services`) *Requiere Auth*
- `GET /`: Historial acumulado de todos los servicios. Permite queries de filtrado (`?category=...`, `?type=...`).
- `POST /`: Registra un nuevo mantenimiento (preventivo o reparación). Si el `mileage` del servicio supera al actual, **actualiza automáticamente** el odómetro global del vehículo.
- `DELETE /:id`: Cancela una entrada histórica de la bitácora.

## Seguridad JWT

Toda ruta protegida (marcada como *Requiere Auth*) debe recibir el token mediante la cabecera `Authorization`:
```http
Authorization: Bearer <TU_TOKEN_JWT>
```

---
*GaragePulse: Telemetría y Salud Predictiva en tu bolsillo.*
