import { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from './useAuth';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export const useDashboard = (fecha, periodo = 'day') => {
  const { jwtToken } = useAuth();
  const [isVisible, setIsVisible] = useState(document.visibilityState === 'visible');

  useEffect(() => {
    const onVis = () => setIsVisible(document.visibilityState === 'visible');
    document.addEventListener('visibilitychange', onVis);
    return () => document.removeEventListener('visibilitychange', onVis);
  }, []);

  const params = `?fecha=${encodeURIComponent(fecha)}&periodo=${encodeURIComponent(periodo)}`;

  return useQuery({
    queryKey: ['dashboard', fecha, periodo],
    enabled: !!jwtToken && !!fecha,

    queryFn: async () => {
      const res = await fetch(`${API_URL}/dashboard/stats${params}`, {
        headers: { Authorization: `Bearer ${jwtToken}` },
      });
      if (!res.ok) throw new Error('No autorizado o sin datos');
      return res.json();
    },

    refetchInterval: isVisible ? 10000 : false,
    staleTime: 8000,
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
    retry: 1,
  });
};
