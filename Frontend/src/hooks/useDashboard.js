import { useQuery } from '@tanstack/react-query';
import { useAuth } from './useAuth'; 

const API_URL = import.meta.env.VITE_API_URL;

export const useDashboard = (fecha) => {
  const { jwtToken } = useAuth();

  const params = fecha ? `?fecha=${fecha}` : '';

  return useQuery({
    queryKey: ['dashboard', fecha],
    enabled: !!jwtToken,

    queryFn: async () => {
      const res = await fetch(
        `${API_URL}/dashboard/stats${params}`,
        {
          headers: {
            Authorization: `Bearer ${jwtToken}`,
          },
        }
      );

      if (!res.ok) {
        throw new Error('No autorizado o sin datos');
      }

      return res.json();
    },

    refetchInterval: 10000,
    staleTime: 5000,
    refetchOnWindowFocus: false,
  });
};