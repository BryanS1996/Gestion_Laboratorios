import { NavLink } from 'react-router-dom';
import {
  BarChart3,
  Building2,
  Users,
  FileText,
  Settings,
  LogOut
} from 'lucide-react';

const SidebarAdmin = () => {
  return (
    <aside className="w-64 bg-white border-r min-h-screen flex flex-col">
      {/* Header */}
      <div className="p-6 border-b">
        <h2 className="text-lg font-bold">Admin Panel</h2>
        <p className="text-sm text-gray-500">Sistema de Laboratorios</p>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2">
        <NavLink to="/admin/dashboard" className="admin-link">
          <BarChart3 size={18} /> Dashboard
        </NavLink>

        <NavLink
          to="/admin/laboratorios"
          className={({ isActive }) =>
            `flex items-center gap-3 px-4 py-2 rounded-lg transition
            ${isActive
              ? 'bg-blue-600 text-white'
              : 'text-gray-600 hover:bg-gray-100'}`
          }
        >
          <FileText size={18} />
          <span>Laboratorios</span>
        </NavLink>

        <NavLink to="/admin/usuarios" className="admin-link">
          <Users size={18} /> Usuarios
        </NavLink>

        <NavLink to="/admin/reportes" className="admin-link">
          <FileText size={18} /> Reportes
        </NavLink>

        <NavLink to="/admin/configuracion" className="admin-link">
          <Settings size={18} /> Configuración
        </NavLink>
      </nav>

      {/* Footer */}
      <div className="p-4 border-t">
        <button className="admin-link text-red-600">
          <LogOut size={18} /> Cerrar sesión
        </button>
      </div>
    </aside>
  );
};

export default SidebarAdmin;
