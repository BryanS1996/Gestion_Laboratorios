import { useEffect, useMemo, useState } from 'react';
import { X } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const ReservationModal = ({ isOpen, onClose, lab, onReserve, jwtToken }) => {
  const [date, setDate] = useState('');
  const [slots, setSlots] = useState([]);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const minDate = useMemo(() => {
    const d = new Date();
    return d.toISOString().split('T')[0];
  }, []);

  useEffect(() => {
    const loadSlots = async () => {
      if (!isOpen || !lab?.id || !date || !jwtToken) return;
      try {
        setLoading(true);
        setError(null);
        setSelectedSlot(null);
        const res = await fetch(`${API_URL}/reservas/availability?laboratorioId=${encodeURIComponent(lab.id)}&fecha=${encodeURIComponent(date)}`, {
          headers: { Authorization: `Bearer ${jwtToken}` },
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Error cargando disponibilidad');
        setSlots(data.slots || []);
      } catch (e) {
        setError(e.message);
        setSlots([]);
      } finally {
        setLoading(false);
      }
    };
    loadSlots();
  }, [isOpen, lab?.id, date, jwtToken]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!lab?.id) return;
    if (!date) return alert('Por favor, selecciona una fecha');
    if (!selectedSlot) return alert('Selecciona un horario disponible');

    await onReserve({
      laboratorioId: lab.id,
      laboratorioNombre: lab.nombre,
      fecha: date,
      horaInicio: selectedSlot.start,
      horaFin: selectedSlot.end,
    });

    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full mx-4">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h2 className="text-xl font-bold text-slate-800">Reservar laboratorio</h2>
            <p className="text-sm text-slate-600">{lab?.nombre || ''}</p>
          </div>
          <button onClick={onClose} className="text-slate-500 hover:text-slate-700">
            <X size={24} />
          </button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 mb-4 text-sm text-slate-700">
            <div className="flex flex-wrap gap-x-4 gap-y-1">
              {lab?.capacidad != null && <span>👥 Capacidad: <b>{lab.capacidad}</b></span>}
              {lab?.ubicacion && <span>📍 {lab.ubicacion}</span>}
              {lab?.tipo && <span>🧪 {lab.tipo}</span>}
            </div>
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium text-slate-700 mb-1">Fecha</label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              min={minDate}
              className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          <div className="mb-4">
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-medium text-slate-700">Horario</label>
              {loading && <span className="text-xs text-slate-500">Cargando...</span>}
            </div>

            {error && <p className="text-sm text-red-600 mb-2">{error}</p>}

            {!date ? (
              <p className="text-sm text-slate-500">Selecciona una fecha para ver disponibilidad.</p>
            ) : (
              <div className="grid grid-cols-2 gap-2">
                {slots.map((s) => {
                  const active = selectedSlot?.label === s.label;
                  return (
                    <button
                      key={s.label}
                      type="button"
                      disabled={!s.disponible}
                      onClick={() => s.disponible && setSelectedSlot(s)}
                      className={`text-left px-3 py-2 rounded-md border text-sm transition
                        ${s.disponible ? 'border-slate-300 hover:border-blue-400 hover:bg-blue-50' : 'border-slate-200 bg-slate-100 text-slate-400 cursor-not-allowed'}
                        ${active ? 'border-blue-600 ring-2 ring-blue-200 bg-blue-50' : ''}
                      `}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-medium">{s.label}</span>
                        <span className={`text-xs px-2 py-0.5 rounded-full ${s.disponible ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                          {s.disponible ? 'Disponible' : 'Ocupado'}
                        </span>
                      </div>
                      <div className="text-xs text-slate-500 mt-1">Duración: {s.end - s.start}h</div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
          <div className="flex justify-end space-x-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-slate-600 border border-slate-300 rounded-md hover:bg-slate-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              Reservar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ReservationModal;