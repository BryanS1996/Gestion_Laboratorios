import { Routes, Route, Navigate } from 'react-router-dom';
import Login from '../pages/auth/Login';
import Register from '../pages/auth/Register';

import AdminDashboard from '../pages/admin/dashboard';
import Users from '../pages/admin/Users';
import Configuracion from '../pages/admin/Configuracion';

import Catalog from '../pages/Catalog';
import StudentReservations from '../pages/StudentReservations';
import Reportes from '../pages/Reportes';
import ProtectedRoute from './ProtectedRoute';

// ✅ Layout con sidebar
import AppLayout from '../components/AppLayout';

const AppRoutes = () => {
  return (
    <Routes>
      {/* Ruta raíz redirige al login */}
      <Route path="/" element={<Navigate to="/login" replace />} />

      {/* Rutas públicas */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      {/* ✅ Grupo de rutas privadas CON SIDEBAR */}
      <Route
        element={
          <ProtectedRoute>
            <AppLayout />
          </ProtectedRoute>
        }
      >
        {/* Catálogo para profesores y estudiantes */}
        <Route path="/catalogo" element={<Catalog />} />

        {/* Mis reservas (solo student) */}
        <Route
          path="/mis-reservas"
          element={
            <ProtectedRoute requiredRole="student">
              <StudentReservations />
            </ProtectedRoute>
          }
        />

        {/* Reportes (solo student) */}
        <Route
          path="/reportes"
          element={
            <ProtectedRoute requiredRole="student">
              <Reportes />
            </ProtectedRoute>
          }
        />

        {/* Admin */}
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
        <Route path="/admin" element={<Navigate to="/admin/dashboard" replace />} />
      </Route>

      {/* Ruta por defecto */}
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
};

export default AppRoutes;
