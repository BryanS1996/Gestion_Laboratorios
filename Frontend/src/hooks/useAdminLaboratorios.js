import { useQuery } from '@tanstack/react-query';
import { useAuth } from './useAuth';

export const useAdminLaboratorios = (fecha) => {
  const { jwtToken } = useAuth();

  return useQuery({
    queryKey: ['admin-labs', fecha],
    enabled: !!jwtToken && !!fecha,
    queryFn: async () => {
      const base = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
      
      const res = await fetch(`${base}/admin/laboratorios/estado?fecha=${encodeURIComponent(fecha)}`, {
        headers: { Authorization: `Bearer ${jwtToken}` },
        cache: 'no-store',
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || 'Error cargando laboratorios');
      }
      
      return res.json();
    },

    // Configuración de refresco automático
    refetchInterval: 2000, // Cada 2 segundos (según tu código, aunque el comentario decía 4s)
    refetchIntervalInBackground: true,
    staleTime: 0,
    cacheTime: 0,
    refetchOnWindowFocus: true,

    //refetchInterval: 15000,            // ✅ cada 15s (o 30s)
    //refetchIntervalInBackground: false, // ✅ NO refresca si está en otra pestaña
    //staleTime: 10_000,                 // ✅ evita refetch innecesario
    //refetchOnWindowFocus: true,         // ✅ refresca al volver a la pestaña

  });
};