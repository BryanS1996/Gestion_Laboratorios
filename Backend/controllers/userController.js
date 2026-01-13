const admin = require('../firebaseAdmin');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const db = admin.firestore();

// 🔍 Función auxiliar para determinar el rol basándose en el email
const detectarRol = (email) => {
  const emailLower = email.toLowerCase();
  
  if (emailLower.includes('admin')) return 'admin';
  if (emailLower.includes('profesor') || emailLower.includes('profe') || emailLower.includes('teacher')) return 'professor';
  
  return 'student'; // Por defecto
};

// 🔐 REGISTRO: Crear usuario en Firebase Auth + Firestore
const registerUser = async (req, res) => {
  const { email, password, displayName, role: specifiedRole } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email y password son requeridos' });
  }

  try {
    console.log('📝 Registrando usuario:', email);
    
    // 1. Crear usuario en Firebase Auth
    const userRecord = await admin.auth().createUser({
      email,
      password,
      displayName: displayName || email.split('@')[0],
      emailVerified: false
    });

    console.log('✅ Usuario creado en Firebase Auth. UID:', userRecord.uid);

    // 2. Determinar el rol (manual si se proporciona, sino detectar del email)
    const role = specifiedRole || detectarRol(email);
    console.log('🔐 Rol asignado:', role);

    // 3. Crear documento en Firestore con el usuario y su rol
    await db.collection('users').doc(userRecord.uid).set({
      uid: userRecord.uid,
      email,
      displayName: displayName || email.split('@')[0],
      role,
      createdAt: new Date(),
      updatedAt: new Date()
    });

    console.log('✅ Usuario registrado en Firestore');

    res.status(201).json({ 
      message: 'Usuario registrado exitosamente',
      user: { 
        uid: userRecord.uid, 
        email, 
        displayName: displayName || email.split('@')[0],
        role 
      }
    });
  } catch (error) {
    console.error('❌ Error registrando usuario:', error.message);
    if (error.code === 'auth/email-already-exists') {
      return res.status(400).json({ error: 'El email ya está registrado' });
    }
    res.status(500).json({ error: 'Error al registrar usuario: ' + error.message });
  }
};

// 🔐 LOGIN: Validar Firebase Token y generar JWT propio
const login = async (req, res) => {
  const { idToken } = req.body;

  if (!idToken) {
    return res.status(400).json({ error: 'ID Token de Firebase es requerido' });
  }

  try {
    console.log('📝 Login request recibido');
    
    // 1. Verificar que el Firebase ID Token sea válido
    console.log('🔍 Verificando Firebase ID Token...');
    const decodedToken = await admin.auth().verifyIdToken(idToken);
    const { uid, email } = decodedToken;
    console.log('✅ Firebase ID Token válido. UID:', uid, 'Email:', email);

    // 2. Obtener datos del usuario desde Firestore
    console.log('📚 Consultando Firestore para UID:', uid);
    const userDoc = await db.collection('users').doc(uid).get();
    
    let userData;
    if (!userDoc.exists) {
      console.log('⚠️  Usuario no existe en Firestore. Creando automáticamente...');
      // Si el usuario no existe, crear registro automáticamente
      const role = detectarRol(email);
      userData = {
        uid,
        email,
        displayName: email.split('@')[0],
        role,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      await db.collection('users').doc(uid).set(userData);
      console.log('✅ Usuario creado automáticamente en Firestore. Rol:', role);
    } else {
      userData = userDoc.data();
      console.log('✅ Usuario encontrado en Firestore. Rol:', userData.role);
    }

    // 3. Generar JWT propio
    console.log('🔐 Generando JWT...');
    const jwtSecret = process.env.JWT_SECRET || 'tu_clave_secreta_super_segura';
    
    const token = jwt.sign(
      {
        uid,
        email,
        role: userData.role,
        displayName: userData.displayName
      },
      jwtSecret,
      { expiresIn: '24h' }
    );
    console.log('✅ JWT generado exitosamente');

    // 4. Responder con JWT y datos del usuario
    res.status(200).json({
      token,
      user: {
        uid,
        email,
        displayName: userData.displayName,
        role: userData.role
      }
    });
  } catch (error) {
    console.error('❌ Error en login:', error.message);
    res.status(401).json({ error: 'Token inválido o expirado: ' + error.message });
  }
};

// 👤 Obtener perfil del usuario actual
const getProfile = async (req, res) => {
  try {
    const uid = req.user.uid;
    const userDoc = await db.collection('users').doc(uid).get();

    if (!userDoc.exists) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    res.status(200).json({ user: userDoc.data() });
  } catch (error) {
    console.error('Error obteniendo perfil:', error);
    res.status(500).json({ error: 'Error al obtener perfil' });
  }
};

// ✏️ Actualizar perfil del usuario
const updateProfile = async (req, res) => {
  try {
    const uid = req.user.uid;
    const { displayName } = req.body;

    if (!displayName) {
      return res.status(400).json({ error: 'displayName es requerido' });
    }

    await db.collection('users').doc(uid).update({
      displayName,
      updatedAt: new Date()
    });

    res.status(200).json({ message: 'Perfil actualizado exitosamente' });
  } catch (error) {
    console.error('Error actualizando perfil:', error);
    res.status(500).json({ error: 'Error al actualizar perfil' });
  }
};

// 🔧 Cambiar rol de un usuario (Solo admin)
const changeUserRole = async (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Solo administradores pueden cambiar roles' });
  }

  const uid = req.params.uid || req.body.uid;
  const newRole = req.body.newRole;
  const validRoles = ['admin', 'professor', 'student'];

  if (!validRoles.includes(newRole)) {
    return res.status(400).json({ error: 'Rol inválido' });
  }

  try {
    await db.collection('users').doc(uid).update({
      role: newRole,
      updatedAt: new Date()
    });

    res.status(200).json({ message: `Rol cambiado a ${newRole}` });
  } catch (error) {
    console.error('Error cambiando rol:', error);
    res.status(500).json({ error: 'Error al cambiar rol' });
  }
};

// 🗑️ Eliminar usuario (Solo admin) - borra en Firebase Auth y Firestore
const deleteUser = async (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Solo administradores pueden eliminar usuarios' });
  }

  const { uid } = req.params;
  if (!uid) return res.status(400).json({ error: 'uid es requerido' });

  try {
    // 1) Borrar en Firebase Auth
    await admin.auth().deleteUser(uid);

    // 2) Borrar perfil en Firestore
    await db.collection('users').doc(uid).delete();

    return res.status(200).json({ message: 'Usuario eliminado' });
  } catch (error) {
    console.error('Error eliminando usuario:', error);
    return res.status(500).json({ error: 'Error al eliminar usuario' });
  }
};

module.exports = { registerUser, login, getProfile, updateProfile, changeUserRole, deleteUser };