import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import logoUCE from '../../../../assets/logo_uce2.png';

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

export const exportReportesPDF = async ({ reportes }) => {
  const doc = new jsPDF({ orientation: 'landscape' });
  const pageWidth = doc.internal.pageSize.getWidth();
  const fechaHoy = new Date().toLocaleDateString('es-EC');

  try {
    const logoBase64 = await loadImageAsBase64(logoUCE);
    doc.addImage(logoBase64, 'PNG', 14, 10, 30, 30);
  } catch {
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
    body: (reportes || []).map((r) => [
      r.fechaCreacion ? new Date(r.fechaCreacion).toLocaleDateString('es-EC') : '—',
      r.laboratorioNombre || '—',
      r.userEmail || '—',
      r.titulo || '—',
      r.estado || '—',
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
