import { useAdminUsers } from '../../hooks/useAdminUsers';
import { RefreshCw, Edit } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Users = () => {
  const navigate = useNavigate();

  const {
    data: usuarios = [],
    isLoading,
    error,
    refetch,
  } = useAdminUsers();

  if (isLoading) {
    return (
      <div className="p-6 text-slate-500">
        Cargando usuarios…
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 text-red-600">
        Error cargando usuarios
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 p-8">
      <div className="max-w-7xl mx-auto">

        {/* HEADER */}
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold text-slate-800">
            Usuarios
          </h1>

          <button
            onClick={refetch}
            className="flex items-center gap-2 text-slate-600 hover:text-slate-800"
          >
            <RefreshCw size={18} />
            Refrescar
          </button>
        </div>

        {/* TABLA */}
        <div className="bg-white border border-slate-200 rounded-xl overflow-x-auto shadow-sm">
          <table className="w-full text-sm">
            <thead className="bg-slate-100 text-left">
              <tr>
                <th className="p-3 font-semibold text-slate-600">
                  Correo
                </th>
                <th className="p-3 font-semibold text-slate-600">
                  UID
                </th>
                <th className="p-3 font-semibold text-slate-600">
                  Última conexión
                </th>
                <th className="p-3 font-semibold text-slate-600 text-center">
                  Reservas
                </th>
                <th className="p-3 font-semibold text-slate-600 text-center">
                  Reportes
                </th>
                <th className="p-3 font-semibold text-slate-600 text-center">
                  Acciones
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100">
              {usuarios.length === 0 ? (
                <tr>
                  <td
                    colSpan={6}
                    className="p-6 text-center text-slate-500"
                  >
                    No hay usuarios registrados
                  </td>
                </tr>
              ) : (
                usuarios.map((u) => (
                  <tr
                    key={u.uid}
                    className="hover:bg-slate-50 transition-colors"
                  >
                    <td className="p-3">
                      <div className="font-medium text-slate-800">
                        {u.email}
                      </div>
                      <div className="text-xs text-slate-500 capitalize">
                        {u.role}
                      </div>
                    </td>

                    <td className="p-3 text-xs text-slate-500">
                      {u.uid}
                    </td>

                    <td className="p-3 text-xs text-slate-500">
                      {u.lastLoginAt
                        ? new Date(u.lastLoginAt).toLocaleString()
                        : 'Nunca'}
                    </td>

                    <td className="p-3 text-center text-slate-700">
                      {u.reservasCount ?? 0}
                    </td>

                    <td className="p-3 text-center text-slate-700">
                      {u.reportesCount ?? 0}
                    </td>

                    <td className="p-3 text-center">
                      <button
                        onClick={() =>
                          navigate(`/admin/usuarios/${u.uid}`)
                        }
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
