import { useState } from 'react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

import { mockReportes } from '../../mocks/reportesMock';
import ReporteDetalleModal from '../../components/admin/ReporteDetalleModal';
import logoUCE from '../../assets/logo_uce2.png';

/* =========================
   Util: cargar imagen local
   ========================= */
const loadImageAsBase64 = (src) =>
  new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      canvas.getContext('2d').drawImage(img, 0, 0);
      resolve(canvas.toDataURL('image/png'));
    };
    img.onerror = reject;
    img.src = src;
  });

const ReportesAdmin = () => {
  /* =========================
     STATE
     ========================= */
  const [reportes, setReportes] = useState(mockReportes);
  const [filtroEstado, setFiltroEstado] = useState('todos');
  const [filtroTexto, setFiltroTexto] = useState('');
  const [reporteSeleccionado, setReporteSeleccionado] = useState(null);

  /* =========================
     LOGICA
     ========================= */
  const cambiarEstado = (id, nuevoEstado) => {
    setReportes((prev) =>
      prev.map((r) =>
        r.id === id ? { ...r, estado: nuevoEstado } : r
      )
    );
  };

  const reportesFiltrados = reportes.filter((r) => {
    const cumpleEstado =
      filtroEstado === 'todos' || r.estado === filtroEstado;

    const texto = filtroTexto.toLowerCase();
    const cumpleTexto =
      r.titulo.toLowerCase().includes(texto) ||
      r.userEmail.toLowerCase().includes(texto);

    return cumpleEstado && cumpleTexto;
  });

  /* =========================
     PDF
     ========================= */
  const exportarPDF = async () => {
    const doc = new jsPDF({ orientation: 'landscape' });
    const pageWidth = doc.internal.pageSize.getWidth();
    const fechaHoy = new Date().toLocaleDateString('es-EC');

    try {
      const logoBase64 = await loadImageAsBase64(logoUCE);
      doc.addImage(logoBase64, 'PNG', 14, 10, 30, 30);
    } catch (e) {
      console.warn('Logo no cargado');
    }

    doc.setFontSize(16);
    doc.text('Universidad Central del Ecuador', pageWidth / 2, 18, { align: 'center' });
    doc.setFontSize(13);
    doc.text('Sistema de Gestión de Laboratorios', pageWidth / 2, 26, { align: 'center' });

    doc.setFontSize(11);
    doc.text('Reporte semanal de incidencias', 14, 50);
    doc.text(`Fecha: ${fechaHoy}`, 14, 58);

    autoTable(doc, {
      startY: 65,
      head: [['Fecha', 'Laboratorio', 'Usuario', 'Título', 'Estado']],
      body: reportesFiltrados.map((r) => [
        new Date(r.fechaCreacion).toLocaleDateString('es-EC'),
        r.laboratorioNombre,
        r.userEmail,
        r.titulo,
        r.estado,
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

    doc.save('reporte_semanal_laboratorios.pdf');
  };

  /* =========================
     RENDER
     ========================= */
  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div>
        <h1 className="text-2xl font-bold">Reportes de Incidencias</h1>
        <p className="text-gray-500">
          Gestión administrativa de reportes
        </p>
      </div>

      {/* FILTROS */}
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

        <button
          onClick={exportarPDF}
          className="ml-auto bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          Exportar PDF semanal
        </button>
      </div>

      {/* TABLA */}
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
                key={r.id}
                className="border-t hover:bg-gray-50 cursor-pointer"
                onClick={() => setReporteSeleccionado(r)}
              >
                <td className="p-3">
                  {new Date(r.fechaCreacion).toLocaleDateString('es-EC')}
                </td>
                <td className="p-3">{r.laboratorioNombre}</td>
                <td className="p-3">{r.userEmail}</td>
                <td className="p-3">{r.titulo}</td>
                <td className="p-3">
                  <select
                    value={r.estado}
                    onChange={(e) =>
                      cambiarEstado(r.id, e.target.value)
                    }
                    onClick={(e) => e.stopPropagation()}
                    className="border rounded px-2 py-1 text-xs"
                  >
                    <option value="pendiente">Pendiente</option>
                    <option value="revisado">Revisado</option>
                    <option value="resuelto">Resuelto</option>
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* MODAL */}
      <ReporteDetalleModal
        reporte={reporteSeleccionado}
        onClose={() => setReporteSeleccionado(null)}
      />
    </div>
  );
};

export default ReportesAdmin;
