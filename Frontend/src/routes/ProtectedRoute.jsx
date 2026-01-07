import { Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth.js';

// Componente para rutas protegidas
const ProtectedRoute = ({ children, requiredRole }) => {
  const { user, loading, isAuthenticated } = useAuth();

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">Cargando...</div>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  if (requiredRole && user.role !== requiredRole) {
    return <Navigate to="/catalogo" replace />;
  }

  return children;
};

export default ProtectedRoute;