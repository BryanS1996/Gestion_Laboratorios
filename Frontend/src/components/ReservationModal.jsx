import { useEffect, useMemo, useState } from 'react';
import { X } from 'lucide-react';
import toast from 'react-hot-toast';
import { DateTime } from 'luxon';
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
const ZONE = 'America/Guayaquil';

const ReservationModal = ({ isOpen, onClose, lab, onReserve, jwtToken, defaultDate }) => {
  const [date, setDate] = useState(defaultDate || '');
  const [slots, setSlots] = useState([]);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  

  const minDate = useMemo(() => {
    return DateTime.now().setZone(ZONE).toISODate();
  }, []);

  // Sincronizar fecha cuando se abre el modal
  useEffect(() => {
    if (isOpen && defaultDate) {
      setDate(defaultDate);
    }
  }, [isOpen, defaultDate]);

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
    if (!date) return toast.error('Por favor, selecciona una fecha');
    if (!selectedSlot) return toast.error('Selecciona un horario');

    onReserve({
      laboratorioId: lab.id,
      laboratorioNombre: lab.nombre,
      fecha: date,
      horaInicio: selectedSlot.start,
      horaFin: selectedSlot.end,
    });
  };

  // ✅ ERROR CORREGIDO: Se eliminó la llave extra que estaba aquí

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full mx-4 animate-fade-in-up">
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
          {/* Info Lab */}
          <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 mb-4 text-sm text-slate-700">
            <div className="flex flex-wrap gap-x-4 gap-y-1">
              {lab?.capacidad != null && <span>👥 Capacidad: <b>{lab.capacidad}</b></span>}
              {lab?.ubicacion && <span>📍 {lab.ubicacion}</span>}
              {lab?.tipo && <span>🧪 {lab.tipo}</span>}
            </div>
          </div>

          {/* INPUT FECHA BLOQUEADO */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-slate-700 mb-1">Fecha</label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              min={minDate}
              disabled={true} 
              className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none bg-slate-100 text-slate-500 cursor-not-allowed"
              required
            />
            <p className="text-xs text-slate-400 mt-1 italic">
              * Para cambiar la fecha, cierra esta ventana y selecciónala en el catálogo.
            </p>
          </div>

          {/* HORARIOS */}
          <div className="mb-4">
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-medium text-slate-700">Horario</label>
              {loading && <span className="text-xs text-slate-500">Cargando...</span>}
            </div>

            {error && <p className="text-sm text-red-600 mb-2">{error}</p>}

            {!date ? (
              <p className="text-sm text-slate-500">Fecha no válida.</p>
            ) : (
              <div className="grid grid-cols-2 gap-2 max-h-60 overflow-y-auto pr-1">
                {slots.map((s) => {
                  const active = selectedSlot?.label === s.label;
                  
                  // 🔥 AJUSTE LÓGICO: 
                  // Permitir clic si está disponible O si está ocupado por estudiante (para prioridad profe)
                  const isClickable = s.disponible || s.ocupadoPorEstudiante;

                  return (
                    <button
                      key={s.label}
                      type="button"
                      disabled={!isClickable} // Usamos la nueva variable
                      onClick={() => isClickable && setSelectedSlot(s)}
                      className={`text-left px-3 py-2 rounded-md border text-sm transition relative
                        ${isClickable 
                          ? 'border-slate-300 hover:border-blue-400 hover:bg-blue-50' 
                          : 'border-slate-100 bg-slate-50 text-slate-300 cursor-not-allowed'}
                        ${active ? 'border-blue-600 ring-1 ring-blue-500 bg-blue-50 z-10' : ''}
                      `}
                    >
                      <div className="flex items-center justify-between">
                        <span className={`font-medium ${!isClickable ? 'text-slate-400' : 'text-slate-700'}`}>
                          {s.label}
                        </span>
                        {/* Badge */}
                        {!s.disponible ? (
                           s.ocupadoPorEstudiante ? (
                            <span className="text-[10px] font-bold bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded">
                              Prioridad
                            </span>
                          ) : (
                            <span className="text-[10px] font-bold bg-red-100 text-red-600 px-1.5 py-0.5 rounded">
                              Ocupado
                            </span>
                          )
                        ) : (
                          active && <span className="text-blue-600">✓</span>
                        )}
                      </div>
                      <div className={`text-xs mt-1 ${!isClickable ? 'text-slate-300' : 'text-slate-500'}`}>
                        Duración: {s.end - s.start}h
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
            
            {!loading && slots.length === 0 && !error && (
              <p className="text-sm text-slate-500 text-center py-4 bg-slate-50 rounded-lg border border-dashed border-slate-200">
                No hay horarios disponibles para esta fecha.
              </p>
            )}
          </div>

          <div className="flex justify-end space-x-2 pt-2 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-slate-600 border border-slate-300 rounded-md hover:bg-slate-50 text-sm font-medium transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={!selectedSlot}
              className={`px-4 py-2 text-white rounded-md text-sm font-medium transition-colors shadow-sm
                ${selectedSlot 
                  ? 'bg-blue-600 hover:bg-blue-700 shadow-blue-200' 
                  : 'bg-slate-300 cursor-not-allowed'}
              `}
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