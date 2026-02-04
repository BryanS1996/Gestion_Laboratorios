import { useQuery } from '@tanstack/react-query';
import { useAuth } from '../../../../hooks/useAuth';
import { getAdminReportes } from '../services/adminReportes.service';
import { useVisibilityState } from '../../dashboard/hooks/useVisibilityState';

export const useAdminReportesQuery = (estado) => {
  const { jwtToken } = useAuth();
  const isVisible = useVisibilityState();

  return useQuery({
    queryKey: ['admin-reportes', estado],
    enabled: !!jwtToken,
    queryFn: () => getAdminReportes({ jwtToken, estado }),
    staleTime: 0,
    refetchInterval: isVisible ? 1000 : false,
    refetchIntervalInBackground: false,
  });
};
