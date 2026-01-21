import { useQuery } from '@tanstack/react-query';
import { mockStats, mockReservas, mockHorarios } from '../mocks/dashboardMock';

const API_URL = import.meta.env.VITE_API_URL;
const USE_MOCK = import.meta.env.VITE_USE_MOCK === 'true';

export const useDashboard = () => {
  const statsQuery = useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: async () => {
      if (USE_MOCK) return mockStats;

      const res = await fetch(`${API_URL}/dashboard/stats`);
      if (!res.ok) throw new Error('Error stats');
      const data = await res.json();
      return data.stats;
    },
  });

  const reservasQuery = useQuery({
    queryKey: ['dashboard-reservas'],
    queryFn: async () => {
      if (USE_MOCK) return mockReservas;

      const res = await fetch(`${API_URL}/dashboard/reservas?limite=20`);
      if (!res.ok) throw new Error('Error reservas');
      const data = await res.json();
      return data.reservas;
    },
  });

  return {
    stats: statsQuery.data,
    reservas: reservasQuery.data || [],
    horarios: mockHorarios,
    loading: statsQuery.isLoading || reservasQuery.isLoading,
    error: statsQuery.error || reservasQuery.error,
  };
};
