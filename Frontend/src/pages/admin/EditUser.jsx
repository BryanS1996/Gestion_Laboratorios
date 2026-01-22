import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Save } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';

const API_URL = import.meta.env.VITE_API_URL;

const EditUser = () => {
  const { uid } = useParams();
  const navigate = useNavigate();
  const { jwtToken } = useAuth();

  const [user, setUser] = useState(null);
  const [role, setRole] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  // 🔹 Cargar info del usuario
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await fetch(`${API_URL}/admin/users/${uid}`, {
          headers: {
            Authorization: `Bearer ${jwtToken}`,
          },
        });

        if (!res.ok) throw new Error('No se pudo cargar el usuario');

        const data = await res.json();
        setUser(data);
        setRole(data.role);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [uid, jwtToken]);

  // 🔹 Guardar rol
  const saveRole = async () => {
    try {
      setSaving(true);

      const res = await fetch(
        `${API_URL}/users/change-role/${uid}`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${jwtToken}`,
          },
          body: JSON.stringify({ newRole: role }),
        }
      );

      if (!res.ok) throw new Error('Error al guardar el rol');

      navigate('/admin/usuarios');
    } catch (err) {
      alert(err.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <p className="p-8">Cargando usuario…</p>;
  if (error) return <p className="p-8 text-red-600">{error}</p>;

  return (
    <div className="min-h-screen bg-slate-50 p-8">
      <div className="max-w-3xl mx-auto bg-white p-6 rounded border">

        {/* Volver */}
        <button
          onClick={() => navigate('/admin/usuarios')}
          className="flex items-center gap-2 text-blue-600 mb-6"
        >
          <ArrowLeft size={18} />
          Volver
        </button>

        <h1 className="text-2xl font-bold mb-6">
          Editar Usuario
        </h1>

        {/* Info */}
        <div className="space-y-4 text-sm">
          <div>
            <span className="font-medium">Email:</span>
            <p>{user.email}</p>
          </div>

          <div>
            <span className="font-medium">UID:</span>
            <p className="text-gray-500">{user.uid}</p>
          </div>

          <div>
            <span className="font-medium">Última conexión:</span>
            <p>
              {user.lastLoginAt
                ? new Date(user.lastLoginAt).toLocaleString()
                : 'Nunca'}
            </p>
          </div>

          <div>
            <span className="font-medium">Reservas:</span>
            <p>{user.reservasCount}</p>
          </div>

          <div>
            <span className="font-medium">Reportes:</span>
            <p>{user.reportesCount}</p>
          </div>
        </div>

        {/* Rol */}
        <div className="mt-6">
          <label className="block text-sm font-medium mb-1">
            Rol del usuario
          </label>
          <select
            value={role}
            onChange={(e) => setRole(e.target.value)}
            className="border rounded px-3 py-2 w-full"
          >
            <option value="student">Estudiante</option>
            <option value="admin">Admin</option>
          </select>
        </div>

        {/* Guardar */}
        <button
          onClick={saveRole}
          disabled={saving}
          className="mt-6 flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          <Save size={18} />
          {saving ? 'Guardando…' : 'Guardar cambios'}
        </button>
      </div>
    </div>
  );
};

export default EditUser;
