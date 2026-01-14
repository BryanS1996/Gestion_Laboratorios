const mongoose = require('mongoose');

// Lógica de selección:
// 1. Si existe process.env.MONGO_URI (Viene de Docker), usa esa.
// 2. Si no, usa la cadena local con localhost.
const MONGO_URI = process.env.MONGO_URI || 'mongodb://admin:admin123@localhost:27017/gestion_laboratorios?authSource=admin';

const connectDB = async () => {
  try {
    // Opciones recomendadas para evitar advertencias antiguas (aunque Mongoose 6+ ya las maneja bien)
    await mongoose.connect(MONGO_URI);

    const entorno = MONGO_URI.includes('localhost') ? '🖥️ LOCALHOST' : '🐳 DOCKER CONTAINER';
    console.log(`\n🍃 MongoDB Conectado exitosamente`);
    console.log(`   └─ Entorno detectado: ${entorno}`);
    
  } catch (error) {
    console.error('\n❌ Error CRÍTICO conectando a MongoDB:');
    console.error(`   └─ Motivo: ${error.message}`);
    // No matamos el proceso (process.exit) para que el servidor siga vivo 
    // y pueda responder a otras peticiones (ej: Firebase) aunque falle Mongo.
  }
};

module.exports = connectDB;