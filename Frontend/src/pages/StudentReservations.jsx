import { useEffect, useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  AlertTriangle,
  X,
  Send,
  Image as ImageIcon,
  CreditCard,
} from 'lucide-react';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const StudentReservations = () => {
  const { jwtToken } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);

  const [reportModalOpen, setReportModalOpen] = useState(false);
  const [selectedReserva, setSelectedReserva] = useState(null);
  const [reportForm, setReportForm] = useState({ titulo: '', descripcion: '' });
  const [reportImage, setReportImage] = useState(null);
  const [sendingReport, setSendingReport] = useState(false);

  /* =========================
     Helpers
  ========================== */
  const formatDate = (fecha) => {
    if (!fecha) return '—';
    if (typeof fecha === 'string') return fecha.split('T')[0];
    const seconds = fecha.seconds || fecha._seconds;
    return new Date(seconds * 1000).toLocaleDateString('es-EC', {
      timeZone: 'America/Guayaquil',
    });
  };

  /* =========================
     Load reservations
  ========================== */
  const loadReservas = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_URL}/reservas/mine`, {
        headers: { Authorization: `Bearer ${jwtToken}` },
      });
      const data = await res.json();

      if (res.ok) {
        setReservations(
          (data.reservas || []).map((r) => ({
            ...r,
            labName: r.laboratorioNombre || r.laboratorioId,
            date: formatDate(r.fecha),
            time: `${String(r.horaInicio).padStart(2, '0')}:00`,
            status:
              r.estado === 'confirmada'
                ? 'Confirmada'
                : r.estado === 'pendiente'
                ? 'Pendiente'
                : 'Cancelada',
          }))
        );
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (jwtToken) loadReservas();
  }, [jwtToken]);

  /* =========================
     Actions
  ========================== */
  const handleCancel = async (id) => {
    if (!confirm('¿Cancelar reserva?')) return;
    await fetch(`${API_URL}/reservas/${id}/cancel`, {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${jwtToken}` },
    });
    loadReservas();
  };

  const handlePay = async (reserva) => {
    const res = await axios.post(
      `${API_URL}/stripe/create-checkout-session`,
      reserva,
      { headers: { Authorization: `Bearer ${jwtToken}` } }
    );
    if (res.data?.url) window.location.href = res.data.url;
  };

  const submitReport = async (e) => {
    e.preventDefault();
    setSendingReport(true);

    const formData = new FormData();
    formData.append('titulo', reportForm.titulo);
    formData.append('descripcion', reportForm.descripcion);
    formData.append('reservaId', selectedReserva.id);
    if (reportImage) formData.append('imagen', reportImage);

    await fetch(`${API_URL}/reportes`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${jwtToken}` },
      body: formData,
    });

    setSendingReport(false);
    setReportModalOpen(false);
    loadReservas();
  };

  if (loading) {
    return <div className="p-6 text-center">Cargando reservas…</div>;
  }

  return (
    <div className="min-h-screen p-6 bg-slate-100">
      <h1 className="text-3xl font-bold mb-6">Mis Reservas</h1>

      {/* ================= MOBILE ================= */}
      <div className="space-y-4 lg:hidden">
        {reservations.map((r) => (
          <div key={r.id} className="bg-white p-4 rounded-xl shadow">
            <p className="font-bold">{r.labName}</p>
            <p className="text-sm text-slate-500">
              {r.date} · {r.time}
            </p>

            <span
              className={`inline-block mt-2 px-2 py-1 rounded text-xs font-bold ${
                r.status === 'Confirmada'
                  ? 'bg-green-100 text-green-700'
                  : r.status === 'Pendiente'
                  ? 'bg-yellow-100 text-yellow-700'
                  : 'bg-slate-200'
              }`}
            >
              {r.status}
            </span>

            <div className="flex gap-2 mt-4 flex-wrap">
              <button
                onClick={() => handleCancel(r.id)}
                className="px-3 py-1 border rounded"
              >
                Cancelar
              </button>

              <button
                onClick={() => {
                  setSelectedReserva(r);
                  setReportModalOpen(true);
                }}
                className="px-3 py-1 bg-red-100 text-red-600 rounded"
              >
                Reportar
              </button>

              {r.status === 'Pendiente' && (
                <button
                  onClick={() => handlePay(r)}
                  className="px-3 py-1 bg-blue-600 text-white rounded"
                >
                  <CreditCard size={14} className="inline" /> Pagar
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* ================= DESKTOP ================= */}
      <div className="hidden lg:block bg-white rounded-xl shadow overflow-x-auto">
        <table className="w-full">
          <thead className="bg-slate-50">
            <tr>
              <th className="p-4 text-left">Laboratorio</th>
              <th className="p-4">Fecha</th>
              <th className="p-4">Hora</th>
              <th className="p-4">Estado</th>
              <th className="p-4 text-right">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {reservations.map((r) => (
              <tr key={r.id} className="border-t">
                <td className="p-4 font-semibold">{r.labName}</td>
                <td className="p-4">{r.date}</td>
                <td className="p-4">{r.time}</td>
                <td className="p-4">{r.status}</td>
                <td className="p-4">
                  <div className="flex justify-end gap-2 flex-wrap">
                    <button onClick={() => handleCancel(r.id)}>Cancelar</button>

                    <button
                      onClick={() => {
                        setSelectedReserva(r);
                        setReportModalOpen(true);
                      }}
                      className="text-red-600"
                    >
                      Reportar
                    </button>

                    {r.status === 'Pendiente' && (
                      <button
                        onClick={() => handlePay(r)}
                        className="bg-blue-600 text-white px-3 py-1 rounded"
                      >
                        <CreditCard size={14} /> Pagar
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* ================= MODAL ================= */}
      {reportModalOpen && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-xl w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">Reportar fallo</h2>

            <form onSubmit={submitReport} className="space-y-3">
              <input
                className="w-full border p-2 rounded"
                placeholder="Título"
                value={reportForm.titulo}
                onChange={(e) =>
                  setReportForm({ ...reportForm, titulo: e.target.value })
                }
              />
              <textarea
                className="w-full border p-2 rounded"
                placeholder="Descripción"
                value={reportForm.descripcion}
                onChange={(e) =>
                  setReportForm({
                    ...reportForm,
                    descripcion: e.target.value,
                  })
                }
              />
              <input
                type="file"
                onChange={(e) => setReportImage(e.target.files[0])}
              />
              <button
                disabled={sendingReport}
                className="w-full bg-red-600 text-white py-2 rounded"
              >
                {sendingReport ? 'Enviando…' : 'Enviar reporte'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentReservations;
