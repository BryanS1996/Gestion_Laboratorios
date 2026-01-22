import { useQuery } from '@tanstack/react-query';
import { useAuth } from './useAuth';

const API_URL = import.meta.env.VITE_API_URL;

export const useAdminUsers = () => {
  const { jwtToken } = useAuth();

  return useQuery({
    queryKey: ['admin-users'],
    queryFn: async () => {
      const res = await fetch(`${API_URL}/admin/users`, {
        headers: {
          Authorization: `Bearer ${jwtToken}`,
        },
      });

      if (!res.ok) {
        throw new Error('Error cargando usuarios');
      }

      return res.json();
    },
  });
};
