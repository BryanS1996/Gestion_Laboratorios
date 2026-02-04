import { apiPost, apiGet } from "./apiClient";

export const stripeService = {
  checkout: (jwtToken, payload) => apiPost("/stripe/checkout", payload, { jwtToken }),
  verify: (jwtToken, sessionId) => apiGet("/stripe/verify", { jwtToken, params: { session_id: sessionId } }),
};
