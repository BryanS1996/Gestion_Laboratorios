import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { mockReportes } from '../../mocks/reportesMock';
import logoUCE from '../../assets/logo_uce2.png';

const loadImageAsBase64 = (src) => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0);
      resolve(canvas.toDataURL('image/png'));
    };
    img.onerror = reject;
    img.src = src;
  });
};

const ReportesAdmin = () => {
  const reportes = mockReportes;

  // ✅ DEBE SER async
  // ✅ DEBE SER async
  const exportarPDF = async () => {
    const doc = new jsPDF({
      orientation: 'landscape',
      unit: 'mm',
      format: 'a4',
    });

    // 👇 AQUÍ ESTABA EL ERROR: Faltaba definir esta variable
    const pageWidth = doc.internal.pageSize.getWidth();

    // 📅 Fecha
    const fechaHoy = new Date().toLocaleDateString('es-EC');

    // 🖼️ Logo
    try {
      const logoBase64 = await loadImageAsBase64(logoUCE);
      doc.addImage(logoBase64, 'PNG', 14, 10, 30, 30);
    } catch (error) {
      console.error("No se pudo cargar el logo", error);
    }

    // 🏫 TÍTULOS CENTRADOS
    doc.setFontSize(16);
    // Ahora sí funciona porque 'pageWidth' ya existe
    doc.text('Universidad Central del Ecuador', pageWidth / 2, 18, { align: 'center' }); 
    
    doc.setFontSize(13);
    doc.text('Sistema de Gestión de Laboratorios', pageWidth / 2, 26, { align: 'center' });

    doc.setFontSize(11);
    doc.text('Reporte semanal de incidencias', 14, 50);
    doc.text(`Fecha de generación: ${fechaHoy}`, 14, 58);

    // 📊 TABLA
    autoTable(doc, {
      startY: 65,
      head: [['Fecha', 'Laboratorio', 'Usuario', 'Tipo', 'Estado']],
      body: reportes.map(r => [
        new Date(r.fechaCreacion).toLocaleDateString('es-EC'),
        r.laboratorioNombre,
        r.userEmail,
        r.titulo,
        r.estado,
      ]),
      styles: {
        fontSize: 9,
        cellPadding: 3,
      },
      headStyles: {
        fillColor: [37, 99, 235],
        textColor: 255,
      },
      alternateRowStyles: {
        fillColor: [245, 247, 250],
      },
      // Nota: Verifica que la suma de estos anchos no supere el ancho A4 Landscape (aprox 297mm)
      // Tus anchos suman 275mm + margenes, queda muy justo, pero debería entrar.
      columnStyles: {
        0: { cellWidth: 30 },
        1: { cellWidth: 55 },
        2: { cellWidth: 70 },
        3: { cellWidth: 90 },
        4: { cellWidth: 30 },
      },
      // Esto ayuda a centrar la tabla en la página automáticamente
      margin: { top: 65, left: 14, right: 14 } 
    });

    // ✍️ PIE
    // Verificamos que lastAutoTable exista para evitar errores si la tabla falla
    const finalY = (doc.lastAutoTable?.finalY || 65) + 20; 
    
    doc.text('_____________________________', 14, finalY);
    doc.text('Firma Responsable', 14, finalY + 6);

    doc.save('reporte_semanal_laboratorios.pdf');
  };


  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Reportes de Incidencias</h1>
        <p className="text-gray-500">
          Listado general de reportes generados por los usuarios
        </p>
      </div>

      <div className="flex justify-end">
        <button
          onClick={exportarPDF}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
        >
          Exportar PDF semanal
        </button>
      </div>

      <div className="bg-white rounded-lg border overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="p-3 text-left">Fecha</th>
              <th className="p-3 text-left">Laboratorio</th>
              <th className="p-3 text-left">Usuario</th>
              <th className="p-3 text-left">Tipo</th>
              <th className="p-3 text-left">Estado</th>
            </tr>
          </thead>
            <tbody>
              {reportes.map((r) => (
                <tr key={r.id} className="border-t">
                  <td className="p-3">
                    {new Date(r.fechaCreacion).toLocaleDateString('es-EC')}
                  </td>

                  <td className="p-3">
                    {r.laboratorioNombre}
                  </td>

                  <td className="p-3">
                    {r.userEmail}
                  </td>

                  <td className="p-3">
                    {r.titulo}
                  </td>

                  <td className="p-3">
                    <span
                      className={`px-2 py-1 rounded text-xs font-medium ${
                        r.estado === 'pendiente'
                          ? 'bg-yellow-100 text-yellow-800'
                          : r.estado === 'revisado'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-green-100 text-green-800'
                      }`}
                    >
                      {r.estado}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
        </table>
      </div>
    </div>
  );
};

export default ReportesAdmin;
