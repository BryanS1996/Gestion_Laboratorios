const admin = require('../firebaseAdmin');

// 👥 Obtener usuarios de Firebase Auth
const getFirebaseUsers = async (req, res) => {
  try {
    const maxResults = parseInt(req.query.maxResults) || 100;
    let allUsers = [];
    let pageToken = undefined;

    // Obtener usuarios en lotes de hasta 1000
    do {
      const result = await admin.auth().listUsers(maxResults, pageToken);
      
      allUsers = allUsers.concat(result.users.map(user => ({
        uid: user.uid,
        email: user.email,
        displayName: user.displayName || 'Sin nombre',
        createdAt: user.metadata.creationTime,
        lastSignInTime: user.metadata.lastSignInTime,
        emailVerified: user.emailVerified,
        disabled: user.disabled
      })));

      pageToken = result.pageToken;
    } while (pageToken);

    res.status(200).json({ 
      totalUsers: allUsers.length,
      usuarios: allUsers 
    });
  } catch (error) {
    console.error('Error obteniendo usuarios de Firebase:', error);
    res.status(500).json({ error: 'Error al obtener usuarios de Firebase Auth' });
  }
};

module.exports = { getFirebaseUsers };
