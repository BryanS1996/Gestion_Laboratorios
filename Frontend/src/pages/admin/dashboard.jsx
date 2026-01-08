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
  LogOut,
  RefreshCw,
  Mail,
  Shield
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth.js';
import { useDashboard } from '../../hooks/useDashboard.js';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { stats, disponibilidad, loading, error, refetch, usuarios } = useDashboard(5000); // Actualizar cada 5 segundos
  const [fecha, setFecha] = useState(new Date().toISOString().split('T')[0]);

  const statsDisplay = stats ? [
    { title: "Reservas Hoy", value: stats.reservasHoy || "0", icon: Calendar, color: "text-blue-600", bg: "bg-blue-50" },
    { title: "Laboratorios Ocupados", value: stats.laboratoriosOcupados || "0/0", icon: CheckCircle2, color: "text-green-600", bg: "bg-green-50" },
    { title: "Reportes Pendientes", value: stats.reportesPendientes || "0", icon: AlertTriangle, color: "text-orange-600", bg: "bg-orange-50", badge: stats.reportesPendientes > 0 ? `${stats.reportesPendientes} pendientes` : null },
  ] : [];

  const schedule = disponibilidad?.laboratorios || [];

  return (
    <div className="flex h-screen bg-slate-50 font-sans">
      
      {/* SIDEBAR (Menú Lateral) */}
      <aside className="w-64 bg-white border-r border-slate-200 hidden md:flex flex-col">
        <div className="p-6 flex items-center gap-3">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold">FI</div>
          <span className="font-semibold text-slate-800">Admin Panel</span>
        </div>

        <nav className="flex-1 px-4 space-y-2 mt-4">
          <NavItem icon={LayoutDashboard} label="Dashboard" active onClick={() => navigate('/admin/dashboard')} />
          <NavItem icon={Box} label="Inventario" onClick={() => navigate('/admin/inventario')} />
          <NavItem icon={Users} label="Usuarios" onClick={() => navigate('/admin/usuarios')} />
          <NavItem icon={Settings} label="Configuración" onClick={() => navigate('/admin/configuracion')} />
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
              <p className="text-slate-700 font-medium">{user?.displayName || 'Usuario'}</p>
              <p className="text-slate-500 text-sm">{user?.email || ''}</p>
              <p className="text-slate-400 text-xs capitalize">{user?.role || 'user'}</p>
            </div>
          </div>
        </header>

        <div className="p-8 max-w-7xl mx-auto space-y-8">
          
          {/* 1. TARJETAS DE ESTADÍSTICAS (KPIs) */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {loading && !stats ? (
              <div className="col-span-3 flex justify-center py-8">
                <div className="flex items-center gap-2 text-slate-500">
                  <RefreshCw size={20} className="animate-spin" />
                  <span>Cargando estadísticas...</span>
                </div>
              </div>
            ) : error ? (
              <div className="col-span-3 bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg">
                Error al cargar datos: {error}
              </div>
            ) : (
              statsDisplay.map((stat, index) => (
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
              ))
            )}
          </div>

          {/* 2. TABLA DE HORARIOS */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            {/* Cabecera de la tabla */}
            <div className="p-6 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-lg font-bold text-slate-800">Disponibilidad por Horarios</h2>
                <p className="text-slate-500 text-sm">Vista de ocupación de laboratorios por bloques - Actualización en tiempo real</p>
              </div>
              
              {/* Botón de actualizar y fecha */}
              <div className="flex items-center gap-2">
                <button 
                  onClick={refetch}
                  className="p-2 hover:bg-slate-100 rounded-lg transition-colors text-slate-600"
                  title="Actualizar datos"
                >
                  <RefreshCw size={20} className={loading ? 'animate-spin' : ''} />
                </button>
                <div className="flex items-center bg-slate-50 rounded-lg p-1 border border-slate-200">
                  <button className="p-1 hover:bg-white rounded-md shadow-sm transition-all text-slate-500">
                    <ChevronLeft size={20} />
                  </button>
                  <span className="px-4 text-sm font-medium text-slate-700">
                    {new Date(fecha).toLocaleDateString('es-ES', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                  </span>
                  <button className="p-1 hover:bg-white rounded-md shadow-sm transition-all text-slate-500">
                    <ChevronRight size={20} />
                  </button>
                </div>
              </div>
            </div>

            {/* Tabla */}
            <div className="overflow-x-auto">
              {loading && !disponibilidad ? (
                <div className="flex justify-center py-8 text-slate-500">
                  <div className="flex items-center gap-2">
                    <RefreshCw size={20} className="animate-spin" />
                    <span>Cargando disponibilidad...</span>
                  </div>
                </div>
              ) : (
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wider">
                      <th className="p-4 font-semibold border-b border-slate-200">Laboratorio</th>
                      {disponibilidad?.horarios?.map((hora, idx) => (
                        <th key={idx} className="p-4 font-semibold border-b border-slate-200 text-center">
                          {hora}-{disponibilidad.horarios[idx + 1] || '18:00'}
                        </th>
                      )) || <th className="p-4">Cargando horarios...</th>}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {schedule.map((lab) => (
                      <tr key={lab.id} className="hover:bg-slate-50/50 transition-colors">
                        <td className="p-4 font-medium text-slate-700">{lab.nombre}</td>
                        {lab.slots?.map((status, idx) => (
                          <td key={idx} className="p-4 text-center">
                            <StatusBadge status={status} />
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>

          {/* 3. LISTA DE USUARIOS */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-slate-800">Usuarios Registrados</h2>
                <p className="text-slate-500 text-sm">Total de usuarios en el sistema</p>
              </div>
              <div className="text-2xl font-bold text-blue-600">{usuarios.length}</div>
            </div>

            <div className="overflow-x-auto">
              {loading && !usuarios.length ? (
                <div className="flex justify-center py-8 text-slate-500">
                  <div className="flex items-center gap-2">
                    <RefreshCw size={20} className="animate-spin" />
                    <span>Cargando usuarios...</span>
                  </div>
                </div>
              ) : usuarios.length === 0 ? (
                <div className="p-6 text-center text-slate-500">
                  <p>No hay usuarios registrados</p>
                </div>
              ) : (
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wider">
                      <th className="p-4 font-semibold border-b border-slate-200">Nombre</th>
                      <th className="p-4 font-semibold border-b border-slate-200">Email</th>
                      <th className="p-4 font-semibold border-b border-slate-200">Rol</th>
                      <th className="p-4 font-semibold border-b border-slate-200">Fecha de Registro</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {usuarios.map((user) => (
                      <tr key={user.id} className="hover:bg-slate-50/50 transition-colors">
                        <td className="p-4 font-medium text-slate-700">{user.displayName}</td>
                        <td className="p-4 text-slate-600">
                          <div className="flex items-center gap-2">
                            <Mail size={16} className="text-slate-400" />
                            {user.email}
                          </div>
                        </td>
                        <td className="p-4">
                          <RoleBadge role={user.role} />
                        </td>
                        <td className="p-4 text-slate-500 text-sm">
                          {user.createdAt 
                            ? new Date(user.createdAt.toDate?.() || user.createdAt).toLocaleDateString('es-ES')
                            : 'N/A'
                          }
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>

        </div>
      </main>
    </div>
  );
};

// Componente para badge de rol

// Componente pequeño para los items del menú
const NavItem = ({ icon: Icon, label, active, onClick }) => (
  <button 
    onClick={onClick}
    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-medium ${
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