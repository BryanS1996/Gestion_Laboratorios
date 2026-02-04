import { useMemo } from 'react';
import { Bar } from 'react-chartjs-2';
import { ensureChartRegistry } from './chartRegistry';

export default function BarChart({ data, options, className = '' }) {
  ensureChartRegistry();

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
