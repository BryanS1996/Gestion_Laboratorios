import { Routes, Route, Navigate } from "react-router-dom";

// Auth
import Login from "../features/auth/pages/LoginPage";
import Register from "../features/auth/pages/RegisterPage";

// Admin pages - Direct import from features
import DashboardPage from "../features/admin/dashboard/pages/DashboardPage";
import UsersPage from "../features/admin/users/pages/UsersPage";
import ReportesAdminPage from "../features/admin/reportes/pages/ReportesAdminPage";
import ConfiguracionPage from "../features/admin/config/pages/ConfiguracionPage";
import EditUserPage from "../features/admin/user-edit/pages/EditUserPage";
import AdminLaboratoriosPage from "../features/admin/laboratorios/pages/AdminLaboratoriosPage";

// Student pages - Direct import from features
import CatalogPage from "../features/catalog/pages/CatalogPage";
import MyReservationsPage from "../features/my-reservations/pages/MyReservationsPage";
import ReportesPage from "../features/reportes/pages/ReportesPage";

// Payment success page - Direct import from features
import PagoExitosoPage from "../features/payments/pages/PagoExitosoPage";

// Layouts
import AppLayout from "../components/AppLayout";
import AdminLayout from "../components/admin/AdminLayout";

// Guard
import ProtectedRoute from "./ProtectedRoute";

const AppRoutes = () => {
  return (
    <Routes>
      {/* Root */}
      <Route path="/" element={<Navigate to="/login" replace />} />

      {/* Públicas */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      {/* Stripe success redirect (PUBLIC) */}
      <Route path="/pago-exitoso" element={<PagoExitosoPage />} />

      {/* USUARIO / ESTUDIANTE */}
      <Route
        element={
          <ProtectedRoute>
            <AppLayout />
          </ProtectedRoute>
        }
      >
        <Route path="/catalogo" element={<CatalogPage />} />

        <Route
          path="/mis-reservas"
          element={
            <ProtectedRoute requiredRole={["student", "professor"]}>
              <MyReservationsPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/reportes"
          element={
            <ProtectedRoute requiredRole={["student", "professor"]}>
              <ReportesPage />
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
        <Route path="dashboard" element={<DashboardPage />} />
        <Route path="usuarios" element={<UsersPage />} />
        <Route path="usuarios/:uid" element={<EditUserPage />} />
        <Route path="laboratorios" element={<AdminLaboratoriosPage />} />
        <Route path="reportes" element={<ReportesAdminPage />} />
        <Route path="configuracion" element={<ConfiguracionPage />} />
      </Route>

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
};

export default AppRoutes;
