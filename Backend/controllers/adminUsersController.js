const admin = require('firebase-admin');
const { getFirestore } = require('firebase-admin/firestore');
const Reporte = require('../models/Reporte');

const db = getFirestore();

const getAdminUsers = async (req, res) => {
  try {
    // 1) Users from Firebase Auth
    const listUsers = await admin.auth().listUsers();

    const users = await Promise.all(
      listUsers.users.map(async (authUser) => {
        const uid = authUser.uid;

        // 2️ User data in Firestore
        const userDoc = await db.collection('users').doc(uid).get();
        const userData = userDoc.exists ? userDoc.data() : {};

        // 3️ Count reservs (Firestore)
        const reservasSnap = await db
          .collection('reservas')
          .where('userId', '==', uid)
          .get();

        // 4️ Count reports (Mongo)
        const reportesCount = await Reporte.countDocuments({ userId: uid });

        return {
          uid,
          email: authUser.email,
          // Prioritize Custom Claims as source of truth for role
          role: authUser.customClaims?.role || userData.role || 'student',
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

    // Update Firebase Custom Claims (source of truth)
    await admin.auth().setCustomUserClaims(uid, { role });

    // Also update Firestore for consistency
    const userRef = db.collection('users').doc(uid);
    const userDoc = await userRef.get();

    if (userDoc.exists) {
      await userRef.update({ role, updatedAt: new Date() });
    } else {
      // Create user document if it doesn't exist
      await userRef.set({ role, createdAt: new Date(), updatedAt: new Date() });
    }

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
