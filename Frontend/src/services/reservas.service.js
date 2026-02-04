import { apiGet, apiPatch, apiPost } from "./apiClient";

export const reservasService = {
  mine: (jwtToken) => apiGet("/reservas/mine", { jwtToken }),
  list: (jwtToken) => apiGet("/reservas", { jwtToken }),
  create: (jwtToken, payload) => apiPost("/reservas", payload, { jwtToken }),
  availability: (jwtToken, { laboratorioId, fecha }) =>
    apiGet("/reservas/availability", { jwtToken, params: { laboratorioId, fecha } }),
  cancel: (jwtToken, id) => apiPatch(`/reservas/${id}/cancel`, null, { jwtToken }),
};
