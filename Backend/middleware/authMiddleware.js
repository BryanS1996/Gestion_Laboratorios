const jwt = require('jsonwebtoken');
require('dotenv').config();

const authMiddleware = (allowedRoles = []) => {
  return (req, res, next) => {

    // 🔧 DEV BYPASS
    if (process.env.DEV_BYPASS_AUTH === 'true') {
     req.user = {
      uid: 'dev-prof',
      email: 'profesor@dev.local',
      role: 'professor',
      displayName: 'Profesor Dev',
      nombre: 'Profesor Dev',
    };

      // If role restrictions exist, they are respected
      if (allowedRoles.length > 0 && !allowedRoles.includes(req.user.role)) {
        return res.status(403).json({ error: 'Prohibido (DEV)' });
      }

      return next();
    }

    // Normal Flow
    const authHeader = req.headers.authorization || '';
    const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;

    if (!token) {
      return res.status(401).json({ error: 'No autorizado: Falta token' });
    }

    try {
      const jwtSecret = process.env.JWT_SECRET || 'tu_clave_secreta_super_segura';
      const decoded = jwt.verify(token, jwtSecret);

      req.user = {
        uid: decoded.uid,
        email: decoded.email,
        role: (decoded.role || 'student').toLowerCase(), // ✅ normalizer
        displayName: decoded.displayName,
        nombre: decoded.nombre || decoded.displayName || 'Usuario', // ✅ para mailer
      };

      if (!allowedRoles || allowedRoles.length === 0) {
        return next();
      }

      if (!req.user.role || !allowedRoles.includes(req.user.role)) {
        return res.status(403).json({ error: 'Prohibido: No tienes permisos suficientes' });
      }

      return next();
    } catch (error) {
      console.error('Error de autenticación JWT:', error.message);
      return res.status(401).json({ error: 'Token inválido o expirado' });
    }
  };
};

module.exports = authMiddleware;