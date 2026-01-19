import { NavLink, useNavigate } from "react-router-dom";
import { LayoutGrid, CalendarCheck, FileText, LogOut, Shield } from "lucide-react";
import { useAuth } from "../hooks/useAuth";

const base =
  "flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-medium transition-colors";

const active = "bg-[#ae1b2c] text-white shadow-md shadow-red-200";
const inactive = "text-slate-600 hover:bg-slate-100 hover:text-slate-900";

export default function Sidebar() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const handleLogout = async () => {
    await logout();
    navigate("/login", { replace: true });
  };

  return (
    <aside className="w-72 bg-white border-r border-slate-200 px-4 py-6 flex flex-col h-full">
      
      {/* ✅ LOGO SECTION MODIFICADA */}
      <div className="flex flex-col items-center gap-4 mb-8"> {/* Diseño en columna y centrado */}
        <img
          src="/logo_uce.png" // Asegúrate de que tu imagen tenga buena resolución
          alt="Logo Sistema de Laboratorios"
          className="w-full max-w-[90%] h-auto object-contain shadow-sm"
        />
        <div className="text-center"> {/* Texto centrado */}
          <p className="font-bold text-slate-900 text-lg leading-tight uppercase">
            Sistema de Laboratorios
          </p>
          {/* Se eliminó la línea de Facultad de Ingeniería */}
        </div>
      </div>

      {/* User Card */}
      <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 mb-6">
        <p className="text-xs text-slate-500 uppercase tracking-wider font-bold mb-1">Sesión activa</p>
        <p className="text-sm font-bold text-slate-800 truncate" title={user?.email}>
          {user?.email || "Usuario"}
        </p>
        <p className="text-xs text-slate-500 mt-1 capitalize">
          Rol: <span className="font-medium text-slate-700">{user?.role || "student"}</span>
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

      {/* Logout Button */}
      <button
        onClick={handleLogout}
        className="mt-4 w-full flex items-center justify-center gap-2 px-4 py-3 rounded-2xl bg-slate-900 text-white hover:bg-slate-800 transition-all shadow-sm active:scale-95"
      >
        <LogOut className="w-5 h-5" />
        Cerrar sesión
      </button>
    </aside>
  );
}