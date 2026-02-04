import { apiGet } from '../../../../services/apiClient';

export function fetchDashboardStats({ jwtToken, fecha, periodo }) {
  return apiGet('/dashboard/stats', {
    jwtToken,
    params: { fecha, periodo },
  });
}
