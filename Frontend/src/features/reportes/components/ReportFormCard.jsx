import { AlertTriangle } from "lucide-react";
import { Button, Card, Input, Select, Textarea } from "../../../shared/components";
import { formatISOToLocale, toISODate, timeRange } from "../../../shared/utils/dates";

export default function ReportFormCard({
  reservas,
  form,
  onChange,
  onImageChange,
  submitting,
  onSubmit,
  selectedImage,
}) {
  return (
    <Card className="p-8 h-fit sticky top-6">
      <div className="flex items-center gap-3 mb-6 text-red-600 border-b border-slate-100 pb-4">
        <div className="bg-red-100 p-2 rounded-lg">
          <AlertTriangle size={24} />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Reportar Incidente</h2>
          <p className="text-sm text-slate-500">Selecciona una reserva y describe el problema</p>
        </div>
      </div>

      <form onSubmit={onSubmit} className="space-y-5">
        <Input
          placeholder="Título"
          value={form.titulo}
          onChange={(e) => onChange({ ...form, titulo: e.target.value })}
          required
        />

        <Select
          value={form.reservaSeleccionada}
          onChange={(e) => onChange({ ...form, reservaSeleccionada: e.target.value })}
          required
        >
          <option value="">Selecciona una reserva</option>
          {reservas.map((res) => {
            const iso = toISODate(res.fecha);
            const labelDate = iso ? formatISOToLocale(iso) : "Sin fecha";
            return (
              <option key={res.id} value={res.id}>
                {res.laboratorioNombre} - {labelDate} ({timeRange(res.horaInicio, res.horaFin)})
              </option>
            );
          })}
        </Select>

        <Textarea
          rows={4}
          placeholder="Descripción"
          value={form.descripcion}
          onChange={(e) => onChange({ ...form, descripcion: e.target.value })}
          required
        />

        <div>
          <label className="label block mb-1">Imagen (opcional)</label>
          <input type="file" accept="image/*" onChange={onImageChange} />
          {selectedImage && (
            <p className="mt-2 text-xs text-slate-500">
              Seleccionada: <strong>{selectedImage.name}</strong>
            </p>
          )}
        </div>

        <Button
          type="submit"
          disabled={submitting}
          variant="danger"
          className="w-full justify-center py-3"
        >
          {submitting ? "Enviando..." : "Enviar Reporte"}
        </Button>
      </form>
    </Card>
  );
}
