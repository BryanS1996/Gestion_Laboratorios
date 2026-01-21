import { useQuery } from '@tanstack/react-query';
import { useAuth } from './useAuth';

const API_URL = import.meta.env.VITE_API_URL;

export const useDashboard = () => {
  const { jwtToken } = useAuth();

  const {
    data,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ['dashboard'],
    enabled: !!jwtToken,

    queryFn: async () => {
      const res = await fetch(`${API_URL}/dashboard/stats`, {
        headers: {
          Authorization: `Bearer ${jwtToken}`,
        },
      });

      if (!res.ok) {
        throw new Error('Error cargando dashboard');
      }

      return res.json();
    },

    // ⏱️ OPTIMIZACIÓN FIRESTORE
    refetchInterval: 10000,      
    staleTime: 3000,
    cacheTime: 60000,
    refetchOnWindowFocus: false,
    retry: 1,
  });

  return {
    stats: data?.stats ?? null,
    reservas: data?.reservas ?? [],
    loading: isLoading,
    error: isError ? error : null,
  };
};
