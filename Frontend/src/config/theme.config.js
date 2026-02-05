/**
 * Sistema de diseño global - Colores
 * Centraliza todos los colores usados en la aplicación
 * para facilitar mantenimiento y soporte de temas (Dark/Light mode)
 */
export const COLORS = {
  // Estados de reservas (charts y badges)
  reservation: {
    pendiente: '#facc15',   // yellow-400
    confirmada: '#22c55e',  // green-500
    cancelada: '#ef4444',   // red-500
    otro: '#94a3b8',        // slate-400
  },

  // Charts administrativos
  chart: {
    primary: '#2563eb',     // blue-600 - Reservas por laboratorio
    success: '#16a34a',     // green-600 - Top usuarios
    purple: '#9333ea',      // purple-600 - Demanda por horario
  },

  // Fondos especiales
  background: {
    reportes: '#d3b11d',    // gold/yellow fondo reportes
  },

  // UI Base (para toasts y componentes)
  ui: {
    white: '#ffffff',
    textDark: '#1e293b',    // slate-800
  },
};

/**
 * Obtener array de colores para estados de reserva
 * @param {boolean} includeOtro - Incluir categoría "Otro"
 * @returns {string[]} Array de colores hexadecimales
 */
export const getReservationColors = (includeOtro = false) => {
  const base = [
    COLORS.reservation.pendiente,
    COLORS.reservation.confirmada,
    COLORS.reservation.cancelada,
  ];
  return includeOtro ? [...base, COLORS.reservation.otro] : base;
};

/**
 * Configuración del sistema de toasts
 * Centraliza estilos para react-hot-toast
 */
export const TOAST_CONFIG = {
  position: 'top-right',
  duration: 2000,
  style: {
    borderRadius: '12px',
    background: COLORS.ui.white,
    color: COLORS.ui.textDark,
    boxShadow: '0 10px 25px rgba(0,0,0,.1)',
  },
};
