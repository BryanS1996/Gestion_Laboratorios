// hooks/useDashboard.js
import { useQuery } from '@tanstack/react-query';
import { useAuth } from './useAuth';

const API_URL = import.meta.env.VITE_API_URL;

const fetchStats = async (token) => {
  const res = await fetch(`${API_URL}/dashboard/stats`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error('Error fetching dashboard stats');
  return res.json();
};

const fetchReservas = async (token) => {
  const res = await fetch(`${API_URL}/dashboard/reservas?limite=20`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error('Error fetching dashboard reservations');
  return res.json();
};

export const useDashboard = () => {
  const { jwtToken } = useAuth();

  const statsQuery = useQuery({
    queryKey: ['dashboard', 'stats'],
    queryFn: () => fetchStats(jwtToken),
    enabled: !!jwtToken,
    staleTime: 1000 * 60 * 5, // 5 minutos
  });

  const reservasQuery = useQuery({
    queryKey: ['dashboard', 'reservas'],
    queryFn: () => fetchReservas(jwtToken),
    enabled: !!jwtToken,
    staleTime: 1000 * 60 * 2, // 2 minutos
  });

  return {
    stats: statsQuery.data?.stats ?? null,
    reservas: reservasQuery.data?.reservas ?? [],
    loading: statsQuery.isLoading || reservasQuery.isLoading,
    error: statsQuery.error || reservasQuery.error,
  };
};
