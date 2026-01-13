import { Routes, Route, Navigate } from 'react-router-dom';
import Login from '../pages/auth/Login';
import Register from '../pages/auth/Register';
import AdminDashboard from '../pages/admin/dashboard';
import Users from '../pages/admin/Users';
import Configuracion from '../pages/admin/Configuracion';
import Catalog from '../pages/Catalog';
import StudentReservations from '../pages/StudentReservations';
import ProtectedRoute from './ProtectedRoute';

const AppRoutes = () => {
  return (
    <Routes>
      {/* Ruta raíz redirige al login */}
      <Route path="/" element={<Navigate to="/login" replace />} />

      {/* Ruta del Login */}
      <Route path="/login" element={<Login />} />

      {/* Ruta del Registro */}
      <Route path="/register" element={<Register />} />

      {/* Rutas Protegidas - Admin */}
      <Route
        path="/admin/dashboard"
        element={
          <ProtectedRoute requiredRole="admin">
            <AdminDashboard />
          </ProtectedRoute>
        }
      />

      <Route
        path="/admin/usuarios"
        element={
          <ProtectedRoute requiredRole="admin">
            <Users />
          </ProtectedRoute>
        }
      />

      <Route
        path="/admin/configuracion"
        element={
          <ProtectedRoute requiredRole="admin">
            <Configuracion />
          </ProtectedRoute>
        }
      />

      {/* Ruta por defecto para /admin redirige al dashboard */}
      <Route
        path="/admin"
        element={<Navigate to="/admin/dashboard" replace />}
      />

      {/* Catálogo para profesores y estudiantes */}
      <Route
        path="/catalogo"
        element={
          <ProtectedRoute>
            <Catalog />
          </ProtectedRoute>
        }
      />

      {/* Mis reservas (solo student) */}
      <Route
        path="/mis-reservas"
        element={
          <ProtectedRoute requiredRole="student">
            <StudentReservations />
          </ProtectedRoute>
        }
      />

      {/* Ruta por defecto - redirige al login */}
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
};

export default AppRoutes;