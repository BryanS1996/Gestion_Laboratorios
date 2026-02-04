import { useMemo } from 'react';
import { Doughnut } from 'react-chartjs-2';
import { ensureChartRegistry } from './chartRegistry';


 // Wrapper 
export default function DoughnutChart({ data, options, className = '' }) {
  ensureChartRegistry();

  const chartKey = useMemo(() => {
    try {
      return JSON.stringify({ l: data?.labels?.length, d: data?.datasets?.length });
    } catch {
      return 'doughnut';
    }
  }, [data]);

  return (
    <div className={className}>
      <Doughnut key={chartKey} data={data} options={options} redraw />
    </div>
  );
}
