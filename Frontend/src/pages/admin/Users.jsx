import { useState } from 'react';
import { 
  ArrowLeft,
  Mail,
  Shield,
  RefreshCw,
  LogOut
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth.js';
import { useDashboard } from '../../hooks/useDashboard.js';

const Users = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { usuarios, loading, error, refetch } = useDashboard(5000);

  return (
    <div className="min-h-screen bg-slate-50 p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <button 
            onClick={() => navigate('/admin/dashboard')}
            className="flex items-center gap-2 text-blue-600 hover:text-blue-700 mb-4 font-medium"
          >
            <ArrowLeft size={20} />
            Volver al Dashboard
          </button>
          
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-slate-800">Usuarios Registrados</h1>
              <p className="text-slate-500 mt-2">Gestiona y visualiza todos los usuarios del sistema</p>
            </div>
            
            <button 
              onClick={logout}
              className="flex items-center gap-2 text-slate-500 hover:text-red-600 px-4 py-2 rounded-lg transition-colors"
              title="Cerrar sesión"
            >
              <LogOut size={20} />
              <span className="font-medium">Cerrar Sesión</span>
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white p-4 rounded-lg border border-slate-200">
            <p className="text-slate-500 text-sm">Total Usuarios</p>
            <p className="text-3xl font-bold text-blue-600 mt-2">{usuarios.length}</p>
          </div>
          <div className="bg-white p-4 rounded-lg border border-slate-200">
            <p className="text-slate-500 text-sm">Administradores</p>
            <p className="text-3xl font-bold text-red-600 mt-2">{usuarios.filter(u => u.role === 'admin').length}</p>
          </div>
          <div className="bg-white p-4 rounded-lg border border-slate-200">
            <p className="text-slate-500 text-sm">Profesores</p>
            <p className="text-3xl font-bold text-blue-600 mt-2">{usuarios.filter(u => u.role === 'professor').length}</p>
          </div>
          <div className="bg-white p-4 rounded-lg border border-slate-200">
            <p className="text-slate-500 text-sm">Estudiantes</p>
            <p className="text-3xl font-bold text-green-600 mt-2">{usuarios.filter(u => u.role === 'student').length}</p>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-slate-100 flex items-center justify-between">
            <h2 className="text-lg font-bold text-slate-800">Lista de Usuarios</h2>
            <button 
              onClick={refetch}
              className="p-2 hover:bg-slate-100 rounded-lg transition-colors text-slate-600"
              title="Actualizar"
            >
              <RefreshCw size={20} className={loading ? 'animate-spin' : ''} />
            </button>
          </div>

          <div className="overflow-x-auto">
            {loading && !usuarios.length ? (
              <div className="flex justify-center py-12 text-slate-500">
                <div className="flex items-center gap-2">
                  <RefreshCw size={20} className="animate-spin" />
                  <span>Cargando usuarios...</span>
                </div>
              </div>
            ) : error ? (
              <div className="p-6 text-center text-red-600">
                Error al cargar usuarios: {error}
              </div>
            ) : usuarios.length === 0 ? (
              <div className="p-6 text-center text-slate-500">
                <p>No hay usuarios registrados</p>
              </div>
            ) : (
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wider">
                    <th className="p-4 font-semibold border-b border-slate-200">UID</th>
                    <th className="p-4 font-semibold border-b border-slate-200">Nombre</th>
                    <th className="p-4 font-semibold border-b border-slate-200">Email</th>
                    <th className="p-4 font-semibold border-b border-slate-200">Email Verificado</th>
                    <th className="p-4 font-semibold border-b border-slate-200">Fecha de Creación</th>
                    <th className="p-4 font-semibold border-b border-slate-200">Último Login</th>
                    <th className="p-4 font-semibold border-b border-slate-200">Estado</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {usuarios.map((user) => (
                    <tr key={user.uid} className="hover:bg-slate-50/50 transition-colors">
                      <td className="p-4 text-slate-400 text-xs font-mono">
                        {user.uid?.substring(0, 12)}...
                      </td>
                      <td className="p-4 font-medium text-slate-700">{user.displayName}</td>
                      <td className="p-4 text-slate-600">
                        <div className="flex items-center gap-2">
                          <Mail size={16} className="text-slate-400" />
                          {user.email}
                        </div>
                      </td>
                      <td className="p-4">
                        {user.emailVerified ? (
                          <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 text-green-700 text-xs font-semibold rounded">
                            ✓ Verificado
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-1 bg-yellow-100 text-yellow-700 text-xs font-semibold rounded">
                            ⚠ No verificado
                          </span>
                        )}
                      </td>
                      <td className="p-4 text-slate-500 text-sm">
                        {user.createdAt 
                          ? new Date(user.createdAt).toLocaleDateString('es-ES')
                          : 'N/A'
                        }
                      </td>
                      <td className="p-4 text-slate-500 text-sm">
                        {user.lastSignInTime 
                          ? new Date(user.lastSignInTime).toLocaleDateString('es-ES')
                          : 'Nunca'
                        }
                      </td>
                      <td className="p-4">
                        {user.disabled ? (
                          <span className="inline-flex items-center gap-1 px-2 py-1 bg-red-100 text-red-700 text-xs font-semibold rounded">
                            Deshabilitado
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 text-green-700 text-xs font-semibold rounded">
                            Activo
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Users;

