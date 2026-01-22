import { useQuery } from '@tanstack/react-query';
import { useAuth } from './useAuth';

export const useAdminLaboratorios = (fecha) => {
  const { jwtToken } = useAuth();

  return useQuery({
    queryKey: ['admin-labs', fecha],
    queryFn: async () => {
      const res = await fetch(
        `${import.meta.env.VITE_API_URL}/admin/laboratorios/estado?fecha=${fecha}`,
        {
          headers: {
            Authorization: `Bearer ${jwtToken}`,
          },
        }
      );

      if (!res.ok) throw new Error('Error cargando laboratorios');
      return res.json();
    },
  });
};
