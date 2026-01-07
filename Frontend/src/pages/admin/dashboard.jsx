import { useState } from 'react';
import { 
  LayoutDashboard, 
  Box, 
  Users, 
  Settings, 
  Calendar, 
  CheckCircle2, 
  AlertTriangle, 
  ChevronLeft, 
  ChevronRight,
  LogOut
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth.js';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  
  // Datos simulados para la vista
  const stats = [
    { title: "Reservas Hoy", value: "45", icon: Calendar, color: "text-blue-600", bg: "bg-blue-50" },
    { title: "Laboratorios Ocupados", value: "1/6", icon: CheckCircle2, color: "text-green-600", bg: "bg-green-50" },
    { title: "Reportes Pendientes", value: "2", icon: AlertTriangle, color: "text-orange-600", bg: "bg-orange-50", badge: "2 pendientes" },
  ];

  const schedule = [
    { id: 1, name: "Laboratorio de Computación 1", slots: ["ocupado", "libre", "libre", "ocupado"] },
    { id: 2, name: "Laboratorio de Redes", slots: ["libre", "libre", "ocupado", "libre"] },
    { id: 3, name: "Laboratorio de Software", slots: ["libre", "libre", "libre", "libre"] },
  ];

  return (
    <div className="flex h-screen bg-slate-50 font-sans">
      
      {/* SIDEBAR (Menú Lateral) */}
      <aside className="w-64 bg-white border-r border-slate-200 hidden md:flex flex-col">
        <div className="p-6 flex items-center gap-3">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold">FI</div>
          <span className="font-semibold text-slate-800">Admin Panel</span>
        </div>

        <nav className="flex-1 px-4 space-y-2 mt-4">
          <NavItem icon={LayoutDashboard} label="Dashboard" active />
          <NavItem icon={Box} label="Inventario" />
          <NavItem icon={Users} label="Usuarios" />
          <NavItem icon={Settings} label="Configuración" />
        </nav>

        <div className="p-4 border-t border-slate-100">
          <button 
            onClick={() => {
              logout();
              navigate('/');
            }}
            className="flex items-center gap-3 text-slate-500 hover:text-red-600 w-full px-4 py-2 rounded-lg transition-colors"
          >
            <LogOut size={20} />
            <span className="font-medium">Cerrar Sesión</span>
          </button>
        </div>
      </aside>

      {/* CONTENIDO PRINCIPAL */}
      <main className="flex-1 overflow-y-auto">
        <header className="bg-white border-b border-slate-200 px-8 py-5">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-slate-800">Dashboard Administrativo</h1>
              <p className="text-slate-500 text-sm mt-1">Gestiona laboratorios, reservas e incidencias en tiempo real</p>
            </div>
            <div className="text-right">
              <p className="text-slate-700 font-medium">{user?.name || 'Usuario'}</p>
              <p className="text-slate-500 text-sm">{user?.email || ''}</p>
              <p className="text-slate-400 text-xs capitalize">{user?.role || 'user'}</p>
            </div>
          </div>
        </header>

        <div className="p-8 max-w-7xl mx-auto space-y-8">
          
          {/* 1. TARJETAS DE ESTADÍSTICAS (KPIs) */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {stats.map((stat, index) => (
              <div key={index} className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex justify-between items-start mb-4">
                  <div className={`p-3 rounded-xl ${stat.bg} ${stat.color}`}>
                    <stat.icon size={24} />
                  </div>
                  {stat.badge && (
                    <span className="bg-orange-100 text-orange-700 text-xs font-bold px-2 py-1 rounded-full">
                      {stat.badge}
                    </span>
                  )}
                </div>
                <h3 className="text-3xl font-bold text-slate-800 mb-1">{stat.value}</h3>
                <p className="text-slate-500 font-medium">{stat.title}</p>
              </div>
            ))}
          </div>

          {/* 2. TABLA DE HORARIOS */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            {/* Cabecera de la tabla */}
            <div className="p-6 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-lg font-bold text-slate-800">Disponibilidad por Horarios</h2>
                <p className="text-slate-500 text-sm">Vista de ocupación de laboratorios por bloques</p>
              </div>
              
              {/* Selector de Fecha */}
              <div className="flex items-center bg-slate-50 rounded-lg p-1 border border-slate-200">
                <button className="p-1 hover:bg-white rounded-md shadow-sm transition-all text-slate-500">
                  <ChevronLeft size={20} />
                </button>
                <span className="px-4 text-sm font-medium text-slate-700">miércoles, 7 de enero de 2026 (Hoy)</span>
                <button className="p-1 hover:bg-white rounded-md shadow-sm transition-all text-slate-500">
                  <ChevronRight size={20} />
                </button>
              </div>
            </div>

            {/* Tabla */}
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wider">
                    <th className="p-4 font-semibold border-b border-slate-200">Laboratorio</th>
                    <th className="p-4 font-semibold border-b border-slate-200 text-center">07:00-09:00</th>
                    <th className="p-4 font-semibold border-b border-slate-200 text-center">09:00-11:00</th>
                    <th className="p-4 font-semibold border-b border-slate-200 text-center">11:00-13:00</th>
                    <th className="p-4 font-semibold border-b border-slate-200 text-center">14:00-16:00</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {schedule.map((lab) => (
                    <tr key={lab.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="p-4 font-medium text-slate-700">{lab.name}</td>
                      {lab.slots.map((status, idx) => (
                        <td key={idx} className="p-4 text-center">
                          <StatusBadge status={status} />
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      </main>
    </div>
  );
};

// Componente pequeño para los items del menú
const NavItem = ({ icon: Icon, label, active }) => (
  <button className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-medium ${
    active 
      ? 'bg-blue-50 text-blue-600 shadow-sm' 
      : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
  }`}>
    <Icon size={20} />
    <span>{label}</span>
  </button>
);

// Componente para las etiquetas de estado (Disponible/Ocupado)
const StatusBadge = ({ status }) => {
  const styles = status === 'libre' 
    ? 'bg-green-100 text-green-700 border-green-200' 
    : 'bg-slate-100 text-slate-500 border-slate-200';
  
  const text = status === 'libre' ? 'Disponible' : 'Ocupado';
  const dotColor = status === 'libre' ? 'bg-green-500' : 'bg-slate-400';

  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border ${styles}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${dotColor}`}></span>
      {text}
    </span>
  );
};

export default AdminDashboard;