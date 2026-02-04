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

/**
 * Registra Chart.js una sola vez para evitar bugs por doble registro
 * (muy común con React StrictMode y re-mounts en desarrollo).
 */
export function ensureChartRegistry() {
  if (registered) return;
  ChartJS.register(CategoryScale, LinearScale, BarElement, ArcElement, Tooltip, Legend);
  registered = true;
}
