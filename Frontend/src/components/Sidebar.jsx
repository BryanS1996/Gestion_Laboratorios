import { NavLink, useNavigate } from "react-router-dom";
import {
  LayoutGrid,
  CalendarCheck,
  FileText,
  LogOut,
  Shield,
} from "lucide-react";
import toast from "react-hot-toast";
import { useAuth } from "../hooks/useAuth";

const base =
  "flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-medium transition-colors";

const active = "bg-[#ae1b2c] text-white shadow-md shadow-red-200";
const inactive = "text-slate-600 hover:bg-slate-100 hover:text-slate-900";

export default function Sidebar({ open, setOpen }) {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const handleLogout = async () => {
    toast.dismiss();
    const t = toast.loading("Cerrando sesión...");

    try {
      await logout();

      toast.success("Sesión cerrada", {
        id: t,
        duration: 2000,
      });

      setTimeout(() => {
        navigate("/login", { replace: true });
      }, 300);
    } catch {
      toast.error("Error al cerrar sesión", { id: t });
    }
  };

  return (
    <>
      {/* OVERLAY MOBILE */}
      {open && (
        <div
          onClick={() => setOpen(false)}
          className="fixed inset-0 bg-black/40 z-40 lg:hidden"
        />
      )}

      <aside
        className={`
          fixed lg:static z-50
          w-72 bg-white border-r border-slate-200
          px-4 py-6 flex flex-col h-screen
          transform transition-transform duration-300
          ${open ? "translate-x-0" : "-translate-x-full"}
          lg:translate-x-0
        `}
      >
        {/* LOGO */}
        <div className="flex flex-col items-center gap-4 mb-8">
          <img
            src="/logo_uce.png"
            alt="Logo Sistema de Laboratorios"
            className="w-full max-w-[90%] h-auto object-contain shadow-sm"
          />
          <p className="font-bold text-slate-900 text-lg uppercase text-center">
            Sistema de Laboratorios
          </p>
        </div>

        {/* USER CARD */}
        <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 mb-6">
          <p className="text-xs text-slate-500 uppercase tracking-wider font-bold mb-1">
            Sesión activa
          </p>
          <p
            className="text-sm font-bold text-slate-800 truncate"
            title={user?.email}
          >
            {user?.email || "Usuario"}
          </p>
          <p className="text-xs text-slate-500 mt-1 capitalize">
            Rol:{" "}
            <span className="font-medium text-slate-700">
              {user?.role || "student"}
            </span>
          </p>
        </div>

        {/* LINKS */}
        <nav className="flex-1 space-y-2">
          <NavLink
            to="/catalogo"
            className={({ isActive }) =>
              `${base} ${isActive ? active : inactive}`
            }
          >
            <LayoutGrid className="w-5 h-5" />
            Catálogo
          </NavLink>

          <NavLink
            to="/mis-reservas"
            className={({ isActive }) =>
              `${base} ${isActive ? active : inactive}`
            }
          >
            <CalendarCheck className="w-5 h-5" />
            Mis Reservas
          </NavLink>

          <NavLink
            to="/reportes"
            className={({ isActive }) =>
              `${base} ${isActive ? active : inactive}`
            }
          >
            <FileText className="w-5 h-5" />
            Mis Reportes
          </NavLink>

          {user?.role === "admin" && (
            <NavLink
              to="/admin/dashboard"
              className={({ isActive }) =>
                `${base} ${isActive ? active : inactive}`
              }
            >
              <Shield className="w-5 h-5" />
              Admin
            </NavLink>
          )}
        </nav>

        {/* LOGOUT */}
        <button
          onClick={handleLogout}
          className="
            mt-4 w-full flex items-center justify-center gap-2
            px-4 py-3 rounded-2xl bg-slate-900 text-white
            hover:bg-slate-800 transition-all shadow-sm
            active:scale-95
          "
        >
          <LogOut className="w-5 h-5" />
          Cerrar sesión
        </button>
      </aside>
    </>
  );
}
