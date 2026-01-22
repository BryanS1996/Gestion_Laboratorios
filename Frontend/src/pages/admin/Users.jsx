import { useState } from 'react';
import { useAdminUsers } from '../../hooks/useAdminUsers';
import { ArrowLeft, RefreshCw, LogOut, Edit } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

const Users = () => {
  const navigate = useNavigate();
  const { logout } = useAuth();

  const {
    data: usuarios = [],
    isLoading,
    error,
    refetch,
  } = useAdminUsers();

  if (isLoading) return <p className="p-6">Cargando usuarios…</p>;
  if (error) return <p className="p-6 text-red-600">Error cargando usuarios</p>;

  return (
    <div className="min-h-screen bg-slate-50 p-8">
      <div className="max-w-7xl mx-auto">

        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/admin/dashboard')}
              className="flex items-center gap-2 text-blue-600"
            >
              <ArrowLeft size={20} />
              Volver
            </button>
            <h1 className="text-3xl font-bold">Usuarios</h1>
          </div>

          <div className="flex gap-4">
            <button
              onClick={refetch}
              className="flex items-center gap-2 text-gray-600"
            >
              <RefreshCw size={18} />
              Refrescar
            </button>

            <button
              onClick={logout}
              className="flex items-center gap-2 text-red-600"
            >
              <LogOut size={18} />
              Cerrar sesión
            </button>
          </div>
        </div>

        {/* Tabla */}
        <div className="bg-white border rounded-lg overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-100 text-left">
              <tr>
                <th className="p-3">Correo</th>
                <th className="p-3">UID</th>
                <th className="p-3">Última conexión</th>
                <th className="p-3 text-center">Reservas</th>
                <th className="p-3 text-center">Reportes</th>
                <th className="p-3 text-center">Acciones</th>
              </tr>
            </thead>

            <tbody>
              {usuarios.length === 0 ? (
                <tr>
                  <td colSpan="6" className="p-6 text-center text-gray-500">
                    No hay usuarios registrados
                  </td>
                </tr>
              ) : (
                usuarios.map((u) => (
                  <tr key={u.uid} className="border-t hover:bg-slate-50">
                    <td className="p-3">
                      <div className="font-medium">{u.email}</div>
                      <div className="text-xs text-gray-500 capitalize">
                        {u.role}
                      </div>
                    </td>

                    <td className="p-3 text-xs text-gray-500">
                      {u.uid}
                    </td>

                    <td className="p-3 text-xs text-gray-500">
                      {u.lastLoginAt
                        ? new Date(u.lastLoginAt).toLocaleString()
                        : 'Nunca'}
                    </td>

                    <td className="p-3 text-center">
                      {u.reservasCount ?? 0}
                    </td>

                    <td className="p-3 text-center">
                      {u.reportesCount ?? 0}
                    </td>

                    <td className="p-3 text-center">
                      <button
                        onClick={() => navigate(`/admin/usuarios/${u.uid}`)}
                        className="inline-flex items-center gap-1 text-blue-600 hover:underline"
                      >
                        <Edit size={16} />
                        Editar
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

      </div>
    </div>
  );
};

export default Users;
