import { apiDelete, apiGet, apiPostForm } from "./apiClient";

export const reportesService = {
  mine: (jwtToken) => apiGet("/reportes/mis-reportes", { jwtToken }),
  imagenUrl: (jwtToken, reporteId) => apiGet(`/reportes/${reporteId}/imagen-url`, { jwtToken }),
  create: (jwtToken, formData) => apiPostForm("/reportes", formData, { jwtToken }),
  remove: (jwtToken, reporteId) => apiDelete(`/reportes/${reporteId}`, { jwtToken }),
};
