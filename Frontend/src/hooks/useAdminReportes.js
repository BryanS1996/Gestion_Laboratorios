import { useEffect, useState } from 'react';
import { useAuth } from './useAuth';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export const useAdminReportes = () => {
  const { jwtToken } = useAuth();

  const [reportes, setReportes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  /* =========================
     GET REPORTES ADMIN
     ========================= */
  const fetchReportes = async () => {
    try {
      setLoading(true);

      const res = await fetch(`${API_URL}/admin/reportes`, {
        headers: {
          Authorization: `Bearer ${jwtToken}`,
        },
      });

      if (!res.ok) {
        throw new Error('Error al obtener reportes');
      }

      const data = await res.json();
      setReportes(data.reportes || []);
      setError(null);
    } catch (err) {
      console.error(err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  /* =========================
     PATCH ESTADO
     ========================= */
  const cambiarEstado = async (id, estado) => {
    try {
      const res = await fetch(
        `${API_URL}/admin/reportes/${id}/estado`,
        {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${jwtToken}`,
          },
          body: JSON.stringify({ estado }),
        }
      );

      if (!res.ok) {
        throw new Error('Error al actualizar estado');
      }

      setReportes((prev) =>
        prev.map((r) =>
          r._id === id ? { ...r, estado } : r
        )
      );
    } catch (err) {
      console.error(err);
      alert('No se pudo actualizar el estado');
    }
  };

  useEffect(() => {
    if (jwtToken) fetchReportes();
  }, [jwtToken]);

  return {
    reportes,
    loading,
    error,
    cambiarEstado,
    refetch: fetchReportes,
  };
};
