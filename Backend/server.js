const express = require('express');
const cors = require('cors');
require('dotenv').config();

// 1. IMPORTAR CONEXIÓN A MONGO
const connectMongo = require('./config/mongo');

// --- IMPORTS DE RUTAS ---
const userRoutes = require('./routes/userRoutes');
const laboratoriosRoutes = require('./routes/laboratorios.routes');
const reservasRoutes = require('./routes/reservas.routes');
const reportesRoutes = require('./routes/reportes.routes');
const adminRoutes = require('./routes/admin.routes');
const dashboardRoutes = require('./routes/dashboard.routes');
const authRoutes = require('./routes/auth.routes');

// IMPORTS DE STRIPE
const stripeWebhook = require('./routes/stripe.webhook'); // Lógica del Webhook
const stripeRoutes = require('./routes/stripe.routes');   // Lógica del Checkout (Pago)

const app = express();
const PORT = process.env.PORT || 5000;

// --- MIDDLEWARES GLOBALES ---
app.use(cors()); // CORS siempre primero para evitar bloqueos

// ⚠️ 1. RUTA DEL WEBHOOK (VA PRIMERO)
// IMPORTANTE: Esta ruta debe ir ANTES de express.json() porque Stripe necesita recibir
// los datos "crudos" (raw) para verificar la firma de seguridad.
app.use('/api/stripe', stripeWebhook); 

// --- PARSEADORES DE BODY ---
// A partir de aquí, Express convertirá todo a JSON
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 2. CONECTAR A MONGODB (Se ejecuta al iniciar)
connectMongo();

// Logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// --- API ROUTES ---
app.use('/api/users', userRoutes);
app.use('/api/laboratorios', laboratoriosRoutes);
app.use('/api/reservas', reservasRoutes);
app.use('/api/reportes', reportesRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/auth', authRoutes);

// ⚠️ 2. RUTA DE CHECKOUT (VA DESPUÉS DE JSON)
// Esta ruta usa JSON ({ laboratorioId, fecha... }) así que DEBE ir después de express.json()
// y ANTES del manejador 404.
app.use('/api/stripe', stripeRoutes); 

// Root endpoint
app.get('/api', (req, res) => {
  res.json({ 
    message: 'Laboratorios API',
    version: '1.0.0',
    endpoints: {
      users: '/api/users',
      laboratorios: '/api/laboratorios',
      reservas: '/api/reservas',
      reportes: '/api/reportes',
      admin: '/api/admin',
      stripe: '/api/stripe'
    }
  });
});

// --- MANEJO DE ERRORES ---

// 404 handler (Ruta no encontrada)
// Este middleware debe ser el penúltimo. Si la petición llega aquí, es que ninguna ruta anterior respondió.
app.use((req, res) => {
  res.status(404).json({ 
    error: 'Endpoint not found',
    path: req.path,
    method: req.method 
  });
});

// Error handling middleware (Errores de servidor)
app.use((err, req, res, next) => {
  console.error('Error:', err.message);
  res.status(err.status || 500).json({
    error: err.message || 'Internal Server Error',
    timestamp: new Date().toISOString()
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`\n✅ Servidor backend ejecutándose en http://localhost:${PORT}`);
  console.log(`📚 API disponible en http://localhost:${PORT}/api\n`);
});

module.exports = app;