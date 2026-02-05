import { COLORS } from './src/config/theme.config.js';

/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Colores de estados de reservas
        'reservation-pending': COLORS.reservation.pendiente,
        'reservation-confirmed': COLORS.reservation.confirmada,
        'reservation-cancelled': COLORS.reservation.cancelada,
        'reservation-other': COLORS.reservation.otro,

        // Colores de charts
        'chart-primary': COLORS.chart.primary,
        'chart-success': COLORS.chart.success,
        'chart-purple': COLORS.chart.purple,

        // Fondos especiales
        'bg-reportes': COLORS.background.reportes,
      },
    },
  },
  plugins: [],
  // Preparado para dark mode futuro
  darkMode: 'class',
}