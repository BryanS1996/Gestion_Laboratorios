import { useEffect, useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useNavigate, useLocation } from 'react-router-dom';
import { CheckCircle } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const StudentReservations = () => {
  const { user, jwtToken } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const [newReservationDetails, setNewReservationDetails] = useState(null);

  useEffect(() => {
    if (location.state?.reservationCreated) {
      setNewReservationDetails(location.state.reservationData);
      window.history.replaceState({}, document.title);
    }
  }, [location]);

  // --- FUNCIÓN CORREGIDA PARA MOSTRAR LA FECHA DE RESERVA EXACTA ---
  const formatReservationDate = (fecha) => {
    if (!fecha) return 'Fecha pendiente';
    
    // CASO 1: Si ya viene como texto "2026-02-15", lo mostramos tal cual.
    // Esto evita que JavaScript le reste un día por la zona horaria.
    if (typeof fecha === 'string') {
        // Si viene con hora "2026-02-15T00:00:00.000Z", cortamos solo la fecha
        return fecha.split('T')[0];
    }
    
    // CASO 2: Si viene de Firebase/Firestore como Timestamp (segundos)
    // Usamos UTC para evitar que al restar 5 horas (Ecuador) cambie al día anterior
    const seconds = fecha._seconds || fecha.seconds;
    if (seconds) {
        const dateObj = new Date(seconds * 1000);
        // forzamos el formato en español y zona horaria de Ecuador explícita
        return dateObj.toLocaleDateString('es-EC', { 
            timeZone: 'America/Guayaquil',
            year: 'numeric',
            month: '2-digit',
            day: '2-digit' 
        });
    }

    // CASO 3: Objeto Date nativo
    if (fecha instanceof Date) {
        return fecha.toISOString().split('T')[0];
    }

    return 'Fecha inválida';
  };
  // -------------------------------------------------------------

  useEffect(() => {
    const load = async () => {
      if (!jwtToken) return;
      try {
        setLoading(true);
        const res = await fetch(`${API_URL}/reservas/mine`, {
          headers: { Authorization: `Bearer ${jwtToken}` },
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Error cargando reservas');
        
        setReservations((data.reservas || []).map((r) => ({
          ...r,
          labName: r.laboratorioNombre || r.laboratorioId,
          
          // AQUÍ: Usamos el campo 'fecha' (día reservado) y NO 'createdAt'
          date: formatReservationDate(r.fecha), 
          
          time: `${String(r.horaInicio).padStart(2,'0')}:00`,
          duration: r.horaFin - r.horaInicio,
          status: r.estado === 'confirmada' ? 'Confirmada' : (r.estado === 'pendiente' ? 'Pendiente' : 'Cancelada'),
        })));
        setError(null);
      } catch (e) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [jwtToken]);

  const handleCancel = async (reservationId) => {
      if(!confirm("¿Estás seguro de cancelar esta reserva?")) return;
      
      try {
        const resp = await fetch(`${API_URL}/reservas/${reservationId}/cancel`, {
          method: 'PATCH',
          headers: { Authorization: `Bearer ${jwtToken}` },
        });
        const d = await resp.json();
        if (!resp.ok) throw new Error(d.error || 'Error cancelando');
        
        setReservations((prev) => prev.map((p) => p.id === reservationId ? { ...p, status: 'Cancelada' } : p));
      } catch (e) {
        alert(e.message);
      }
  };

  if (!user || user.role !== 'student') {
    return (
        <div className="min-h-screen flex items-center justify-center">
            <p>Cargando acceso...</p>
        </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100 p-8 relative">
      
      {/* Modal de Éxito al crear reserva */}
      {newReservationDetails && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full overflow-hidden">
            <div className="bg-green-600 p-6 text-center">
              <div className="mx-auto bg-white/20 w-16 h-16 rounded-full flex items-center justify-center mb-4 backdrop-blur-sm">
                <CheckCircle className="text-white w-10 h-10" />
              </div>
              <h3 className="text-2xl font-bold text-white">¡Reserva Exitosa!</h3>
              <p className="text-green-100 mt-2">Tu laboratorio ha sido reservado correctamente.</p>
            </div>
            
            <div className="p-6 space-y-4">
              <div className="bg-slate-50 p-4 rounded-lg border border-slate-100 space-y-3">
                <div className="flex justify-between border-b border-slate-200 pb-2">
                  <span className="text-slate-500 text-sm">Laboratorio</span>
                  <span className="font-semibold text-slate-800">{newReservationDetails.laboratorioNombre}</span>
                </div>
                <div className="flex justify-between border-b border-slate-200 pb-2">
                  <span className="text-slate-500 text-sm">Fecha Reservada</span>
                  {/* Aquí mostramos directamente la fecha que seleccionó el usuario */}
                  <span className="font-semibold text-slate-800">{newReservationDetails.fecha}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500 text-sm">Horario</span>
                  <span className="font-semibold text-slate-800">
                    {String(newReservationDetails.horaInicio).padStart(2,'0')}:00 - {String(newReservationDetails.horaFin).padStart(2,'0')}:00
                  </span>
                </div>
              </div>

              <button 
                onClick={() => setNewReservationDetails(null)}
                className="w-full bg-slate-900 text-white py-3 rounded-lg font-semibold hover:bg-slate-800 transition-colors"
              >
                Entendido
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Tabla Principal */}
      <div className="max-w-5xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-slate-800">Mis Reservas</h1>
          <button
            onClick={() => navigate('/catalogo')}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 shadow-md transition-all"
          >
            Nueva Reserva
          </button>
        </div>

        <div className="bg-white rounded-lg shadow-md overflow-hidden border border-slate-200">
          <table className="w-full">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Laboratorio</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Fecha de Reserva</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Hora</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Duración</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Estado</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Acciones</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-slate-200">
              {reservations.map((reservation) => (
                <tr key={reservation.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900">
                    {reservation.labName}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-700 font-bold">
                    {/* Aquí se muestra la fecha procesada */}
                    {reservation.date}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                    {reservation.time}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                    {reservation.duration} hora(s)
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      reservation.status === 'Confirmada' ? 'bg-green-100 text-green-800' :
                      reservation.status === 'Cancelada' ? 'bg-slate-100 text-slate-800' :
                      'bg-yellow-100 text-yellow-800'
                    }`}>
                      {reservation.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                    {reservation.status !== 'Cancelada' && (
                        <div className="flex gap-3">
                            <button
                                className="text-red-600 hover:text-red-900 font-medium transition-colors hover:underline"
                                onClick={() => handleCancel(reservation.id)}
                            >
                                Cancelar
                            </button>
                            <button className="text-blue-600 hover:text-blue-900 font-medium transition-colors hover:underline">
                                Editar
                            </button>
                        </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          
          {loading && (
             <div className="p-8 text-center text-slate-500">Cargando reservas...</div>
          )}
          
          {!loading && reservations.length === 0 && (
             <div className="p-12 text-center text-slate-500">
                 No tienes reservas activas aún.
             </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default StudentReservations;