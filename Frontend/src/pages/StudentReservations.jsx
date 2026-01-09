import { useEffect, useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useNavigate } from 'react-router-dom';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const StudentReservations = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const { jwtToken } = useAuth();
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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
          date: r.fecha?.seconds ? new Date(r.fecha.seconds * 1000).toISOString().split('T')[0] : (typeof r.fecha === 'string' ? r.fecha : ''),
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

  if (!user || user.role !== 'student') {
    return (
      <div className="min-h-screen bg-slate-100 p-8">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-3xl font-bold text-slate-800 mb-4">Acceso Denegado</h1>
          <p className="text-slate-600 mb-8">Solo los estudiantes pueden ver sus reservas.</p>
          <button
            onClick={() => navigate('/catalogo')}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            Ir al Catálogo
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-slate-800">Mis Reservas</h1>
          <button
            onClick={() => navigate('/catalogo')}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            Nueva Reserva
          </button>
        </div>

        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <table className="w-full">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Laboratorio
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Fecha
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Hora
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Duración
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Estado
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-slate-200">
              {reservations.map((reservation) => (
                <tr key={reservation.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900">
                    {reservation.labName}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                    {reservation.date}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                    {reservation.time}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                    {reservation.duration} hora(s)
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      reservation.status === 'Confirmada'
                        ? 'bg-green-100 text-green-800'
                        : reservation.status === 'Cancelada'
                          ? 'bg-slate-100 text-slate-700'
                          : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {reservation.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                    <button
                      className="text-red-600 hover:text-red-900 mr-2"
                      onClick={async () => {
                        try {
                          const resp = await fetch(`${API_URL}/reservas/${reservation.id}/cancel`, {
                            method: 'PATCH',
                            headers: { Authorization: `Bearer ${jwtToken}` },
                          });
                          const d = await resp.json();
                          if (!resp.ok) throw new Error(d.error || 'Error cancelando');
                          setReservations((prev) => prev.map((p) => p.id === reservation.id ? { ...p, status: 'Cancelada' } : p));
                        } catch (e) {
                          alert(e.message);
                        }
                      }}
                    >
                      Cancelar
                    </button>
                    <button className="text-blue-600 hover:text-blue-900">Editar</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {loading && <p className="text-slate-500 mt-4">Cargando reservas...</p>}
        {error && <p className="text-red-600 mt-4">{error}</p>}

        {!loading && reservations.length === 0 && (
          <div className="text-center py-12">
            <p className="text-slate-500 text-lg">No tienes reservas activas.</p>
            <button
              onClick={() => navigate('/catalogo')}
              className="mt-4 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            >
              Hacer una Reserva
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default StudentReservations;