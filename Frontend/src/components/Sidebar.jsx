import { NavLink, useNavigate } from "react-router-dom";
import { LayoutGrid, CalendarCheck, FileText, LogOut, Shield } from "lucide-react";
import { useAuth } from "../hooks/useAuth";

const base =
  "flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-medium transition-colors";
const active = "bg-blue-600 text-white shadow-sm";
const inactive = "text-slate-600 hover:bg-slate-100";

export default function Sidebar() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const handleLogout = async () => {
    await logout();
    navigate("/login", { replace: true });
  };

  return (
    <aside className="w-72 bg-white border-r border-slate-200 px-4 py-6 flex flex-col">
      {/* Logo */}
      <div className="flex items-center gap-3 px-3 mb-6">
        <div className="bg-blue-600 w-11 h-11 rounded-2xl flex items-center justify-center text-white font-bold">
          FI
        </div>
        <div>
          <p className="font-semibold text-slate-800">Sistema de Laboratorios</p>
          <p className="text-xs text-slate-500">Facultad de Ingeniería</p>
        </div>
      </div>

      {/* User */}
      <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 mb-6">
        <p className="text-xs text-slate-500">Sesión</p>
        <p className="text-sm font-semibold text-slate-800 truncate">
          {user?.email || "Usuario"}
        </p>
        <p className="text-xs text-slate-500 mt-1">
          Rol: <span className="font-medium">{user?.role || "student"}</span>
        </p>
      </div>

      {/* Links */}
      <nav className="flex-1 space-y-2">
        <NavLink
          to="/catalogo"
          className={({ isActive }) => `${base} ${isActive ? active : inactive}`}
        >
          <LayoutGrid className="w-5 h-5" />
          Catálogo
        </NavLink>

        <NavLink
          to="/mis-reservas"
          className={({ isActive }) => `${base} ${isActive ? active : inactive}`}
        >
          <CalendarCheck className="w-5 h-5" />
          Mis Reservas
        </NavLink>

        <NavLink
          to="/reportes"
          className={({ isActive }) => `${base} ${isActive ? active : inactive}`}
        >
          <FileText className="w-5 h-5" />
          Mis Reportes
        </NavLink>

        {user?.role === "admin" && (
          <NavLink
            to="/admin/dashboard"
            className={({ isActive }) => `${base} ${isActive ? active : inactive}`}
          >
            <Shield className="w-5 h-5" />
            Admin
          </NavLink>
        )}
      </nav>

      <button
        onClick={handleLogout}
        className="mt-4 w-full flex items-center justify-center gap-2 px-4 py-3 rounded-2xl bg-slate-900 text-white hover:bg-slate-800 transition-colors"
      >
        <LogOut className="w-5 h-5" />
        Cerrar sesión
      </button>
    </aside>
  );
}
