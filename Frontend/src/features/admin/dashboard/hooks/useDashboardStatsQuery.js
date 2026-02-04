import { useQuery } from '@tanstack/react-query';
import { useAuth } from '../../../../hooks/useAuth';
import { fetchDashboardStats } from '../services/dashboard.service';
import { useVisibilityState } from './useVisibilityState';

/**
 * Query dashboard stats + reservas (from backend cache).
 * Polls while the tab is visible.
 */
export function useDashboardStatsQuery({ fecha, periodo }) {
  const { jwtToken } = useAuth();
  const isVisible = useVisibilityState();

  return useQuery({
    queryKey: ['dashboard', fecha, periodo],
    enabled: !!jwtToken && !!fecha,
    queryFn: () => fetchDashboardStats({ jwtToken, fecha, periodo }),
    refetchInterval: isVisible ? 10000 : false,
    staleTime: 8000,
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
    retry: 1,
  });
}
