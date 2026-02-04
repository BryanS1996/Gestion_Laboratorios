import { useState } from "react";
import toast from "react-hot-toast";
import { useAuth } from "../../../hooks/useAuth";
import ReportesShell from "../components/ReportesShell";
import ReportFormCard from "../components/ReportFormCard";
import ReportesList from "../components/ReportesList";
import { useMisReservasQuery } from "../hooks/useMisReservasQuery";
import { useMisReportesQuery } from "../hooks/useMisReportesQuery";
import { useReportesActions } from "../hooks/useReportesActions";
import { toISODate, timeRange } from "../../../shared/utils/dates";
import { Card, Spinner } from "../../../shared/components";

export default function ReportesPage() {
  const { jwtToken } = useAuth();

  const { data: reservas = [], isLoading: loadingReservas } = useMisReservasQuery(jwtToken);
  const { data: reportes = [], isLoading: loadingReportes } = useMisReportesQuery(jwtToken);
  const { signedUrls, loadingImg, createReporte, deleteReporte, toggleImage, submitting } = useReportesActions(jwtToken);

  const [imagen, setImagen] = useState(null);
  const [form, setForm] = useState({ titulo: "", descripcion: "", reservaSeleccionada: "" });

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.titulo || !form.descripcion || !form.reservaSeleccionada) {
      toast.error("⚠️ Completa todos los campos.");
      return;
    }

    const reserva = reservas.find((r) => r.id === form.reservaSeleccionada);
    if (!reserva) {
      toast.error("Selecciona una reserva válida.");
      return;
    }

    const fd = new FormData();
    fd.append("titulo", form.titulo);
    fd.append("descripcion", form.descripcion);
    fd.append("reservaId", reserva.id);

    const iso = toISODate(reserva.fecha);
    if (iso) fd.append("fecha", iso);

    fd.append("horario", timeRange(reserva.horaInicio, reserva.horaFin));
    fd.append("tipoAcceso", reserva.tipo || "basico");
    fd.append("laboratorioId", reserva.laboratorioId);
    fd.append("laboratorioNombre", reserva.laboratorioNombre);

    if (imagen) fd.append("imagen", imagen);

    await createReporte(fd);
    setForm({ titulo: "", descripcion: "", reservaSeleccionada: "" });
    setImagen(null);
  };

  const onDelete = async (reporteId) => {
    if (!confirm("🗑️ ¿Estás seguro de eliminar este reporte?")) return;
    await deleteReporte(reporteId);
  };

  return (
    <ReportesShell>
      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8">
        <ReportFormCard
          reservas={reservas}
          form={form}
          onChange={setForm}
          onImageChange={(e) => setImagen(e.target.files?.[0] || null)}
          submitting={submitting}
          onSubmit={handleSubmit}
          selectedImage={imagen}
        />

        <div className="space-y-4">
          {(loadingReservas || loadingReportes) && (
            <Card className="p-6 text-slate-600 inline-flex items-center gap-2">
              <Spinner />
              <span>Cargando...</span>
            </Card>
          )}

          <ReportesList
            reportes={reportes}
            signedUrls={signedUrls}
            loadingImg={loadingImg}
            onToggleImage={toggleImage}
            onDelete={onDelete}
          />
        </div>
      </div>
    </ReportesShell>
  );
}
