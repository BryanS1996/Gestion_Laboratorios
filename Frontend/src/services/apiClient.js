import axios from "axios";
import { API_URL } from "../config/env";

// Single axios instance for the app.
// We pass the token per-request to keep auth decoupled from the client.
const client = axios.create({
  baseURL: API_URL,
  timeout: 30000,
});

function normalizeError(error) {
  return (
    error?.response?.data?.error ||
    error?.response?.data?.message ||
    error?.message ||
    "Error inesperado"
  );
}

function authHeaders(jwtToken, extra = {}) {
  return {
    ...extra,
    ...(jwtToken ? { Authorization: `Bearer ${jwtToken}` } : {}),
  };
}

export async function apiGet(path, { jwtToken, params, headers } = {}) {
  try {
    const res = await client.get(path, {
      params,
      headers: authHeaders(jwtToken, headers),
    });
    return res.data;
  } catch (e) {
    throw new Error(normalizeError(e));
  }
}

export async function apiPost(path, body, { jwtToken, params, headers } = {}) {
  try {
    const res = await client.post(path, body, {
      params,
      headers: authHeaders(jwtToken, headers),
    });
    return res.data;
  } catch (e) {
    throw new Error(normalizeError(e));
  }
}

export async function apiPatch(path, body, { jwtToken, params, headers } = {}) {
  try {
    const res = await client.patch(path, body, {
      params,
      headers: authHeaders(jwtToken, headers),
    });
    return res.data;
  } catch (e) {
    throw new Error(normalizeError(e));
  }
}

export async function apiDelete(path, { jwtToken, params, headers } = {}) {
  try {
    const res = await client.delete(path, {
      params,
      headers: authHeaders(jwtToken, headers),
    });
    return res.data;
  } catch (e) {
    throw new Error(normalizeError(e));
  }
}

export async function apiPostForm(path, formData, { jwtToken, params, headers } = {}) {
  try {
    const res = await client.post(path, formData, {
      params,
      headers: authHeaders(jwtToken, {
        // Let the browser set the multipart boundary
        ...headers,
      }),
    });
    return res.data;
  } catch (e) {
    throw new Error(normalizeError(e));
  }
}
