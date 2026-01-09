const jwt = require('jsonwebtoken');
require('dotenv').config();

/**
 * Middleware de protección por JWT (emitido por este backend).
 *
 * Uso:
 *  - authMiddleware() => solo autenticación (cualquier rol)
 *  - authMiddleware(['admin']) => autenticación + roles permitidos
 */
const authMiddleware = (allowedRoles = []) => {
  return (req, res, next) => {
    const authHeader = req.headers.authorization || '';
    const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;

    if (!token) {
      return res.status(401).json({ error: 'No autorizado: Falta token' });
    }

    try {
      const jwtSecret = process.env.JWT_SECRET || 'tu_clave_secreta_super_segura';
      const decoded = jwt.verify(token, jwtSecret);

      // Normalizamos campos esperados
      req.user = {
        uid: decoded.uid,
        email: decoded.email,
        role: decoded.role,
        displayName: decoded.displayName,
      };

      // Si no se especifican roles, basta con estar autenticado
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
