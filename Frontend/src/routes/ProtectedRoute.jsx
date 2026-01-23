import { Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

const ProtectedRoute = ({ children, requiredRole }) => {
  const { user, loading } = useAuth();

  // 🔧 BYPASS SOLO EN DESARROLLO
  const isDevBypass = import.meta.env.VITE_DEV_BYPASS_AUTH === 'true';
  if (isDevBypass) {
    return children;
  }

  // ⏳ ESPERAR A FIREBASE + BACKEND
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        Cargando...
      </div>
    );
  }

  // ❌ NO AUTENTICADO (solo cuando loading terminó)
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // ⛔ ROL INCORRECTO
  if (requiredRole && user.role !== requiredRole) {
    return <Navigate to="/catalogo" replace />;
  }
  
  return children;
};

export default ProtectedRoute;
