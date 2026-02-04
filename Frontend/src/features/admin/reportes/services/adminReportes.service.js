import { apiGet, apiPatch } from '../../../../services/apiClient';

export const getAdminReportes = async ({ jwtToken, estado }) => {
  const params = estado && estado !== 'todos' ? { estado } : undefined;
  return apiGet('/admin/reportes', { jwtToken, params });
};

export const updateAdminReporteEstado = async ({ jwtToken, id, estado }) => {
  return apiPatch(`/admin/reportes/${id}/estado`, { estado }, { jwtToken });
};
