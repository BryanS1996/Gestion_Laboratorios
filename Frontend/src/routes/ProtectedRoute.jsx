import { Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

const ProtectedRoute = ({ children, requiredRole }) => {
  const { user, loading } = useAuth();

  // 🔧 BYPASS SOLO EN DESARROLLO
  const isDevBypass = import.meta.env.VITE_DEV_BYPASS_AUTH === 'true';
  if (isDevBypass) return children;

  // ⏳ Esperar a que cargue auth completo
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        Cargando...
      </div>
    );
  }
  
  console.log('USER ROLE =>', user?.role);
  // ❌ No autenticado
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // ✅ Si la ruta pide rol, pero aún no está definido, NO redirigir: esperar
  if (requiredRole && !user.role) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        Cargando permisos...
      </div>
    );
  }

  // ⛔ Rol incorrecto (normalizado)
  if (requiredRole) {
    const allowed = Array.isArray(requiredRole) ? requiredRole : [requiredRole];

    const userRole = String(user.role || '').trim().toLowerCase();
    const allowedNormalized = allowed.map(r => String(r).trim().toLowerCase());

    if (!allowedNormalized.includes(userRole)) {
      return <Navigate to="/catalogo" replace />;
    }
  }

  return children;
};

export default ProtectedRoute;
