import { useEffect, useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useNavigate, useLocation } from 'react-router-dom';
import { CheckCircle, AlertTriangle, X, Send, Image as ImageIcon, CreditCard } from 'lucide-react';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const StudentReservations = () => {
  const { user, jwtToken } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);

  const [newReservationDetails, setNewReservationDetails] = useState(null);
  const [reportModalOpen, setReportModalOpen] = useState(false);
  const [selectedReserva, setSelectedReserva] = useState(null);
  const [reportForm, setReportForm] = useState({ titulo: '', descripcion: '' });
  const [sendingReport, setSendingReport] = useState(false);
  const [reportImage, setReportImage] = useState(null);

  useEffect(() => {
    if (location.state?.reservationCreated) {
      setNewReservationDetails(location.state.reservationData);
      window.history.replaceState({}, document.title);
    }
  }, [location]);

  const formatReservationDate = (fecha) => {
    if (!fecha) return 'Pendiente';
    if (typeof fecha === 'string') return fecha.split('T')[0];
    const seconds = fecha._seconds || fecha.seconds;
    if (seconds) {
      return new Date(seconds * 1000).toLocaleDateString('es-EC', {
        timeZone: 'America/Guayaquil',
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
      });
    }
    return 'Fecha inválida';
  };

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
          time: `${String(r.horaInicio).padStart(2, '0')}:00`,
          duration: r.horaFin - r.horaInicio,
          status: r.estado === 'confirmada'
            ? 'Confirmada'
            : (r.estado === 'pendiente' ? 'Pendiente' : 'Cancelada'),
        })));
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadReservas(); }, [jwtToken]);

  const openReportModal = (reserva) => {
    setSelectedReserva(reserva);
    setReportForm({ titulo: '', descripcion: '' });
    setReportImage(null);
    setReportModalOpen(true);
  };

  const closeReportModal = () => {
    setReportModalOpen(false);
    setSelectedReserva(null);
    setReportForm({ titulo: '', descripcion: '' });
    setReportImage(null);
  };

  const submitReport = async (e) => {
    e.preventDefault();
    if (!reportForm.titulo || !reportForm.descripcion) return alert("Completa los campos");

    try {
      setSendingReport(true);

      const formData = new FormData();
      formData.append('titulo', reportForm.titulo);
      formData.append('descripcion', reportForm.descripcion);
      formData.append('laboratorioId', selectedReserva?.laboratorioId || 'LAB-GEN');
      formData.append('laboratorioNombre', selectedReserva?.labName || '');
      formData.append('reservaId', selectedReserva?.id || selectedReserva?._id || '');

      if (reportImage) {
        formData.append('imagen', reportImage);
      }

      const res = await fetch(`${API_URL}/reportes`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${jwtToken}`,
        },
        body: formData
      });

      const data = await res.json().catch(() => ({}));

      if (res.ok) {
        alert("✅ Reporte enviado correctamente (imagen incluida si adjuntaste).");
        closeReportModal();
      } else {
        alert(`❌ Error al enviar reporte: ${data.error || data.message || 'Error desconocido'}`);
      }
    } catch (error) {
      console.error(error);
      alert("Error de conexión");
    } finally {
      setSendingReport(false);
    }
  };

  const handleCancel = async (id) => {
    if (!confirm("¿Cancelar reserva?")) return;
    try {
      await fetch(`${API_URL}/reservas/${id}/cancel`, {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${jwtToken}` }
      });
      loadReservas();
    } catch (e) { alert(e.message); }
  };

  const handlePay = async (reserva) => {
    try {
      const res = await axios.post(`${API_URL}/stripe/create-checkout-session`, reserva, {
        headers: { Authorization: `Bearer ${jwtToken}` }
      });

      if (res.data?.url) {
        window.location.href = res.data.url;
      } else {
        alert('No se pudo generar la sesión de pago');
      }
    } catch (err) {
      console.error('Error iniciando pago:', err);
      alert('Error al redirigir a Stripe');
    }
  };

  return (
    // ✅ AQUÍ ESTÁ EL CAMBIO DE FONDO
    <div 
      className="min-h-screen p-8 relative z-10" // Quitamos bg-slate-100
      style={{
        backgroundColor: "#d3b11d", 
        backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 304 304' width='304' height='304'%3E%3Cpath fill='%230066ec' fill-opacity='0.4' d='M44.1 224a5 5 0 1 1 0 2H0v-2h44.1zm160 48a5 5 0 1 1 0 2H82v-2h122.1zm57.8-46a5 5 0 1 1 0-2H304v2h-42.1zm0 16a5 5 0 1 1 0-2H304v2h-42.1zm6.2-114a5 5 0 1 1 0 2h-86.2a5 5 0 1 1 0-2h86.2zm-256-48a5 5 0 1 1 0 2H0v-2h12.1zm185.8 34a5 5 0 1 1 0-2h86.2a5 5 0 1 1 0 2h-86.2zM258 12.1a5 5 0 1 1-2 0V0h2v12.1zm-64 208a5 5 0 1 1-2 0v-54.2a5 5 0 1 1 2 0v54.2zm48-198.2V80h62v2h-64V21.9a5 5 0 1 1 2 0zm16 16V64h46v2h-48V37.9a5 5 0 1 1 2 0zm-128 96V208h16v12.1a5 5 0 1 1-2 0V210h-16v-76.1a5 5 0 1 1 2 0zm-5.9-21.9a5 5 0 1 1 0 2H114v48H85.9a5 5 0 1 1 0-2H112v-48h12.1zm-6.2 130a5 5 0 1 1 0-2H176v-74.1a5 5 0 1 1 2 0V242h-60.1zm-16-64a5 5 0 1 1 0-2H114v48h10.1a5 5 0 1 1 0 2H112v-48h-10.1zM66 284.1a5 5 0 1 1-2 0V274H50v30h-2v-32h18v12.1zM236.1 176a5 5 0 1 1 0 2H226v94h48v32h-2v-30h-48v-98h12.1zm25.8-30a5 5 0 1 1 0-2H274v44.1a5 5 0 1 1-2 0V146h-10.1zm-64 96a5 5 0 1 1 0-2H208v-80h16v-14h-42.1a5 5 0 1 1 0-2H226v18h-16v80h-12.1zm86.2-210a5 5 0 1 1 0 2H272V0h2v32h10.1zM98 101.9V146H53.9a5 5 0 1 1 0-2H96v-42.1a5 5 0 1 1 2 0zM53.9 34a5 5 0 1 1 0-2H80V0h2v34H53.9zm60.1 3.9V66H82v64H69.9a5 5 0 1 1 0-2H80V64h32V37.9a5 5 0 1 1 2 0zM101.9 82a5 5 0 1 1 0-2H128V37.9a5 5 0 1 1 2 0V82h-28.1zm16-64a5 5 0 1 1 0-2H146v44.1a5 5 0 1 1-2 0V18h-26.1zm102.2 270a5 5 0 1 1 0 2H98v14h-2v-16h124.1zM242 149.9V160h16v34h-16v62h48v48h-2v-46h-48v-66h16v-30h-16v-12.1a5 5 0 1 1 2 0zM53.9 18a5 5 0 1 1 0-2H64V2H48V0h18v18H53.9zm112 32a5 5 0 1 1 0-2H192V0h50v2h-48v48h-28.1zm-48-48a5 5 0 0 1-9.8-2h2.07a3 3 0 1 0 5.66 0H178v34h-18V21.9a5 5 0 1 1 2 0V32h14V2h-58.1zm0 96a5 5 0 1 1 0-2H137l32-32h39V21.9a5 5 0 1 1 2 0V66h-40.17l-32 32H117.9zm28.1 90.1a5 5 0 1 1-2 0v-76.51L175.59 80H224V21.9a5 5 0 1 1 2 0V82h-49.59L146 112.41v75.69zm16 32a5 5 0 1 1-2 0v-99.51L184.59 96H300.1a5 5 0 0 1 3.9-3.9v2.07a3 3 0 0 0 0 5.66v2.07a5 5 0 0 1-3.9-3.9H185.41L162 121.41v98.69zm-144-64a5 5 0 1 1-2 0v-3.51l48-48V48h32V0h2v50H66v55.41l-48 48v2.69zM50 53.9v43.51l-48 48V208h26.1a5 5 0 1 1 0 2H0v-65.41l48-48V53.9a5 5 0 1 1 2 0zm-16 16V89.41l-34 34v-2.82l32-32V69.9a5 5 0 1 1 2 0zM12.1 32a5 5 0 1 1 0 2H9.41L0 43.41V40.6L8.59 32h3.51zm265.8 18a5 5 0 1 1 0-2h18.69l7.41-7.41v2.82L297.41 50H277.9zm-16 160a5 5 0 1 1 0-2H288v-71.41l16-16v2.82l-14 14V210h-28.1zm-208 32a5 5 0 1 1 0-2H64v-22.59L40.59 194H21.9a5 5 0 1 1 0-2H41.41L66 216.59V242H53.9zm150.2 14a5 5 0 1 1 0 2H96v-56.6L56.6 162H37.9a5 5 0 1 1 0-2h19.5L98 200.6V256h106.1zm-150.2 2a5 5 0 1 1 0-2H80v-46.59L48.59 178H21.9a5 5 0 1 1 0-2H49.41L82 208.59V258H53.9zM34 39.8v1.61L9.41 66H0v-2h8.59L32 40.59V0h2v39.8zM2 300.1a5 5 0 0 1 3.9 3.9H3.83A3 3 0 0 0 0 302.17V256h18v48h-2v-46H2v42.1zM34 241v63h-2v-62H0v-2h34v1zM17 18H0v-2h16V0h2v18h-1zm273-2h14v2h-16V0h2v16zm-32 273v15h-2v-14h-14v14h-2v-16h18v1zM0 92.1A5.02 5.02 0 0 1 6 97a5 5 0 0 1-6 4.9v-2.07a3 3 0 1 0 0-5.66V92.1zM80 272h2v32h-2v-32zm37.9 32h-2.07a3 3 0 0 0-5.66 0h-2.07a5 5 0 0 1 9.8 0zM5.9 0A5.02 5.02 0 0 1 0 5.9V3.83A3 3 0 0 0 3.83 0H5.9zm294.2 0h2.07A3 3 0 0 0 304 3.83V5.9a5 5 0 0 1-3.9-5.9zm3.9 300.1v2.07a3 3 0 0 0-1.83 1.83h-2.07a5 5 0 0 1 3.9-3.9zM97 100a3 3 0 1 0 0-6 3 3 0 0 0 0 6zm0-16a3 3 0 1 0 0-6 3 3 0 0 0 0 6zm16 16a3 3 0 1 0 0-6 3 3 0 0 0 0 6zm16 16a3 3 0 1 0 0-6 3 3 0 0 0 0 6zm0 16a3 3 0 1 0 0-6 3 3 0 0 0 0 6zm-48 32a3 3 0 1 0 0-6 3 3 0 0 0 0 6zm16 16a3 3 0 1 0 0-6 3 3 0 0 0 0 6zm32 48a3 3 0 1 0 0-6 3 3 0 0 0 0 6zm-16 16a3 3 0 1 0 0-6 3 3 0 0 0 0 6zm32-16a3 3 0 1 0 0-6 3 3 0 0 0 0 6zm0-32a3 3 0 1 0 0-6 3 3 0 0 0 0 6zm16 32a3 3 0 1 0 0-6 3 3 0 0 0 0 6zm32 16a3 3 0 1 0 0-6 3 3 0 0 0 0 6zm0-16a3 3 0 1 0 0-6 3 3 0 0 0 0 6zm-16-64a3 3 0 1 0 0-6 3 3 0 0 0 0 6zm16 0a3 3 0 1 0 0-6 3 3 0 0 0 0 6zm16 96a3 3 0 1 0 0-6 3 3 0 0 0 0 6zm0 16a3 3 0 1 0 0-6 3 3 0 0 0 0 6zm16 16a3 3 0 1 0 0-6 3 3 0 0 0 0 6zm16-144a3 3 0 1 0 0-6 3 3 0 0 0 0 6zm0 32a3 3 0 1 0 0-6 3 3 0 0 0 0 6zm16-32a3 3 0 1 0 0-6 3 3 0 0 0 0 6zm16-16a3 3 0 1 0 0-6 3 3 0 0 0 0 6zm-96 0a3 3 0 1 0 0-6 3 3 0 0 0 0 6zm0 16a3 3 0 1 0 0-6 3 3 0 0 0 0 6zm16-32a3 3 0 1 0 0-6 3 3 0 0 0 0 6zm96 0a3 3 0 1 0 0-6 3 3 0 0 0 0 6zm-16-64a3 3 0 1 0 0-6 3 3 0 0 0 0 6zm16-16a3 3 0 1 0 0-6 3 3 0 0 0 0 6zm-32 0a3 3 0 1 0 0-6 3 3 0 0 0 0 6zm0-16a3 3 0 1 0 0-6 3 3 0 0 0 0 6zm-16 0a3 3 0 1 0 0-6 3 3 0 0 0 0 6zm-16 0a3 3 0 1 0 0-6 3 3 0 0 0 0 6zM49 36a3 3 0 1 0 0-6 3 3 0 0 0 0 6zm-32 0a3 3 0 1 0 0-6 3 3 0 0 0 0 6zm32 16a3 3 0 1 0 0-6 3 3 0 0 0 0 6zM33 68a3 3 0 1 0 0-6 3 3 0 0 0 0 6zm16-48a3 3 0 1 0 0-6 3 3 0 0 0 0 6zm0 240a3 3 0 1 0 0-6 3 3 0 0 0 0 6zm16 32a3 3 0 1 0 0-6 3 3 0 0 0 0 6zm-16-64a3 3 0 1 0 0-6 3 3 0 0 0 0 6zm0 16a3 3 0 1 0 0-6 3 3 0 0 0 0 6zm-16-32a3 3 0 1 0 0-6 3 3 0 0 0 0 6zm80-176a3 3 0 1 0 0-6 3 3 0 0 0 0 6zm16 0a3 3 0 1 0 0-6 3 3 0 0 0 0 6zm-16-16a3 3 0 1 0 0-6 3 3 0 0 0 0 6zm32 48a3 3 0 1 0 0-6 3 3 0 0 0 0 6zm16-16a3 3 0 1 0 0-6 3 3 0 0 0 0 6zm0-32a3 3 0 1 0 0-6 3 3 0 0 0 0 6zm112 176a3 3 0 1 0 0-6 3 3 0 0 0 0 6zm-16 16a3 3 0 1 0 0-6 3 3 0 0 0 0 6zm0 16a3 3 0 1 0 0-6 3 3 0 0 0 0 6zm0 16a3 3 0 1 0 0-6 3 3 0 0 0 0 6zM17 180a3 3 0 1 0 0-6 3 3 0 0 0 0 6zm0 16a3 3 0 1 0 0-6 3 3 0 0 0 0 6zm0-32a3 3 0 1 0 0-6 3 3 0 0 0 0 6zm16 0a3 3 0 1 0 0-6 3 3 0 0 0 0 6zM17 84a3 3 0 1 0 0-6 3 3 0 0 0 0 6zm32 64a3 3 0 1 0 0-6 3 3 0 0 0 0 6zm16-16a3 3 0 1 0 0-6 3 3 0 0 0 0 6z'%3E%3C/path%3E%3C/svg%3E")`,
        backgroundAttachment: "fixed",
        backgroundSize: "200px 200px",
        backgroundRepeat: "repeat"
      }}
    >
      {newReservationDetails && (
        <div className="bg-green-100 border border-green-300 text-green-800 px-6 py-4 rounded-xl mb-6 shadow-md max-w-4xl mx-auto animate-fade-in relative z-20">
          <h2 className="text-lg font-bold mb-2">✅ Reserva realizada con éxito</h2>
          <p><strong>Laboratorio:</strong> {newReservationDetails.laboratorioNombre}</p>
          <p><strong>Fecha:</strong> {newReservationDetails.fecha}</p>
          <p><strong>Horario:</strong> {newReservationDetails.horaInicio}:00 - {newReservationDetails.horaFin}:00</p>
        </div>
      )}
      {reportModalOpen && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-lg w-full p-6 animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center mb-4 border-b pb-4">
              <h3 className="text-xl font-bold text-red-600 flex items-center gap-2">
                <AlertTriangle /> Reportar Fallo
              </h3>
              <button onClick={closeReportModal}><X /></button>
            </div>

            <p className="text-sm text-slate-500 mb-4">
              Reportando problema en: <strong>{selectedReserva?.labName}</strong>
            </p>

            <form onSubmit={submitReport} className="space-y-4">
              <input className="w-full border p-3 rounded-lg" placeholder="Título del problema"
                value={reportForm.titulo} onChange={e => setReportForm({ ...reportForm, titulo: e.target.value })} />

              <textarea className="w-full border p-3 rounded-lg h-32 resize-none" placeholder="Describe qué sucedió..."
                value={reportForm.descripcion} onChange={e => setReportForm({ ...reportForm, descripcion: e.target.value })} />

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Adjuntar imagen (opcional)
                </label>

                <div className="flex items-center gap-3">
                  <label className="inline-flex items-center gap-2 px-4 py-3 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 cursor-pointer transition-all">
                    <ImageIcon size={18} className="text-slate-600" />
                    <span className="text-sm font-semibold text-slate-700">
                      {reportImage ? "Cambiar imagen" : "Subir imagen"}
                    </span>
                    <input type="file" accept="image/*" className="hidden"
                      onChange={(e) => setReportImage(e.target.files?.[0] || null)} />
                  </label>

                  {reportImage && (
                    <button type="button" onClick={() => setReportImage(null)}
                      className="text-sm font-semibold text-slate-500 hover:text-slate-700">
                      Quitar
                    </button>
                  )}
                </div>

                {reportImage && (
                  <p className="mt-2 text-xs text-slate-500">
                    Archivo: <span className="font-semibold">{reportImage.name}</span>
                  </p>
                )}
              </div>

              <button disabled={sendingReport}
                className="w-full bg-red-600 text-white py-3 rounded-lg font-bold hover:bg-red-700 disabled:bg-slate-400 flex items-center justify-center gap-2">
                <Send size={18} />
                {sendingReport ? 'Enviando...' : 'Enviar Reporte'}
              </button>
            </form>
          </div>
        </div>
      )}

      <div className="max-w-6xl mx-auto">
        {/* Titulo con estilo para resaltar sobre el fondo */}
        <h1 className="text-3xl font-bold text-slate-800 mb-8 bg-white/80 backdrop-blur-sm inline-block px-4 py-2 rounded-xl shadow-sm">
          Mis Reservas
        </h1>

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
                    }`}>
                      {reservation.status}
                    </span>
                  </td>

                  <td className="px-6 py-4 text-right">
                    {reservation.status !== 'Cancelada' && (
                      <div className="flex justify-end gap-3">
                        <button className="text-slate-400 hover:text-red-600 text-sm font-medium"
                          onClick={() => handleCancel(reservation.id)}>
                          Cancelar
                        </button>

                        <button onClick={() => openReportModal(reservation)}
                          className="flex items-center gap-1 text-red-600 bg-red-50 hover:bg-red-100 px-3 py-1 rounded text-sm font-bold transition-colors">
                          Reportar
                        </button>

                        {reservation.status === 'Pendiente' && (
                          <button onClick={() => handlePay(reservation)}
                            className="flex items-center gap-1 text-white bg-blue-600 hover:bg-blue-700 px-3 py-1 rounded text-sm font-bold transition-colors">
                            <CreditCard size={16} /> Pagar
                          </button>
                        )}
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {reservations.length === 0 && !loading && (
            <div className="p-8 text-center text-slate-400">Sin reservas</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default StudentReservations;