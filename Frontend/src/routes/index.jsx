import { Routes, Route, Navigate } from 'react-router-dom';

// Auth
import Login from '../pages/auth/Login';
import Register from '../pages/auth/Register';

// Admin pages
import AdminDashboard from '../pages/admin/dashboard';
import Users from '../pages/admin/Users';
import ReportesAdmin from '../pages/admin/ReportesAdmin';
import Configuracion from '../pages/admin/Configuracion';
import EditUser from '../pages/admin/EditUser';
import AdminLaboratorios from '../pages/admin/AdminLaboratorios';

// Student pages
import Catalog from '../pages/Catalog';
import StudentReservations from '../pages/MyReservations';
import Reportes from '../pages/Reportes';

// Layouts
import AppLayout from '../components/AppLayout';
import AdminLayout from '../components/admin/AdminLayout';

// Guard
import ProtectedRoute from './ProtectedRoute';

const AppRoutes = () => {
  return (
    <Routes>
      {/* Root */}
      <Route path="/" element={<Navigate to="/login" replace />} />

      {/* Públicas */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      {/* 🟦 USUARIO / ESTUDIANTE */}
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
            <ProtectedRoute requiredRole={['student', 'professor']}>
              <StudentReservations />
            </ProtectedRoute>
          }
        />

        <Route
          path="/reportes"
          element={
            <ProtectedRoute requiredRole={['student', 'professor']}>
              <Reportes />
            </ProtectedRoute>
          }
        />
      </Route>

      {/* 🟥 ADMIN */}
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
        <Route path="usuarios/:uid" element={<EditUser />} />
        <Route path="laboratorios" element={<AdminLaboratorios />} />
        <Route path="reportes" element={<ReportesAdmin />} />
        <Route path="configuracion" element={<Configuracion />} />
      </Route>

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
};

export default AppRoutes;
