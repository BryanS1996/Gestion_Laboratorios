import { useState } from 'react';
import {
  ArrowLeft,
  Mail,
  Shield,
  RefreshCw,
  LogOut,
  Trash2,
  Save
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth.js';
import { useDashboard } from '../../hooks/useDashboard.js';

const Users = () => {
  const navigate = useNavigate();
  const { logout, jwtToken } = useAuth();

  // 🔒 DEFAULTS SEGUROS
  const {
    usuarios = [],
    loading = false,
    error = null,
    refetch
  } = useDashboard();

  const [roleEdits, setRoleEdits] = useState({});
  const [busy, setBusy] = useState({});

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

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

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Error changing role');

      await refetch?.();
    } catch (e) {
      alert(`❌ ${e.message}`);
    } finally {
      setBusy((p) => ({ ...p, [uid]: false }));
    }
  };

  const deleteUser = async (uid, email) => {
    if (!confirm(`¿Eliminar el usuario ${email || uid}?\nEsta acción no se puede deshacer.`)) return;

    try {
      setBusy((p) => ({ ...p, [uid]: true }));

      const res = await fetch(`${API_URL}/users/${uid}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${jwtToken}` },
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Error deleting user');

      await refetch?.();
    } catch (e) {
      alert(`❌ ${e.message}`);
    } finally {
      setBusy((p) => ({ ...p, [uid]: false }));
    }
  };

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
              <h1 className="text-3xl font-bold text-slate-800">
                Usuarios Registrados
              </h1>
              <p className="text-slate-500 mt-2">
                Gestiona y visualiza todos los usuarios del sistema
              </p>
            </div>

            <button
              onClick={logout}
              className="flex items-center gap-2 text-slate-500 hover:text-red-600 px-4 py-2 rounded-lg transition-colors"
            >
              <LogOut size={20} />
              <span className="font-medium">Cerrar Sesión</span>
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Stat title="Total Usuarios" value={usuarios.length} color="text-blue-600" />
          <Stat title="Administradores" value={usuarios.filter(u => u.role === 'admin').length} color="text-red-600" />
          <Stat title="Profesores" value={usuarios.filter(u => u.role === 'professor').length} color="text-blue-600" />
          <Stat title="Estudiantes" value={usuarios.filter(u => u.role === 'student').length} color="text-green-600" />
        </div>

        {/* Table */}
        <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-6 border-b flex items-center justify-between">
            <h2 className="text-lg font-bold">Lista de Usuarios</h2>
            <button
              onClick={refetch}
              className="p-2 hover:bg-slate-100 rounded-lg"
            >
              <RefreshCw size={20} className={loading ? 'animate-spin' : ''} />
            </button>
          </div>

          {loading ? (
            <div className="py-12 text-center text-slate-500">Cargando usuarios…</div>
          ) : error ? (
           _toggleError(error)
          ) : usuarios.length === 0 ? (
            <div className="py-12 text-center text-slate-500">No hay usuarios registrados</div>
          ) : (
            <UsersTable
              usuarios={usuarios}
              roleEdits={roleEdits}
              setRoleFor={setRoleFor}
              saveRole={saveRole}
              deleteUser={deleteUser}
              busy={busy}
            />
          )}
        </div>
      </div>
    </div>
  );
};

const Stat = ({ title, value, color }) => (
  <div className="bg-white p-4 rounded-lg border">
    <p className="text-slate-500 text-sm">{title}</p>
    <p className={`text-3xl font-bold mt-2 ${color}`}>{value}</p>
  </div>
);

const _toggleError = (error) =>_
export default Users;