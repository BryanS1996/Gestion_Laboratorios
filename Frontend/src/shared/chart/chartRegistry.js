import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Tooltip,
  Legend,
} from 'chart.js';

let registered = false;

// Register Chart.js globally to avoid re-registration errors*/
export function ensureChartRegistry() {
  if (registered) return;
  ChartJS.register(CategoryScale, LinearScale, BarElement, ArcElement, Tooltip, Legend);
  registered = true;
}
