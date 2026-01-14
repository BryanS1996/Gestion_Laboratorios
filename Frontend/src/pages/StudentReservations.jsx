import { useEffect, useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useNavigate, useLocation } from 'react-router-dom';
import { CheckCircle, AlertTriangle, X, Send } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const StudentReservations = () => {
  const { user, jwtToken } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Modales
  const [newReservationDetails, setNewReservationDetails] = useState(null);
  const [reportModalOpen, setReportModalOpen] = useState(false);
  const [selectedReserva, setSelectedReserva] = useState(null);
  const [reportForm, setReportForm] = useState({ titulo: '', descripcion: '' });
  const [sendingReport, setSendingReport] = useState(false);

  useEffect(() => {
    if (location.state?.reservationCreated) {
      setNewReservationDetails(location.state.reservationData);
      window.history.replaceState({}, document.title);
    }
  }, [location]);

  // --- 1. FUNCIÓN DE FECHAS (IMPORTANTE) ---
  const formatReservationDate = (fecha) => {
    if (!fecha) return 'Pendiente';
    // Si viene como string
    if (typeof fecha === 'string') return fecha.split('T')[0];
    // Si viene como Timestamp (seconds)
    const seconds = fecha._seconds || fecha.seconds;
    if (seconds) {
        return new Date(seconds * 1000).toLocaleDateString('es-EC', { 
            timeZone: 'America/Guayaquil', year: 'numeric', month: '2-digit', day: '2-digit' 
        });
    }
    return 'Fecha inválida';
  };

  // --- 2. CARGAR DATOS ---
  const loadReservas = async () => {
    if (!jwtToken) return;
    try {
      setLoading(true);
      const res = await fetch(`${API_URL}/reservas/mine`, {
        headers: { Authorization: `Bearer ${jwtToken}` },
      });
      const data = await res.json();
      
      if (res.ok) {
        setReservations((data.reservas || []).map((r) => ({
          ...r,
          labName: r.laboratorioNombre || r.laboratorioId,
          date: formatReservationDate(r.fecha),
          time: `${String(r.horaInicio).padStart(2,'0')}:00`,
          duration: r.horaFin - r.horaInicio,
          status: r.estado === 'confirmada' ? 'Confirmada' : (r.estado === 'pendiente' ? 'Pendiente' : 'Cancelada'),
        })));
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadReservas(); }, [jwtToken]);

  // --- 3. LÓGICA DE REPORTAR (MONGODB) ---
  const openReportModal = (reserva) => {
    setSelectedReserva(reserva);
    setReportForm({ titulo: '', descripcion: '' });
    setReportModalOpen(true);
  };

  const submitReport = async (e) => {
    e.preventDefault();
    if (!reportForm.titulo || !reportForm.descripcion) return alert("Completa los campos");

    try {
      setSendingReport(true);
      const payload = {
        titulo: reportForm.titulo,
        descripcion: reportForm.descripcion,
        laboratorioId: selectedReserva.laboratorioId || 'LAB-GEN',
        laboratorioNombre: selectedReserva.labName
      };

      const res = await fetch(`${API_URL}/reportes`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${jwtToken}`
        },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        alert("✅ Reporte enviado correctamente.");
        setReportModalOpen(false);
      } else {
        alert("❌ Error al enviar reporte");
      }
    } catch (error) {
      alert("Error de conexión");
    } finally {
      setSendingReport(false);
    }
  };

  const handleCancel = async (id) => {
      if(!confirm("¿Cancelar reserva?")) return;
      try {
        await fetch(`${API_URL}/reservas/${id}/cancel`, {
          method: 'PATCH',
          headers: { Authorization: `Bearer ${jwtToken}` }
        });
        loadReservas(); // Recargar lista
      } catch (e) { alert(e.message); }
  };

  return (
    <div className="min-h-screen bg-slate-100 p-8 relative">
      
      {/* MODAL DE REPORTE */}
      {reportModalOpen && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-lg w-full p-6 animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center mb-4 border-b pb-4">
                <h3 className="text-xl font-bold text-red-600 flex items-center gap-2">
                    <AlertTriangle /> Reportar Fallo
                </h3>
                <button onClick={() => setReportModalOpen(false)}><X /></button>
            </div>
            
            <p className="text-sm text-slate-500 mb-4">
                Reportando problema en: <strong>{selectedReserva?.labName}</strong>
            </p>

            <form onSubmit={submitReport} className="space-y-4">
                <input 
                    className="w-full border p-3 rounded-lg"
                    placeholder="Título del problema (ej: Teclado dañado)"
                    value={reportForm.titulo}
                    onChange={e => setReportForm({...reportForm, titulo: e.target.value})}
                />
                <textarea 
                    className="w-full border p-3 rounded-lg h-32 resize-none"
                    placeholder="Describe qué sucedió..."
                    value={reportForm.descripcion}
                    onChange={e => setReportForm({...reportForm, descripcion: e.target.value})}
                />
                <button 
                    disabled={sendingReport}
                    className="w-full bg-red-600 text-white py-3 rounded-lg font-bold hover:bg-red-700"
                >
                    {sendingReport ? 'Enviando...' : 'Enviar Reporte'}
                </button>
            </form>
          </div>
        </div>
      )}

      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-slate-800 mb-8">Mis Reservas</h1>

        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <table className="w-full">
            <thead className="bg-slate-50 border-b">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase">Laboratorio</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase">Fecha</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase">Hora</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase">Estado</th>
                <th className="px-6 py-4 text-right text-xs font-bold text-slate-500 uppercase">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {reservations.map((reservation) => (
                <tr key={reservation.id}>
                  <td className="px-6 py-4 font-bold text-slate-700">{reservation.labName}</td>
                  <td className="px-6 py-4 text-slate-600">{reservation.date}</td>
                  <td className="px-6 py-4 text-slate-500">{reservation.time}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                      reservation.status === 'Confirmada' ? 'bg-green-100 text-green-700' :
                      reservation.status === 'Cancelada' ? 'bg-slate-100 text-slate-600' : 'bg-yellow-100'
                    }`}>{reservation.status}</span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    {reservation.status !== 'Cancelada' && (
                        <div className="flex justify-end gap-3">
                            <button
                                className="text-slate-400 hover:text-red-600 text-sm font-medium"
                                onClick={() => handleCancel(reservation.id)}
                            >
                                Cancelar
                            </button>
                            
                            {/* --- AQUÍ ESTÁ EL CAMBIO: BOTÓN REPORTAR --- */}
                            <button 
                                onClick={() => openReportModal(reservation)}
                                className="flex items-center gap-1 text-red-600 bg-red-50 hover:bg-red-100 px-3 py-1 rounded text-sm font-bold transition-colors"
                            >
                                <AlertTriangle size={14} />
                                Reportar
                            </button>
                        </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {reservations.length === 0 && !loading && <div className="p-8 text-center text-slate-400">Sin reservas</div>}
        </div>
      </div>
    </div>
  );
};

export default StudentReservations;