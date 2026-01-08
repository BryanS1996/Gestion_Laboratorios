const admin = require('firebase-admin');
require('dotenv').config(); // Importante para leer las variables aquí mismo

try {
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      // El reemplazo de \\n es vital para que funcione la clave privada
      privateKey: process.env.FIREBASE_PRIVATE_KEY 
        ? process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n') 
        : undefined,
    }),
  });
  
  console.log('Firebase Admin inicializado correctamente.');
  
} catch (error) {
  console.error('Error inicializando Firebase Admin:', error.message);
  // Si falla esto, el servidor no debería arrancar, así que es correcto salir.
  process.exit(1); 
}

module.exports = admin;