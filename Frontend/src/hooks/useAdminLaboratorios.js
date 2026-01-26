import { useQuery } from '@tanstack/react-query';
import { useAuth } from './useAuth';

export const useAdminLaboratorios = (fecha) => {
  const { jwtToken } = useAuth();

  return useQuery({
    queryKey: ['admin-labs', fecha],
    enabled: !!jwtToken && !!fecha,
    queryFn: async () => {
      const base = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
      
      const res = await fetch(
        `${base}/admin/laboratorios/estado?fecha=${encodeURIComponent(fecha)}`,
        {
          headers: {
            Authorization: `Bearer ${jwtToken}`,
          },
          // ✅ Forzamos al navegador a no usar caché de disco/memoria
          cache: 'no-store', 
        }
      );

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
    refetchOnWindowFocus: true,
  });
};