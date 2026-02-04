import { useState } from "react";
import toast from "react-hot-toast";
import { reportesService } from "../../../services/reportes.service";
import { Button, Input, Modal, Textarea } from "../../../shared/components";

export default function ReportModal({
  isOpen,
  onClose,
  jwtToken,
  reserva,
  onReportSent,
}) {
  const [form, setForm] = useState({ titulo: "", descripcion: "" });
  const [image, setImage] = useState(null);
  const [sending, setSending] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    if (!reserva?.id) return;

    setSending(true);
    try {
      const fd = new FormData();
      fd.append("titulo", form.titulo);
      fd.append("descripcion", form.descripcion);
      fd.append("reservaId", reserva.id);
      if (image) fd.append("imagen", image);

      await reportesService.create(jwtToken, fd);
      toast.success("Reporte enviado");
      setForm({ titulo: "", descripcion: "" });
      setImage(null);
      onClose();
      onReportSent?.();
    } catch (err) {
      toast.error(err.message || "Error enviando reporte");
    } finally {
      setSending(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Reportar Incidencia"
      maxWidthClassName="max-w-md"
      footer={
        <div className="flex justify-end gap-2">
          <Button variant="secondary" onClick={onClose} disabled={sending}>
            Cancelar
          </Button>
          <Button variant="danger" type="submit" form="report-modal-form" disabled={sending}>
            {sending ? "Enviando..." : "Enviar"}
          </Button>
        </div>
      }
    >
      <form id="report-modal-form" onSubmit={submit} className="space-y-4">
        <Input
          label="Título"
          value={form.titulo}
          onChange={(e) => setForm((p) => ({ ...p, titulo: e.target.value }))}
          required
        />

        <Textarea
          label="Descripción"
          rows={5}
          value={form.descripcion}
          onChange={(e) => setForm((p) => ({ ...p, descripcion: e.target.value }))}
          required
          textareaClassName="h-32 resize-none"
        />

        <div>
          <label className="label block mb-1">Evidencia (Imagen)</label>
          <input
            type="file"
            className="block w-full text-sm text-slate-500"
            onChange={(e) => setImage(e.target.files?.[0] || null)}
            accept="image/*"
          />
        </div>
      </form>
    </Modal>
  );
}
