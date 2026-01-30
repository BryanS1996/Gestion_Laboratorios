import { useMemo, useState } from "react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

import { useAdminReportes } from "../../hooks/useAdminReportes";
import ReporteDetalleModal from "../../components/admin/ReporteDetalleModal";
import logoUCE from "../../assets/logo_uce2.png";

/* =========================
   Util: load local image as base64
========================= */
const loadImageAsBase64 = (src) =>
  new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = img.width;
      canvas.height = img.height;
      canvas.getContext("2d").drawImage(img, 0, 0);
      resolve(canvas.toDataURL("image/png"));
    };
    img.onerror = reject;
    img.src = src;
  });

const safeLower = (v) => String(v || "").toLowerCase();

const ReportesAdmin = () => {
  const { reportes, stats, loading, refreshing, error, cambiarEstado, refetch } =
    useAdminReportes();

  // UI state
  const [filtroEstado, setFiltroEstado] = useState("todos");
  const [filtroTexto, setFiltroTexto] = useState("");
  const [reporteSeleccionado, setReporteSeleccionado] = useState(null);

  /* =========================
     Filters (memoized)
  ========================== */
  const reportesFiltrados = useMemo(() => {
    const texto = safeLower(filtroTexto);

    return (reportes || []).filter((r) => {
      const cumpleEstado = filtroEstado === "todos" || r.estado === filtroEstado;

      const cumpleTexto =
        safeLower(r.titulo).includes(texto) || safeLower(r.userEmail).includes(texto);

      return cumpleEstado && cumpleTexto;
    });
  }, [reportes, filtroEstado, filtroTexto]);

  /* =========================
     PDF Export
  ========================== */
  const exportarPDF = async () => {
    const doc = new jsPDF({ orientation: "landscape" });
    const pageWidth = doc.internal.pageSize.getWidth();
    const fechaHoy = new Date().toLocaleDateString("es-EC");

    try {
      const logoBase64 = await loadImageAsBase64(logoUCE);
      doc.addImage(logoBase64, "PNG", 14, 10, 30, 30);
    } catch {
      console.warn("Logo not loaded");
    }

    doc.setFontSize(16);
    doc.text("Universidad Central del Ecuador", pageWidth / 2, 18, { align: "center" });
    doc.setFontSize(13);
    doc.text("Sistema de Gestión de Laboratorios", pageWidth / 2, 26, { align: "center" });

    doc.setFontSize(11);
    doc.text("Reporte semanal de incidencias", 14, 50);
    doc.text(`Fecha: ${fechaHoy}`, 14, 58);

    autoTable(doc, {
      startY: 65,
      head: [["Fecha", "Laboratorio", "Usuario", "Título", "Estado"]],
      body: reportesFiltrados.map((r) => [
        r.fechaCreacion ? new Date(r.fechaCreacion).toLocaleDateString("es-EC") : "—",
        r.laboratorioNombre || "—",
        r.userEmail || "—",
        r.titulo || "—",
        r.estado || "—",
      ]),
      styles: { fontSize: 9 },
      headStyles: { fillColor: [37, 99, 235], textColor: 255 },
      columnStyles: {
        0: { cellWidth: 30 },
        1: { cellWidth: 60 },
        2: { cellWidth: 70 },
        3: { cellWidth: 90 },
        4: { cellWidth: 30 },
      },
    });

    doc.save("reporte_semanal_laboratorios.pdf");
  };

  /* =========================
     Render
  ========================== */
  if (loading) return <p>Cargando reportes...</p>;
  if (error) return <p className="text-red-500">{error}</p>;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Reportes de Incidencias</h1>
          <p className="text-gray-500">Gestión administrativa de reportes</p>

          {/* Subtle realtime indicator */}
          <div className="mt-2 flex items-center gap-2 text-xs text-gray-500">
            <span
              className={`inline-block h-2 w-2 rounded-full ${
                refreshing ? "bg-blue-500" : "bg-green-500"
              }`}
            />
            {refreshing ? "Actualizando..." : "En vivo (polling 1s)"}
          </div>
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => refetch?.()}
            className="border px-3 py-2 rounded text-sm hover:bg-gray-50"
          >
            Refrescar
          </button>

          <button
            onClick={exportarPDF}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            Exportar PDF semanal
          </button>
        </div>
      </div>

      {/* Optional stats */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div className="bg-white border rounded-lg p-3">
            <div className="text-xs text-gray-500">Total</div>
            <div className="text-lg font-bold">{stats.total ?? 0}</div>
          </div>
          <div className="bg-white border rounded-lg p-3">
            <div className="text-xs text-gray-500">Pendientes</div>
            <div className="text-lg font-bold">{stats.pendientes ?? 0}</div>
          </div>
          <div className="bg-white border rounded-lg p-3">
            <div className="text-xs text-gray-500">Revisados</div>
            <div className="text-lg font-bold">{stats.revisados ?? 0}</div>
          </div>
          <div className="bg-white border rounded-lg p-3">
            <div className="text-xs text-gray-500">Resueltos</div>
            <div className="text-lg font-bold">{stats.resueltos ?? 0}</div>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-wrap gap-4 items-center">
        <select
          value={filtroEstado}
          onChange={(e) => setFiltroEstado(e.target.value)}
          className="border rounded px-3 py-2 text-sm"
        >
          <option value="todos">Todos</option>
          <option value="pendiente">Pendiente</option>
          <option value="revisado">Revisado</option>
          <option value="resuelto">Resuelto</option>
        </select>

        <input
          type="text"
          placeholder="Buscar por título o usuario"
          value={filtroTexto}
          onChange={(e) => setFiltroTexto(e.target.value)}
          className="border rounded px-3 py-2 text-sm w-64"
        />
      </div>

      {/* Table */}
      <div className="bg-white border rounded-lg overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="p-3 text-left">Fecha</th>
              <th className="p-3 text-left">Laboratorio</th>
              <th className="p-3 text-left">Usuario</th>
              <th className="p-3 text-left">Título</th>
              <th className="p-3 text-left">Estado</th>
            </tr>
          </thead>

          <tbody>
            {reportesFiltrados.map((r) => (
              <tr
                key={r._id}
                className="border-t hover:bg-gray-50 cursor-pointer"
                onClick={() => setReporteSeleccionado(r)}
              >
                <td className="p-3">
                  {r.fechaCreacion ? new Date(r.fechaCreacion).toLocaleDateString("es-EC") : "—"}
                </td>
                <td className="p-3">{r.laboratorioNombre || "—"}</td>
                <td className="p-3">{r.userEmail || "—"}</td>
                <td className="p-3">{r.titulo || "—"}</td>
                <td className="p-3">
                  <select
                    value={r.estado}
                    onClick={(e) => e.stopPropagation()}
                    onChange={(e) => cambiarEstado(r._id, e.target.value)}
                    className="border rounded px-2 py-1 text-xs"
                  >
                    <option value="pendiente">Pendiente</option>
                    <option value="revisado">Revisado</option>
                    <option value="resuelto">Resuelto</option>
                  </select>
                </td>
              </tr>
            ))}

            {reportesFiltrados.length === 0 && (
              <tr>
                <td colSpan={5} className="p-8 text-center text-gray-500 italic">
                  No hay reportes con esos filtros.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      {reporteSeleccionado && (
        <ReporteDetalleModal
          reporte={reporteSeleccionado}
          onClose={() => setReporteSeleccionado(null)}
        />
      )}
    </div>
  );
};

export default ReportesAdmin;
