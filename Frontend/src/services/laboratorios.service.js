import { apiGet } from './apiClient';

export const laboratoriosService = {
  list: (jwtToken) => apiGet('/laboratorios', { jwtToken }),
};
