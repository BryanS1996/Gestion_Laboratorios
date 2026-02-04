const admin = require('firebase-admin');
require('dotenv').config();

try {
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY 
        ? process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n') 
        : undefined,
    }),
  });
  
  console.log('Firebase Admin inicializado correctamente.');
  
} catch (error) {
  console.error('Error inicializando Firebase Admin:', error.message);
  process.exit(1); 
}

module.exports = admin;