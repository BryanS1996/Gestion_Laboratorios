import { useEffect, useMemo, useState } from 'react';
import {
  ArrowLeft,
  CalendarDays,
  Clock,
  RefreshCw,
  Search,
  Trash2,
  Save,
  X,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth.js';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Admin: permite visualizar y modificar reservas (según lo pedido: "Configuración")
const Configuracion = () => {
  const navigate = useNavigate();
  const { jwtToken, logout } = useAuth();

  const [reservas, setReservas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // filtros
  const [q, setQ] = useState('');
  const [estado, setEstado] = useState('');
  const [fecha, setFecha] = useState('');

  // edición
  const [editing, setEditing] = useState(null); // reserva completa
  const [saving, setSaving] = useState(false);

  const fetchReservas = async () => {
    if (!jwtToken) return;
    try {
      setLoading(true);
      setError(null);

      const params = new URLSearchParams();
      if (estado) params.set('estado', estado);
      if (fecha) params.set('fecha', fecha);
      params.set('limit', '200');

      const res = await fetch(`${API_URL}/admin/reservas?${params.toString()}`, {
        headers: { Authorization: `Bearer ${jwtToken}` },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Error cargando reservas');
      setReservas(data.reservas || []);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReservas();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [jwtToken]);

  const filtered = useMemo(() => {
    const qq = q.trim().toLowerCase();
    if (!qq) return reservas;
    return reservas.filter((r) => {
      return (
        (r.laboratorioNombre || '').toLowerCase().includes(qq) ||
        (r.userEmail || '').toLowerCase().includes(qq) ||
        (r.userNombre || '').toLowerCase().includes(qq) ||
        (r.laboratorioId || '').toLowerCase().includes(qq)
      );
    });
  }, [reservas, q]);

  const fmtFecha = (f) => {
    try {
      const d = f?.toDate ? f.toDate() : f;
      // Validación extra por si es timestamp numérico de firebase sin toDate
      if (f?.seconds) return new Date(f.seconds * 1000).toLocaleDateString('es-ES');
      return d ? new Date(d).toLocaleDateString('es-ES') : 'N/A';
    } catch {
      return 'N/A';
    }
  };

  // --- AQUÍ ESTÁ LA CORRECCIÓN DE SEGURIDAD ---
  const openEdit = (r) => {
    let dateValue = '';

    try {
      // 1. Si no hay fecha, poner la de hoy
      if (!r.fecha) {
        dateValue = new Date().toISOString().split('T')[0];
      }
      // 2. Si es objeto Firebase/Firestore (tiene .seconds)
      else if (r.fecha.seconds) {
        dateValue = new Date(r.fecha.seconds * 1000).toISOString().split('T')[0];
      }
      // 3. Si tiene método .toDate() (objeto Firestore clásico en cliente)
      else if (typeof r.fecha.toDate === 'function') {
        dateValue = r.fecha.toDate().toISOString().split('T')[0];
      }
      // 4. Si es string o Date estándar
      else {
        const d = new Date(r.fecha);
        // Verificar si es una fecha válida antes de hacer toISOString
        if (isNaN(d.getTime())) {
            console.warn("Fecha inválida detectada, usando fecha actual:", r.fecha);
            dateValue = new Date().toISOString().split('T')[0];
        } else {
            dateValue = d.toISOString().split('T')[0];
        }
      }
    } catch (error) {
      console.error("Error procesando fecha en openEdit:", error);
      // Fallback de seguridad definitivo: fecha de hoy
      dateValue = new Date().toISOString().split('T')[0];
    }

    setEditing({
      ...r,
      _fechaInput: dateValue,
      _horaInicio: r.horaInicio,
      _horaFin: r.horaFin,
      _estado: r.estado || 'confirmada',
    });
  };
  // ---------------------------------------------

  const saveEdit = async () => {
    if (!editing) return;
    try {
      setSaving(true);
      const payload = {
        estado: editing._estado,
        fecha: editing._fechaInput || undefined,
        horaInicio: Number(editing._horaInicio),
        horaFin: Number(editing._horaFin),
      };

      const res = await fetch(`${API_URL}/admin/reservas/${editing.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${jwtToken}`,
        },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Error actualizando reserva');

      setEditing(null);
      await fetchReservas();
    } catch (e) {
      alert(`❌ ${e.message}`);
    } finally {
      setSaving(false);
    }
  };

  const deleteReserva = async (id) => {
    if (!confirm('¿Eliminar esta reserva? Esta acción no se puede deshacer.')) return;
    try {
      const res = await fetch(`${API_URL}/admin/reservas/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${jwtToken}` },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Error eliminando reserva');
      await fetchReservas();
    } catch (e) {
      alert(`❌ ${e.message}`);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate('/admin/dashboard')}
            className="flex items-center gap-2 text-blue-600 hover:text-blue-700 mb-4 font-medium"
          >
            <ArrowLeft size={20} />
            Volver al Dashboard
          </button>

          <div className="flex items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-slate-800">Configuración</h1>
              <p className="text-slate-500 mt-2">Gestiona y modifica las reservas de los estudiantes</p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={fetchReservas}
                className="p-2 hover:bg-slate-100 rounded-lg transition-colors text-slate-600"
                title="Actualizar"
              >
                <RefreshCw size={20} className={loading ? 'animate-spin' : ''} />
              </button>
              <button
                onClick={async () => { await logout(); navigate('/login'); }}
                className="px-4 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 font-semibold"
              >
                Cerrar sesión
              </button>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white border border-slate-200 rounded-2xl p-4 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
            <div className="relative">
              <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Buscar por laboratorio o usuario..."
                className="w-full pl-10 pr-3 py-2 rounded-xl border border-slate-200 bg-slate-50"
              />
            </div>

            <select
              value={estado}
              onChange={(e) => setEstado(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white"
            >
              <option value="">Todos los estados</option>
              <option value="confirmada">Confirmada</option>
              <option value="pendiente">Pendiente</option>
              <option value="cancelada">Cancelada</option>
            </select>

            <div className="flex items-center gap-2">
              <CalendarDays size={18} className="text-slate-400" />
              <input
                type="date"
                value={fecha}
                onChange={(e) => setFecha(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white"
              />
            </div>

            <button
              onClick={fetchReservas}
              className="px-4 py-2 rounded-xl bg-blue-600 text-white font-semibold hover:bg-blue-700"
            >
              Aplicar filtros
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-slate-100 flex items-center justify-between">
            <h2 className="text-lg font-bold text-slate-800">Reservas</h2>
            <div className="text-sm text-slate-500">
              Total: <span className="font-semibold text-slate-700">{filtered.length}</span>
            </div>
          </div>

          {loading ? (
            <div className="flex justify-center py-12 text-slate-500">
              <div className="flex items-center gap-2">
                <RefreshCw size={20} className="animate-spin" />
                <span>Cargando reservas...</span>
              </div>
            </div>
          ) : error ? (
            <div className="p-6 text-center text-red-600">{error}</div>
          ) : filtered.length === 0 ? (
            <div className="p-6 text-center text-slate-500">No hay reservas para mostrar</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wider">
                    <th className="p-4 font-semibold border-b border-slate-200">Laboratorio</th>
                    <th className="p-4 font-semibold border-b border-slate-200">Usuario</th>
                    <th className="p-4 font-semibold border-b border-slate-200">Fecha</th>
                    <th className="p-4 font-semibold border-b border-slate-200">Horario</th>
                    <th className="p-4 font-semibold border-b border-slate-200">Estado</th>
                    <th className="p-4 font-semibold border-b border-slate-200 text-right">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filtered.map((r) => (
                    <tr key={r.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="p-4 font-medium text-slate-700">{r.laboratorioNombre || r.laboratorioId}</td>
                      <td className="p-4 text-slate-600">
                        <div className="leading-tight">
                          <div className="font-medium">{r.userNombre || '—'}</div>
                          <div className="text-xs text-slate-400">{r.userEmail || '—'}</div>
                        </div>
                      </td>
                      <td className="p-4 text-slate-600">{fmtFecha(r.fecha)}</td>
                      <td className="p-4 text-slate-600">
                        <div className="flex items-center gap-2">
                          <Clock size={16} className="text-slate-400" />
                          {String(r.horaInicio).padStart(2, '0')}:00 - {String(r.horaFin).padStart(2, '0')}:00
                        </div>
                      </td>
                      <td className="p-4">
                        <span className={`text-xs px-2 py-1 rounded-full font-semibold ${
                          r.estado === 'cancelada'
                            ? 'bg-red-100 text-red-700'
                            : r.estado === 'pendiente'
                              ? 'bg-yellow-100 text-yellow-700'
                              : 'bg-green-100 text-green-700'
                        }`}
                        >
                          {r.estado || 'confirmada'}
                        </span>
                      </td>
                      <td className="p-4">
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => openEdit(r)}
                            className="px-3 py-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 font-semibold text-sm"
                          >
                            Editar
                          </button>
                          <button
                            onClick={() => deleteReserva(r.id)}
                            className="p-2 rounded-xl border border-slate-200 hover:bg-red-50 text-red-600"
                            title="Eliminar"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Modal edición */}
        {editing && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
            <div className="w-full max-w-lg bg-white rounded-2xl border border-slate-200 shadow-xl">
              <div className="p-5 border-b border-slate-100 flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-slate-800">Editar reserva</h3>
                  <p className="text-xs text-slate-500 mt-1">{editing.laboratorioNombre || editing.laboratorioId}</p>
                </div>
                <button
                  onClick={() => setEditing(null)}
                  className="p-2 rounded-xl hover:bg-slate-100 text-slate-500"
                  title="Cerrar"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="p-5 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-semibold text-slate-500">Fecha</label>
                    <input
                      type="date"
                      value={editing._fechaInput}
                      onChange={(e) => setEditing({ ...editing, _fechaInput: e.target.value })}
                      className="mt-1 w-full px-3 py-2 rounded-xl border border-slate-200"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-slate-500">Estado</label>
                    <select
                      value={editing._estado}
                      onChange={(e) => setEditing({ ...editing, _estado: e.target.value })}
                      className="mt-1 w-full px-3 py-2 rounded-xl border border-slate-200 bg-white"
                    >
                      <option value="confirmada">Confirmada</option>
                      <option value="pendiente">Pendiente</option>
                      <option value="cancelada">Cancelada</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-slate-500">Hora inicio (24h)</label>
                    <input
                      type="number"
                      min={0}
                      max={23}
                      value={editing._horaInicio}
                      onChange={(e) => setEditing({ ...editing, _horaInicio: e.target.value })}
                      className="mt-1 w-full px-3 py-2 rounded-xl border border-slate-200"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-slate-500">Hora fin (24h)</label>
                    <input
                      type="number"
                      min={1}
                      max={24}
                      value={editing._horaFin}
                      onChange={(e) => setEditing({ ...editing, _horaFin: e.target.value })}
                      className="mt-1 w-full px-3 py-2 rounded-xl border border-slate-200"
                    />
                  </div>
                </div>
              </div>

              <div className="p-5 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  onClick={() => setEditing(null)}
                  className="px-4 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 font-semibold"
                >
                  Cancelar
                </button>
                <button
                  onClick={saveEdit}
                  disabled={saving}
                  className="px-4 py-2 rounded-xl bg-blue-600 text-white hover:bg-blue-700 font-semibold disabled:opacity-60"
                >
                  <span className="inline-flex items-center gap-2">
                    <Save size={18} />
                    Guardar
                  </span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Configuracion;