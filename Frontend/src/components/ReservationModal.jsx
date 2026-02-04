import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import { DateTime } from "luxon";
import { reservasService } from "../services/reservas.service";
import { ZONE } from "../config/env";
import { Badge, Button, Card, Modal, Spinner } from "../shared/components";

const ReservationModal = ({ isOpen, onClose, lab, onReserve, jwtToken, defaultDate }) => {
  const [date, setDate] = useState(defaultDate || "");
  const [slots, setSlots] = useState([]);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const minDate = useMemo(() => DateTime.now().setZone(ZONE).toISODate(), []);

  useEffect(() => {
    if (isOpen && defaultDate) setDate(defaultDate);
  }, [isOpen, defaultDate]);

  useEffect(() => {
    const loadSlots = async () => {
      if (!isOpen || !lab?.id || !date || !jwtToken) return;
      try {
        setLoading(true);
        setError(null);
        setSelectedSlot(null);
        const data = await reservasService.availability(jwtToken, {
          laboratorioId: lab.id,
          fecha: date,
        });
        setSlots(data?.slots || []);
      } catch (e) {
        setError(e.message);
        setSlots([]);
      } finally {
        setLoading(false);
      }
    };
    loadSlots();
  }, [isOpen, lab?.id, date, jwtToken]);

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!lab?.id) return;
    if (!date) return toast.error("Por favor, selecciona una fecha");
    if (!selectedSlot) return toast.error("Selecciona un horario");

    onReserve({
      laboratorioId: lab.id,
      laboratorioNombre: lab.nombre,
      fecha: date,
      horaInicio: selectedSlot.start,
      horaFin: selectedSlot.end,
    });
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={lab?.nombre ? `Reservar: ${lab.nombre}` : "Reservar laboratorio"}
      maxWidthClassName="max-w-md"
      footer={
        <div className="flex justify-end gap-2">
          <Button variant="secondary" type="button" onClick={onClose}>
            Cancelar
          </Button>
          <Button
            variant="blue"
            type="submit"
            form="reservation-modal-form"
            disabled={!selectedSlot}
          >
            Reservar
          </Button>
        </div>
      }
    >
      <form id="reservation-modal-form" onSubmit={handleSubmit}>
        <Card className="bg-slate-50 border border-slate-200 rounded-lg p-3 mb-4 text-sm text-slate-700">
          <div className="flex flex-wrap gap-x-4 gap-y-1">
            {lab?.capacidad != null && (
              <span>
                👥 Capacidad: <b>{lab.capacidad}</b>
              </span>
            )}
            {lab?.ubicacion && <span>📍 {lab.ubicacion}</span>}
            {lab?.tipo && <span>🧪 {lab.tipo}</span>}
          </div>
        </Card>

        <div className="mb-4">
          <label className="label block mb-1">Fecha</label>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            min={minDate}
            disabled={true}
            className="input bg-slate-100 text-slate-500 cursor-not-allowed"
            required
          />
          <p className="text-xs text-slate-400 mt-1 italic">
            * Para cambiar la fecha, cierra esta ventana y selecciónala en el catálogo.
          </p>
        </div>

        <div className="mb-4">
          <div className="flex items-center justify-between mb-2">
            <label className="label block mb-0">Horario</label>
            {loading && (
              <span className="text-xs text-slate-600 inline-flex items-center gap-2">
                <Spinner />
                Cargando...
              </span>
            )}
          </div>

          {error && <p className="text-sm text-red-600 mb-2">{error}</p>}

          {!date ? (
            <p className="text-sm text-slate-500">Fecha no válida.</p>
          ) : (
            <div className="grid grid-cols-2 gap-2 max-h-60 overflow-y-auto pr-1">
              {slots.map((s) => {
                const active = selectedSlot?.label === s.label;
                const isClickable = s.disponible || s.ocupadoPorEstudiante;

                return (
                  <button
                    key={s.label}
                    type="button"
                    disabled={!isClickable}
                    onClick={() => isClickable && setSelectedSlot(s)}
                    className={`text-left px-3 py-2 rounded-md border text-sm transition relative
                      ${
                        isClickable
                          ? "border-slate-300 hover:border-blue-400 hover:bg-blue-50"
                          : "border-slate-100 bg-slate-50 text-slate-300 cursor-not-allowed"
                      }
                      ${
                        active
                          ? "border-blue-600 ring-1 ring-blue-500 bg-blue-50 z-10"
                          : ""
                      }
                    `}
                  >
                    <div className="flex items-center justify-between">
                      <span className={`font-medium ${!isClickable ? "text-slate-400" : "text-slate-700"}`}>
                        {s.label}
                      </span>

                      {!s.disponible ? (
                        s.ocupadoPorEstudiante ? (
                          <Badge variant="yellow" className="text-[10px] font-bold px-1.5 py-0.5">
                            Prioridad
                          </Badge>
                        ) : (
                          <Badge variant="red" className="text-[10px] font-bold px-1.5 py-0.5">
                            Ocupado
                          </Badge>
                        )
                      ) : (
                        active && <span className="text-blue-600">✓</span>
                      )}
                    </div>

                    <div className={`text-xs mt-1 ${!isClickable ? "text-slate-300" : "text-slate-500"}`}>
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
      </form>
    </Modal>
  );
};

export default ReservationModal;
