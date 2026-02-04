import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { DateTime } from 'luxon';
import { ZONE } from '../../../../config/env';
import { fmtHoraBloque, fmtFechaHora } from './formatters';
import { fmtDateISOToLabel } from './formatters';

/**
 * Generate and download PDF report of reservations
 * @param {{
 *  exportMode: 'day'|'week'|'month',
 *  baseFechaISO: string,
 *  rangeLabel: string,
 *  baseLabs: Array<any>,
 *  estadosPorDia: Array<{ dateISO: string, laboratorios: Array<any> }>
 * }} params
 */
export const exportReservasPDF = ({ exportMode, baseFechaISO, rangeLabel, baseLabs, estadosPorDia }) => {
  const baseMap = new Map(
    (baseLabs || []).map((lab) => {
      const id = lab.id || lab._id || lab.laboratorioId;
      const nombre = lab.nombre || lab.laboratorioNombre || 'Sin nombre';
      return [String(id), nombre];
    })
  );

  const rows = [];
  for (const dayPack of estadosPorDia) {
    const dateLabel = fmtDateISOToLabel(dayPack.dateISO);
    for (const l of (dayPack.laboratorios || [])) {
      const labId = String(l.laboratorioId);
      const labName = baseMap.get(labId) || labId;
      const horarios = Array.isArray(l.horarios) ? l.horarios : [];
      for (const r of horarios) {
        rows.push([
          dateLabel,
          labName,
          r.userEmail || '—',
          fmtHoraBloque(r.horaInicio, r.horaFin),
          String(r.estado || '—'),
          r.createdAt ? fmtFechaHora(r.createdAt) : '—',
        ]);
      }
    }
  }

  rows.sort((a, b) => {
    const da = DateTime.fromFormat(a[0], 'dd/LL/yyyy', { zone: ZONE });
    const db = DateTime.fromFormat(b[0], 'dd/LL/yyyy', { zone: ZONE });
    if (da.toMillis() !== db.toMillis()) return da.toMillis() - db.toMillis();
    return String(a[3]).localeCompare(String(b[3]));
  });

  const doc = new jsPDF({ orientation: 'landscape' });
  const pageWidth = doc.internal.pageSize.getWidth();

  doc.setFontSize(16);
  doc.text('Universidad Central del Ecuador', pageWidth / 2, 16, { align: 'center' });
  doc.setFontSize(12);
  doc.text('Listado de Reservas (Admin)', pageWidth / 2, 24, { align: 'center' });

  doc.setFontSize(10);
  doc.text(`Rango: ${rangeLabel}`, 14, 34);
  doc.text(`Generado: ${DateTime.now().setZone(ZONE).toFormat('dd/LL/yyyy HH:mm')}`, 14, 40);

  autoTable(doc, {
    startY: 48,
    head: [['Fecha', 'Laboratorio', 'Usuario', 'Hora', 'Estado', 'Creada']],
    body: rows.length ? rows : [['—', '—', '—', '—', '—', '—']],
    styles: { fontSize: 8 },
    headStyles: { fillColor: [37, 99, 235], textColor: 255 },
    columnStyles: {
      0: { cellWidth: 28 },
      1: { cellWidth: 60 },
      2: { cellWidth: 65 },
      3: { cellWidth: 28 },
      4: { cellWidth: 30 },
      5: { cellWidth: 35 },
    },
  });

  const filename =
    exportMode === 'day'
      ? `reservas_${baseFechaISO}.pdf`
      : exportMode === 'week'
      ? `reservas_semana_${baseFechaISO}.pdf`
      : `reservas_mes_${baseFechaISO}.pdf`;

  doc.save(filename);
};
