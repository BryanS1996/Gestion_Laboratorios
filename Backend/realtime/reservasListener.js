const admin = require('../firebaseAdmin');
const db = admin.firestore();

let reservasCache = [];
let ultimaActualizacion = null;

const initReservasRealtime = () => {
  console.log('🔥 Iniciando listener de reservas (Firestore Admin)');

  db.collection('reservas').onSnapshot(snapshot => {
    reservasCache = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    }));

    ultimaActualizacion = new Date();
    console.log(`✅ Reservas actualizadas (${reservasCache.length})`);
  });
};

const getReservasCache = () => ({
  reservas: reservasCache,
  updatedAt: ultimaActualizacion,
});

module.exports = {
  initReservasRealtime,
  getReservasCache,
};
