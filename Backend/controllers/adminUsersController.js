const admin = require('firebase-admin');
const { getFirestore } = require('firebase-admin/firestore');
const Reporte = require('../models/Reporte');

const db = getFirestore();

const getAdminUsers = async (req, res) => {
  try {
    // 1️⃣ Usuarios desde Firebase Auth
    const listUsers = await admin.auth().listUsers();

    const users = await Promise.all(
      listUsers.users.map(async (authUser) => {
        const uid = authUser.uid;

        // 2️⃣ Datos del usuario en Firestore
        const userDoc = await db.collection('users').doc(uid).get();
        const userData = userDoc.exists ? userDoc.data() : {};

        // 3️⃣ Contar reservas (Firestore)
        const reservasSnap = await db
          .collection('reservas')
          .where('userId', '==', uid)
          .get();

        // 4️⃣ Contar reportes (Mongo)
        const reportesCount = await Reporte.countDocuments({ userId: uid });

        return {
          uid,
          email: authUser.email,
          role: userData.role || authUser.customClaims?.role || 'student',
          createdAt: userData.createdAt || null,
          lastLoginAt: authUser.metadata.lastSignInTime,
          isActive: !authUser.disabled,
          reservasCount: reservasSnap.size,
          reportesCount,
        };
      })
    );

    res.json(users);
  } catch (error) {
    console.error('❌ getAdminUsers error:', error);
    res.status(500).json({ message: 'Error obteniendo usuarios' });
  }
};

const getAdminUserByUid = async (req, res) => {
  try {
    const { uid } = req.params;

    const user = await admin.auth().getUser(uid);

    res.json({
      uid: user.uid,
      email: user.email,
      role: user.customClaims?.role || 'student',
      lastLoginAt: user.metadata.lastSignInTime,
      disabled: user.disabled,
    });
  } catch (err) {
    console.error(err);
    res.status(404).json({ message: 'Usuario no encontrado' });
  }
};

const updateUserRole = async (req, res) => {
  try {
    const { uid } = req.params;
    const { role } = req.body;

    await admin.auth().setCustomUserClaims(uid, { role });

    res.json({ message: 'Rol actualizado correctamente' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error actualizando rol' });
  }
};

module.exports = {
  getAdminUsers,
  getAdminUserByUid,
  updateUserRole,
};
