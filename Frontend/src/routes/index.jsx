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

// Layouts
import AppLayout from '../components/AppLayout';
import AdminLayout from '../components/admin/AdminLayout'; // 👈 asegúrate de tenerlo

const AppRoutes = () => {
  return (
    <Routes>
      {/* Ruta raíz */}
      <Route path="/" element={<Navigate to="/login" replace />} />

      {/* Públicas */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      {/* 🟦 RUTAS USUARIO / ESTUDIANTE */}
      <Route
        element={
          <ProtectedRoute>
            <AppLayout />
          </ProtectedRoute>
        }
      >
        <Route path="/catalogo" element={<Catalog />} />

        <Route
          path="/mis-reservas"
          element={
            <ProtectedRoute requiredRole="student">
              <StudentReservations />
            </ProtectedRoute>
          }
        />

        <Route
          path="/reportes"
          element={
            <ProtectedRoute requiredRole="student">
              <Reportes />
            </ProtectedRoute>
          }
        />
      </Route>

      {/* 🟥 RUTAS ADMIN (SIN AppLayout) */}
      <Route
        path="/admin"
        element={
          <ProtectedRoute requiredRole="admin">
            <AdminLayout />
          </ProtectedRoute>
        }
      >
        <Route path="dashboard" element={<AdminDashboard />} />
        <Route path="usuarios" element={<Users />} />
        <Route path="configuracion" element={<Configuracion />} />
        <Route index element={<Navigate to="dashboard" replace />} />
      </Route>

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
};

export default AppRoutes;
