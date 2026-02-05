import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Save } from 'lucide-react';
import { useAuth } from '../../../../hooks/useAuth';
import { apiGet, apiPatch } from '../../../../services/apiClient';
import { Button, Card, Select, Spinner } from '../../../../shared/components';

const EditUser = () => {
  const { uid } = useParams();
  const navigate = useNavigate();
  const { jwtToken } = useAuth();

  const [user, setUser] = useState(null);
  const [role, setRole] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  // 🔹 Load user info
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const data = await apiGet(`/admin/users/${uid}`, { jwtToken });
        setUser(data);
        setRole(data?.role);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [uid, jwtToken]);

  // 🔹 Save role
  const saveRole = async () => {
    try {
      setSaving(true);

      // Actual admin backend route: PATCH /admin/users/:uid/role
      await apiPatch(`/admin/users/${uid}/role`, { role }, { jwtToken });
      navigate('/admin/usuarios');
    } catch (err) {
      alert(err.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return (
    <div className="p-8 text-slate-600 inline-flex items-center gap-2">
      <Spinner />
      <span>Cargando usuario…</span>
    </div>
  );
  if (error) return <p className="p-8 text-red-600">{error}</p>;

  return (
    <div className="min-h-screen bg-transparent p-8">
      <Card className="max-w-3xl mx-auto p-6 rounded border">

        {/* Return */}
        <Button
          variant="ghost"
          onClick={() => navigate('/admin/usuarios')}
          className="flex items-center gap-2 text-blue-600 mb-6"
        >
          <ArrowLeft size={18} />
          Volver
        </Button>

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

        {/* Role */}
        <div className="mt-6">
          <label className="block text-sm font-medium mb-1">
            Rol del usuario
          </label>
          <Select
            value={role}
            onChange={(e) => setRole(e.target.value)}
            selectClassName="w-full"
          >
            <option value="student">Estudiante</option>
            <option value="admin">Admin</option>
          </Select>
        </div>

        {/* Save */}
        <Button
          onClick={saveRole}
          disabled={saving}
          variant="blue"
          className="mt-6 flex items-center gap-2 px-4 py-2"
        >
          <Save size={18} />
          {saving ? "Guardando…" : "Guardar cambios"}
        </Button>
      </Card>
    </div>
  );
};

export default EditUser;
