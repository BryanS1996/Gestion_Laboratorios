import { useMemo, useState } from 'react';
import { DateTime } from 'luxon';
import { ZONE } from '../../../../config/env';
import { useDashboardStatsQuery } from './useDashboardStatsQuery';
import { COLORS, getReservationColors } from '../../../../config/theme.config';

const DEFAULT_SLOTS = [
  { label: '07:00-09:00', start: 7, end: 9 },
  { label: '09:00-11:00', start: 9, end: 11 },
  { label: '11:00-13:00', start: 11, end: 13 },
  { label: '14:00-16:00', start: 14, end: 16 },
  { label: '16:00-18:00', start: 16, end: 18 },
];

const PERIOD_LABEL = {
  day: 'Día',
  week: 'Semana',
  month: 'Mes',
};

function countBy(list, keyFn) {
  const map = {};
  list.forEach((item) => {
    const k = keyFn(item);
    map[k] = (map[k] || 0) + 1;
  });
  return map;
}

function normalizeEstado(estado) {
  const e = (estado || '').toLowerCase();
  if (e === 'confirmada') return 'Confirmada';
  if (e === 'pendiente') return 'Pendiente';
  if (e === 'cancelada' || e === 'cancelada_por_prioridad') return 'Cancelada';
  return 'Otro';
}

export function useDashboardPage() {
  const [periodo, setPeriodo] = useState('day');
  const [fecha, setFecha] = useState(DateTime.now().setZone(ZONE).toISODate());

  const query = useDashboardStatsQuery({ fecha, periodo });
  const reservas = query.data?.reservas ?? [];
  const stats = query.data?.stats ?? {};

  const periodoLabel = PERIOD_LABEL[periodo] || 'Día';

  const cards = useMemo(() => {
    const uniqueLabs = new Set(reservas.map((r) => r.laboratorioId).filter(Boolean)).size;
    const uniqueUsers = new Set(reservas.map((r) => r.userId || r.userEmail).filter(Boolean)).size;
    const updatedAt = stats?.updatedAt;

    return [
      { label: 'Reservas hoy', value: stats?.reservasHoy ?? 0 },
      { label: `Total (${periodoLabel})`, value: stats?.totalPeriodo ?? reservas.length },
      { label: 'Labs ocupados (ahora)', value: stats?.laboratoriosOcupados ?? 0 },
      { label: 'Labs usados', value: uniqueLabs },
      { label: 'Usuarios únicos', value: uniqueUsers },
      { label: 'Actualizado', value: updatedAt ? new Date(updatedAt).toLocaleString() : '—' },
    ];
  }, [reservas, stats, periodoLabel]);

  const barOptions = useMemo(
    () => ({ responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } } }),
    []
  );
  const doughnutOptions = useMemo(
    () => ({ responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'bottom' } } }),
    []
  );

  const chartReservasPorLab = useMemo(() => {
    const counts = countBy(reservas, (r) => r.laboratorioNombre || r.laboratorioId || 'Desconocido');
    const entries = Object.entries(counts).sort((a, b) => b[1] - a[1]);
    return {
      labels: entries.map(([k]) => k),
      datasets: [
        {
          label: `Reservas por laboratorio (${periodoLabel})`,
          data: entries.map(([, v]) => v),
          backgroundColor: COLORS.chart.primary,
          borderRadius: 8,
        },
      ],
    };
  }, [reservas, periodoLabel]);

  const chartTopUsuarios = useMemo(() => {
    const counts = countBy(reservas, (r) => r.userEmail || r.userId || 'Desconocido');
    const entries = Object.entries(counts).sort((a, b) => b[1] - a[1]).slice(0, 5);
    return {
      labels: entries.map(([k]) => k),
      datasets: [
        {
          label: 'Top 5 usuarios',
          data: entries.map(([, v]) => v),
          backgroundColor: COLORS.chart.success,
          borderRadius: 8,
        },
      ],
    };
  }, [reservas]);

  const chartSlots = useMemo(() => {
    const counts = {};
    DEFAULT_SLOTS.forEach((s) => (counts[s.label] = 0));

    reservas.forEach((r) => {
      const hi = parseInt(r.horaInicio, 10);
      const hf = parseInt(r.horaFin, 10);
      if (Number.isNaN(hi) || Number.isNaN(hf)) return;
      DEFAULT_SLOTS.forEach((s) => {
        const overlap = hi < s.end && hf > s.start;
        if (overlap) counts[s.label] += 1;
      });
    });

    return {
      labels: Object.keys(counts),
      datasets: [
        {
          label: 'Demanda por horario',
          data: Object.values(counts),
          backgroundColor: COLORS.chart.purple,
          borderRadius: 8,
        },
      ],
    };
  }, [reservas]);

  const doughnutEstado = useMemo(() => {
    const counts = countBy(reservas, (r) => normalizeEstado(r.estado));
    const pendiente = counts['Pendiente'] || 0;
    const confirmada = counts['Confirmada'] || 0;
    const cancelada = counts['Cancelada'] || 0;
    const otro = counts['Otro'] || 0;

    const labels = otro > 0 ? ['Pendiente', 'Confirmada', 'Cancelada', 'Otro'] : ['Pendiente', 'Confirmada', 'Cancelada'];
    const data = otro > 0 ? [pendiente, confirmada, cancelada, otro] : [pendiente, confirmada, cancelada];

    return {
      labels,
      datasets: [
        {
          data,
          backgroundColor: getReservationColors(otro > 0),
          borderWidth: 1,
        },
      ],
    };
  }, [reservas]);

  return {
    state: { fecha, periodo },
    actions: { setFecha, setPeriodo },
    query,
    cards,
    charts: {
      reservasPorLab: chartReservasPorLab,
      estado: doughnutEstado,
      topUsuarios: chartTopUsuarios,
      slots: chartSlots,
    },
    options: { barOptions, doughnutOptions },
  };
}
