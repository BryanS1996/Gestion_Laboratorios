import { useMemo } from 'react';
import { Bar } from 'react-chartjs-2';
import { ensureChartRegistry } from './chartRegistry';

/**
 * Wrapper seguro para <Bar /> de react-chartjs-2.
 * - Registra Chart.js una sola vez.
 * - Usa `redraw` para evitar artefactos cuando cambia data/options.
 */
export default function BarChart({ data, options, className = '' }) {
  ensureChartRegistry();

  // Key estable por referencia para forzar re-creación cuando cambien estructuras grandes
  const chartKey = useMemo(() => {
    try {
      return JSON.stringify({ l: data?.labels?.length, d: data?.datasets?.length });
    } catch {
      return 'bar';
    }
  }, [data]);

  return (
    <div className={className}>
      <Bar key={chartKey} data={data} options={options} redraw />
    </div>
  );
}
