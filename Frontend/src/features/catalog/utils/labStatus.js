const HORAS_TOTALES_DIA = 10;

export function getLabStatus(lab, reservasDelDia) {
  const labIdActual = String(lab?.id || lab?._id);

  const reservasEsteLab = (reservasDelDia || []).filter((r) => {
    const resLabId = String(r?.laboratorioId);
    const esActiva = r?.estado !== 'cancelada';
    return resLabId === labIdActual && esActiva;
  });

  const horasOcupadas = reservasEsteLab.reduce((total, r) => {
    const inicio = parseInt(r?.horaInicio, 10);
    const fin = parseInt(r?.horaFin, 10);
    if (Number.isNaN(inicio) || Number.isNaN(fin)) return total;
    return total + (fin - inicio);
  }, 0);

  const estaLleno = horasOcupadas >= HORAS_TOTALES_DIA;
  const estadoStr = String(lab?.estado || '').toLowerCase();

  if (estadoStr === 'mantenimiento') return { ocupado: true, label: 'Mantenimiento', color: 'red' };
  if (estadoStr === 'ocupado') return { ocupado: true, label: 'Ocupado', color: 'red' };
  if (estaLleno) return { ocupado: true, label: 'Agotado', color: 'red' };
  return { ocupado: false, label: 'Disponible', color: 'green' };
}

export function isPremiumLab(lab) {
  return String(lab?.tipoAcceso || '').toLowerCase() === 'premium';
}
