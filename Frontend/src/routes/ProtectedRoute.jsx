import { Navigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

const ProtectedRoute = ({ children, requiredRole }) => {
  const { user, jwtToken, loading, isAuthenticated } = useAuth();

  // Dev bypass
  const isDevBypass = import.meta.env.VITE_DEV_BYPASS_AUTH === "true";
  if (isDevBypass) return children;

  // Wait for auth bootstrap
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        Cargando...
      </div>
    );
  }

  // Not authenticated (use token OR user-based auth)
  // This prevents Stripe redirect -> login loop
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Role checks: only enforce when we actually have user.role
  // If we have a token but user is still loading, avoid redirect loops
  if (requiredRole) {
    if (!user?.role) {
      return (
        <div className="flex items-center justify-center min-h-screen">
          Cargando permisos...
        </div>
      );
    }

    const allowed = Array.isArray(requiredRole) ? requiredRole : [requiredRole];
    const userRole = String(user.role || "").trim().toLowerCase();
    const allowedNormalized = allowed.map((r) => String(r).trim().toLowerCase());

    if (!allowedNormalized.includes(userRole)) {
      return <Navigate to="/catalogo" replace />;
    }
  }

  return children;
};

export default ProtectedRoute;
