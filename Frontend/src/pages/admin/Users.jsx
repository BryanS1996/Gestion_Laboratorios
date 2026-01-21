import { useState } from 'react';
import { useAdminUsers } from '../../hooks/useAdminUsers';
import {
  ArrowLeft,
  RefreshCw,
  LogOut
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

const Users = () => {
  const navigate = useNavigate();
  const { logout, jwtToken } = useAuth();

  const {
    data: usuarios = [],
    isLoading: loading,
    error,
    refetch,
  } = useAdminUsers();

  const [roleEdits, setRoleEdits] = useState({});
  const [busy, setBusy] = useState({});

  const API_URL = import.meta.env.VITE_API_URL;

  const setRoleFor = (uid, role) => {
    setRoleEdits((prev) => ({ ...prev, [uid]: role }));
  };

  const saveRole = async (uid) => {
    const newRole = roleEdits[uid];
    if (!newRole) return;

    try {
      setBusy((p) => ({ ...p, [uid]: true }));

      const res = await fetch(`${API_URL}/users/change-role/${uid}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${jwtToken}`,
        },
        body: JSON.stringify({ newRole }),
      });

      if (!res.ok) throw new Error('Error cambiando rol');
      await refetch();
    } finally {
      setBusy((p) => ({ ...p, [uid]: false }));
    }
  };

  if (loading) return <p>Cargando usuarios…</p>;
  if (error) return <p className="text-red-600">{String(error.message || error)}</p>;

  return (
    <div className="min-h-screen bg-slate-50 p-8">
      <div className="max-w-6xl mx-auto">

        <button
          onClick={() => navigate('/admin/dashboard')}
          className="flex items-center gap-2 text-blue-600 mb-6"
        >
          <ArrowLeft size={20} />
          Volver al Dashboard
        </button>

        <div className="flex justify-between mb-6">
          <h1 className="text-3xl font-bold">Usuarios</h1>
          <button onClick={logout} className="flex items-center gap-2 text-red-600">
            <LogOut size={20} /> Cerrar sesión
          </button>
        </div>

        <button onClick={refetch} className="mb-4">
          <RefreshCw size={18} />
        </button>

        <div className="bg-white border rounded">
          {usuarios.length === 0 ? (
            <p className="p-6 text-gray-500">No hay usuarios</p>
          ) : (
            usuarios.map((u) => (
              <div key={u.uid} className="flex justify-between p-4 border-b">
                <div>
                  <p className="font-medium">{u.email}</p>
                  <p className="text-sm text-gray-500">{u.role}</p>
                </div>

                <select
                  value={roleEdits[u.uid] || u.role}
                  onChange={(e) => setRoleFor(u.uid, e.target.value)}
                  disabled={busy[u.uid]}
                >
                  <option value="admin">Admin</option>
                  <option value="professor">Profesor</option>
                  <option value="student">Estudiante</option>
                </select>

                <button
                  onClick={() => saveRole(u.uid)}
                  disabled={busy[u.uid]}
                  className="text-blue-600"
                >
                  Guardar
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default Users;
