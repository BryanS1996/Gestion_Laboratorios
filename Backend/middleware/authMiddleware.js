const admin = require('../firebaseAdmin');

const protectRoute = (allowedRoles) => {
  return async (req, res, next) => {
    // 1. Buscamos el token en la cabecera
    const token = req.headers.authorization?.split('Bearer ')[1];
    
    if (!token) return res.status(401).json({ error: 'No autorizado: Falta token' });

    try {
      // 2. Verificamos que el token sea real
      const decodedToken = await admin.auth().verifyIdToken(token);
      const userRole = decodedToken.role || 'user'; // Si no tiene rol, es user

      // 3. Verificamos si el rol tiene permiso para entrar
      if (allowedRoles.includes(userRole)) {
        req.user = decodedToken; // Guardamos info del usuario
        next(); // ¡Pasa!
      } else {
        res.status(403).json({ error: 'Prohibido: No tienes permisos suficientes' });
      }
    } catch (error) {
      console.error('Error de autenticación:', error);
      res.status(401).json({ error: 'Token inválido o expirado' });
    }
  };
};

module.exports = protectRoute;