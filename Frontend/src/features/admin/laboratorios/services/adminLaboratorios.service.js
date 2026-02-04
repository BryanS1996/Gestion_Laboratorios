import { apiGet } from '../../../../services/apiClient';

export const getLaboratoriosBase = async ({ jwtToken }) => {
  const data = await apiGet('/laboratorios', { jwtToken });
  return Array.isArray(data) ? data : (data?.laboratorios || []);
};

export const getEstadoLaboratorios = async ({ jwtToken, fecha }) => {
  return apiGet('/admin/laboratorios/estado', { jwtToken, params: { fecha } });
};
