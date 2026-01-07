import { useAuth } from './useAuth';

export const useApi = () => {
  const { token } = useAuth();

  const apiCall = async (url, options = {}) => {
    const headers = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    if (token()) {
      headers['Authorization'] = `Bearer ${token()}`;
    }

    const response = await fetch(url, {
      ...options,
      headers,
    });

    if (!response.ok) {
      throw new Error(`API Error: ${response.status}`);
    }

    return response.json();
  };

  return { apiCall };
};