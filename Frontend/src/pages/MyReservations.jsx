// src/pages/MyReservations.jsx
import { useEffect, useState } from "react";
import { useAuth } from "../hooks/useAuth";
import { useNavigate, useLocation } from "react-router-dom";
import { CreditCard, AlertCircle, XCircle, Clock, Calendar, MapPin } from "lucide-react";
import axios from "axios";
import toast from "react-hot-toast";
import { DateTime } from "luxon";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

export default function StudentReservations() {
  const { jwtToken } = useAuth();

  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);

  // Report modal
  const [reportModalOpen, setReportModalOpen] = useState(false);
  const [selectedReserva, setSelectedReserva] = useState(null);
  const [reportForm, setReportForm] = useState({ titulo: "", descripcion: "" });
  const [reportImage, setReportImage] = useState(null);
  const [sendingReport, setSendingReport] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();

  // ---------- Helpers ----------
  const formatDate = (fecha) => {
    if (!fecha) return "—";

    // Already "YYYY-MM-DD"
    if (typeof fecha === "string" && /^\d{4}-\d{2}-\d{2}$/.test(fecha)) return fecha;

    // ISO string -> normalize
    if (typeof fecha === "string") {
      const dt = DateTime.fromISO(fecha, { zone: "utc" });
      return dt.isValid ? dt.toISODate() : fecha.split("T")[0];
    }

    // Firestore timestamp-like
    const seconds = fecha.seconds || fecha._seconds;
    if (!seconds) return "—";

    // IMPORTANT: Use UTC to avoid "yesterday" shift
    return DateTime.fromSeconds(seconds, { zone: "utc" }).toISODate();
  };

  const buildTimeRange = (r) =>
    `${String(r.horaInicio).padStart(2, "0")}:00 - ${String(r.horaFin).padStart(2, "0")}:00`;

  const mapStatus = (estado) => {
    switch (estado) {
      case "confirmada":
        return { statusText: "Confirmada", statusClass: "bg-green-100 text-green-700 ring-1 ring-green-200" };
      case "pendiente":
        return { statusText: "Pendiente", statusClass: "bg-yellow-100 text-yellow-800 ring-1 ring-yellow-200" };
      case "cancelada_por_prioridad":
        return { statusText: "Cancelada (Prioridad)", statusClass: "bg-amber-100 text-amber-800 ring-1 ring-amber-200" };
      case "cancelada":
        return { statusText: "Cancelada", statusClass: "bg-red-50 text-red-600 ring-1 ring-red-100" };
      case "cancelada_pago_fallido":
        return { statusText: "Pago fallido", statusClass: "bg-red-50 text-red-600 ring-1 ring-red-100" };
      default:
        return { statusText: "Desconocido", statusClass: "bg-slate-200 text-slate-700" };
    }
  };

  // ---------- Load reservations ----------
  const loadReservas = async () => {
    try {
      setLoading(true);

      const res = await fetch(`${API_URL}/reservas/mine`, {
        headers: { Authorization: `Bearer ${jwtToken}` },
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Error loading reservations");

      const mapped = (data.reservas || []).map((r) => {
        const { statusText, statusClass } = mapStatus(r.estado);
        return {
          ...r,
          labName: r.laboratorioNombre || r.laboratorioId,
          date: formatDate(r.fecha),
          time: buildTimeRange(r),
          statusText,
          statusClass,
        };
      });

      setReservations(mapped);
    } catch (err) {
      console.error(err);
      toast.error(err.message || "Error al cargar reservas");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (jwtToken) loadReservas();
  }, [jwtToken]);

  // ---------- Toast after payment redirect ----------
  useEffect(() => {
    const params = new URLSearchParams(location.search);

    if (params.get("paid") === "1") {
      toast.success("✅ Reserva confirmada");
      if (jwtToken) loadReservas();

      // Clean URL
      navigate("/mis-reservas", { replace: true });
    }
  }, [location.search, jwtToken, navigate]);

  // ---------- Actions ----------
  const handleCancel = async (id) => {
    if (!confirm("¿Estás seguro de cancelar esta reserva?")) return;

    try {
      await fetch(`${API_URL}/reservas/${id}/cancel`, {
        method: "PATCH",
        headers: { Authorization: `Bearer ${jwtToken}` },
      });
      toast.success("Reserva cancelada");
      loadReservas();
    } catch {
      toast.error("Error al cancelar");
    }
  };

  const handlePay = async (r) => {
    const t = toast.loading("Iniciando pago...");

    try {
      const res = await axios.post(
        `${API_URL}/stripe/checkout`,
        {
          laboratorioId: r.laboratorioId,
          laboratorioNombre: r.laboratorioNombre || r.laboratorioId,
          fecha: r.date, // already YYYY-MM-DD
          horaInicio: Number(r.horaInicio),
          horaFin: Number(r.horaFin),
        },
        { headers: { Authorization: `Bearer ${jwtToken}` } }
      );

      if (res.data?.status === "paid") {
        toast.success("Pago ya registrado ✅", { id: t });
        await loadReservas();
        return;
      }

      if (res.data?.url) {
        toast.success("Redirigiendo a Stripe...", { id: t });
        window.location.href = res.data.url;
        return;
      }

      toast.error("No se recibió URL de pago", { id: t });
    } catch (error) {
      console.error(error);
      toast.error(error?.response?.data?.error || "Error iniciando el pago", { id: t });
    }
  };

  const submitReport = async (e) => {
    e.preventDefault();
    if (!selectedReserva?.id) return;

    setSendingReport(true);
    try {
      const formData = new FormData();
      formData.append("titulo", reportForm.titulo);
      formData.append("descripcion", reportForm.descripcion);
      formData.append("reservaId", selectedReserva.id);
      if (reportImage) formData.append("imagen", reportImage);

      await fetch(`${API_URL}/reportes`, {
        method: "POST",
        headers: { Authorization: `Bearer ${jwtToken}` },
        body: formData,
      });

      toast.success("Reporte enviado");
      setReportModalOpen(false);
      setSelectedReserva(null);
      setReportForm({ titulo: "", descripcion: "" });
      setReportImage(null);

      loadReservas();
    } catch {
      toast.error("Error enviando reporte");
    } finally {
      setSendingReport(false);
    }
  };

  // ---------- Render ----------
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh] text-slate-500">
        Cargando reservas...
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4 md:p-8 bg-slate-50">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-2xl md:text-3xl font-bold mb-6 text-slate-800">Mis Reservas</h1>

        {/* Mobile */}
        <div className="grid grid-cols-1 gap-4 lg:hidden">
          {reservations.map((r) => (
            <div key={r.id} className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 flex flex-col gap-3">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-bold text-lg text-slate-800">{r.labName}</h3>
                  <div className="flex items-center gap-2 text-sm text-slate-500 mt-1">
                    <Calendar size={14} /> {r.date}
                    <span className="text-slate-300">|</span>
                    <Clock size={14} /> {r.time}
                  </div>
                </div>
                <span className={`px-2.5 py-1 rounded-lg text-xs font-bold ${r.statusClass}`}>
                  {r.statusText}
                </span>
              </div>

              <div className="flex gap-2 mt-2 pt-3 border-t border-slate-100">
                <button
                  onClick={() => handleCancel(r.id)}
                  className="flex-1 flex items-center justify-center gap-1 py-2 px-3 border border-slate-200 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-50"
                >
                  Cancelar
                </button>

                <button
                  onClick={() => { setSelectedReserva(r); setReportModalOpen(true); }}
                  className="flex-1 flex items-center justify-center gap-1 py-2 px-3 border border-slate-200 rounded-lg text-sm font-medium text-amber-600 hover:bg-amber-50"
                >
                  Reportar
                </button>

                {r.statusText === "Pendiente" && (
                  <button
                    onClick={() => handlePay(r)}
                    className="flex-1 flex items-center justify-center gap-1 py-2 px-3 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 shadow-sm shadow-blue-200"
                  >
                    Pagar
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Desktop */}
        <div className="hidden lg:block bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="p-4 text-sm font-semibold text-slate-600">Laboratorio</th>
                <th className="p-4 text-sm font-semibold text-slate-600">Fecha</th>
                <th className="p-4 text-sm font-semibold text-slate-600">Hora</th>
                <th className="p-4 text-sm font-semibold text-slate-600">Estado</th>
                <th className="p-4 text-sm font-semibold text-slate-600 text-right">Acciones</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100">
              {reservations.map((r) => (
                <tr key={r.id} className="hover:bg-slate-50 transition-colors">
                  <td className="p-4 font-medium text-slate-800">
                    <div className="flex items-center gap-2">
                      <MapPin size={16} className="text-slate-400" />
                      {r.labName}
                    </div>
                  </td>

                  <td className="p-4 text-slate-600 text-sm">{r.date}</td>
                  <td className="p-4 text-slate-600 text-sm">{r.time}</td>

                  <td className="p-4">
                    <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-bold ${r.statusClass}`}>
                      {r.statusText}
                    </span>
                  </td>

                  <td className="p-4">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => handleCancel(r.id)}
                        className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-full transition-colors"
                        title="Cancelar Reserva"
                      >
                        <XCircle size={20} />
                      </button>

                      <button
                        onClick={() => { setSelectedReserva(r); setReportModalOpen(true); }}
                        className="p-2 text-slate-400 hover:text-amber-600 hover:bg-amber-50 rounded-full transition-colors"
                        title="Reportar problema"
                      >
                        <AlertCircle size={20} />
                      </button>

                      {r.statusText === "Pendiente" && (
                        <button
                          onClick={() => handlePay(r)}
                          className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 text-white text-xs font-bold rounded-lg hover:bg-slate-800 transition-all shadow-sm"
                        >
                          <CreditCard size={14} /> Pagar
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}

              {reservations.length === 0 && (
                <tr>
                  <td colSpan="5" className="p-8 text-center text-slate-500 italic">
                    No tienes reservas registradas.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Report Modal */}
      {reportModalOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white p-6 rounded-2xl w-full max-w-md shadow-2xl">
            <div className="flex justify-between items-center mb-5">
              <h2 className="text-xl font-bold text-slate-800">Reportar Incidencia</h2>
              <button onClick={() => setReportModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <XCircle size={24} />
              </button>
            </div>

            <form onSubmit={submitReport} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Título</label>
                <input
                  className="w-full border border-slate-300 p-2.5 rounded-xl outline-none"
                  value={reportForm.titulo}
                  onChange={(e) => setReportForm({ ...reportForm, titulo: e.target.value })}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Descripción</label>
                <textarea
                  className="w-full border border-slate-300 p-2.5 rounded-xl outline-none h-32 resize-none"
                  value={reportForm.descripcion}
                  onChange={(e) => setReportForm({ ...reportForm, descripcion: e.target.value })}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Evidencia (Imagen)</label>
                <input
                  type="file"
                  className="block w-full text-sm text-slate-500"
                  onChange={(e) => setReportImage(e.target.files?.[0] || null)}
                  accept="image/*"
                />
              </div>

              <button
                disabled={sendingReport}
                className={`w-full py-3 rounded-xl font-bold text-white ${
                  sendingReport ? "bg-slate-400 cursor-not-allowed" : "bg-red-600 hover:bg-red-700"
                }`}
              >
                {sendingReport ? "Enviando..." : "Enviar Reporte"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
