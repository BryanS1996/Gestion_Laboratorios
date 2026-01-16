const admin = require('../firebaseAdmin');

/**
 * =========================================================
 * 🔐 CAMINO A
 * Firebase Login → Backend aware
 * =========================================================
 * - Recibe Firebase ID Token (Authorization: Bearer ...)
 * - Verifica token con Firebase Admin
 * - Extrae uid, email
 * - Aquí luego se crea / sincroniza el usuario en MongoDB
 * - Devuelve user + (opcional) JWT
 */
const firebaseLogin = async (req, res) => {
  try {
    const authHeader = req.headers.authorization || '';
    const idToken = authHeader.startsWith('Bearer ')
      ? authHeader.slice(7)
      : null;

    if (!idToken) {
      return res.status(401).json({ error: 'Missing Bearer token' });
    }

    // 🔐 Verificar token con Firebase Admin
    const decodedToken = await admin.auth().verifyIdToken(idToken);
    const { uid, email, name } = decodedToken;

    console.log('✅ [AUTH] Firebase token verificado:', email);

    /**
     * =====================================================
     * 🚧 AQUÍ VA TU LÓGICA DE MONGO (NO Firestore)
     * =====================================================
     * Ejemplo (NO implementado aún):
     *
     * let user = await User.findOne({ firebaseUid: uid });
     *
     * if (!user) {
     *   user = await User.create({
     *     firebaseUid: uid,
     *     email,
     *     role: email.endsWith('@uce.edu.ec') ? 'admin' : 'student'
     *   });
     * }
     */

    // ⚠️ Por ahora devolvemos un user "simulado"
    // (para que tu frontend redireccione bien)
    const user = {
      uid,
      email,
      displayName: name || email,
      role: email?.endsWith('@uce.edu.ec') ? 'admin' : 'student',
    };

    return res.status(200).json({
      user,
      token: null, // aquí luego puedes devolver tu JWT propio
    });
  } catch (error) {
    console.error('❌ Error en firebaseLogin:', error.message);
    return res.status(401).json({
      error: 'Invalid or expired Firebase token',
    });
  }
};

/**
 * =========================================================
 * 👥 ADMIN
 * Obtener usuarios de Firebase Auth
 * (solo para panel administrativo)
 * =========================================================
 */
const getFirebaseUsers = async (req, res) => {
  try {
    const maxResults = parseInt(req.query.maxResults) || 100;
    let allUsers = [];
    let pageToken = undefined;

    // Obtener usuarios en lotes
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

    // ⚠️ Firestore SOLO para legacy (puedes eliminar luego)
    const db = admin.firestore();

    const uids = allUsers.map((u) => u.uid);
    const chunks = [];
    for (let i = 0; i < uids.length; i += 30) {
      chunks.push(uids.slice(i, i + 30));
    }

    const roleMap = new Map();

    for (const chunk of chunks) {
      const docs = await Promise.all(
        chunk.map((uid) => db.collection('users').doc(uid).get())
      );
      for (const d of docs) {
        if (d.exists) roleMap.set(d.id, d.data().role || 'student');
      }
    }

    const usuarios = allUsers.map((u) => ({
      ...u,
      role: roleMap.get(u.uid) || 'student',
    }));

    res.status(200).json({
      totalUsers: usuarios.length,
      usuarios,
    });
  } catch (error) {
    console.error('❌ Error obteniendo usuarios de Firebase:', error);
    res.status(500).json({
      error: 'Error al obtener usuarios de Firebase Auth',
    });
  }
};

module.exports = {
  firebaseLogin,
  getFirebaseUsers,
};
