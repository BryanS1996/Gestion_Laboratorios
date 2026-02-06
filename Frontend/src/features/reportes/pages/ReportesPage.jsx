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
import { captureImageMetadata } from "../../../shared/utils/imageMetadata";
import { Card, Spinner } from "../../../shared/components";

export default function ReportesPage() {
  const { jwtToken } = useAuth();

  const { data: reservas = [], isLoading: loadingReservas } = useMisReservasQuery(jwtToken);
  const { data: reportes = [], isLoading: loadingReportes } = useMisReportesQuery(jwtToken);
  const { signedUrls, loadingImg, createReporte, deleteReporte, toggleImage, submitting } = useReportesActions(jwtToken);

  const [imagen, setImagen] = useState(null);
  const [imagenMetadata, setImagenMetadata] = useState(null);
  const [form, setForm] = useState({ titulo: "", descripcion: "", reservaSeleccionada: "" });
  const [tituloError, setTituloError] = useState("");

  const handleTituloChange = (e) => {
    const value = e.target.value;
    // Regex: solo letras (a-z, A-Z), espacios y caracteres acentuados (á, é, í, ó, ú, ñ)
    const regex = /^[a-zA-ZáéíóúñÁÉÍÓÚÑ\s]*$/;

    if (regex.test(value)) {
      setForm({ ...form, titulo: value });
      setTituloError("");
    } else {
      setTituloError("El título solo puede contener letras y espacios");
    }
  };

  const handleImageChange = async (e) => {
    const file = e.target.files?.[0] || null;
    setImagen(file);
    if (file) {
      try {
        const metadata = await captureImageMetadata(file);
        setImagenMetadata(metadata);
      } catch (error) {
        console.error('Error capturing image metadata:', error);
      }
    } else {
      setImagenMetadata(null);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.titulo || !form.descripcion || !form.reservaSeleccionada) {
      toast.error("⚠️ Completa todos los campos.");
      return;
    }

    if (tituloError) {
      toast.error("⚠️ Corrige los errores antes de enviar.");
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

    if (imagen) {
      fd.append("imagen", imagen);
      if (imagenMetadata) {
        fd.append("imagenMetadata", JSON.stringify(imagenMetadata));
      }
    }

    await createReporte(fd);
    setForm({ titulo: "", descripcion: "", reservaSeleccionada: "" });
    setImagen(null);
    setImagenMetadata(null);
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
          onTituloChange={handleTituloChange}
          tituloError={tituloError}
          onImageChange={handleImageChange}
          submitting={submitting}
          onSubmit={handleSubmit}
          selectedImage={imagen}
        />

        <div className="space-y-4">
          {(loadingReservas || loadingReportes) && (
            <Card className="p-6 text-slate-200 inline-flex items-center gap-2">
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
