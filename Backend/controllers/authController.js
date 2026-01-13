const admin = require('../firebaseAdmin');
const db = admin.firestore();

// 👥 Obtener usuarios de Firebase Auth (+ rol desde Firestore si existe)
const getFirebaseUsers = async (req, res) => {
  try {
    const maxResults = parseInt(req.query.maxResults) || 100;
    let allUsers = [];
    let pageToken = undefined;

    // Obtener usuarios en lotes de hasta 1000
    do {
      const result = await admin.auth().listUsers(maxResults, pageToken);

      allUsers = allUsers.concat(
        result.users.map((user) => ({
          uid: user.uid,
          email: user.email,
          displayName: user.displayName || 'Sin nombre',
          createdAt: user.metadata.creationTime,
          lastSignInTime: user.metadata.lastSignInTime,
          emailVerified: user.emailVerified,
          disabled: user.disabled,
        }))
      );

      pageToken = result.pageToken;
    } while (pageToken);

    // Enriquecer con roles desde Firestore (si hay doc en users/{uid})
    const uids = allUsers.map((u) => u.uid);
    const chunks = [];
    for (let i = 0; i < uids.length; i += 30) chunks.push(uids.slice(i, i + 30));

    const roleMap = new Map();
    for (const chunk of chunks) {
      const docs = await Promise.all(chunk.map((uid) => db.collection('users').doc(uid).get()));
      for (const d of docs) {
        if (d.exists) roleMap.set(d.id, d.data().role || 'student');
      }
    }

    const usuarios = allUsers.map((u) => ({ ...u, role: roleMap.get(u.uid) || 'student' }));

    res.status(200).json({ 
      totalUsers: usuarios.length,
      usuarios
    });
  } catch (error) {
    console.error('Error obteniendo usuarios de Firebase:', error);
    res.status(500).json({ error: 'Error al obtener usuarios de Firebase Auth' });
  }
};

module.exports = { getFirebaseUsers };
