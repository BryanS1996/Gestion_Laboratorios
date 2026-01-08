import { useState, useEffect, useCallback } from 'react';
import { useAuth } from './useAuth';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export const useDashboard = (refreshInterval = 5000) => {
  const { jwtToken } = useAuth();
  const [stats, setStats] = useState(null);
  const [disponibilidad, setDisponibilidad] = useState(null);
  const [reservas, setReservas] = useState([]);
  const [reportes, setReportes] = useState([]);
  const [usuarios, setUsuarios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchData = useCallback(async () => {
    if (!jwtToken) return;

    try {
      setLoading(true);
      
      // Obtener estadísticas
      const statsRes = await fetch(`${API_URL}/dashboard/stats`, {
        headers: { 'Authorization': `Bearer ${jwtToken}` }
      });
      
      if (statsRes.ok) {
        const statsData = await statsRes.json();
        setStats(statsData.stats);
      }

      // Obtener disponibilidad
      const dispoRes = await fetch(`${API_URL}/dashboard/disponibilidad`, {
        headers: { 'Authorization': `Bearer ${jwtToken}` }
      });
      
      if (dispoRes.ok) {
        const dispoData = await dispoRes.json();
        setDisponibilidad(dispoData);
      }

      // Obtener reservas recientes
      const resRes = await fetch(`${API_URL}/dashboard/reservas?limite=5`, {
        headers: { 'Authorization': `Bearer ${jwtToken}` }
      });
      
      if (resRes.ok) {
        const resData = await resRes.json();
        setReservas(resData.reservas || []);
      }

      // Obtener reportes pendientes (si es admin)
      const repRes = await fetch(`${API_URL}/dashboard/reportes?limite=5`, {
        headers: { 'Authorization': `Bearer ${jwtToken}` }
      });
      
      if (repRes.ok) {
        const repData = await repRes.json();
        setReportes(repData.reportes || []);
      }

      // Obtener usuarios de Firebase Auth (si es admin)
      const firebaseUsersRes = await fetch(`${API_URL}/auth/firebase-users`, {
        headers: { 'Authorization': `Bearer ${jwtToken}` }
      });
      
      if (firebaseUsersRes.ok) {
        const firebaseUsersData = await firebaseUsersRes.json();
        setUsuarios(firebaseUsersData.usuarios || []);
      }

      setError(null);
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [jwtToken]);

  // Cargar datos inicialmente
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Actualizar en tiempo real con polling
  useEffect(() => {
    const interval = setInterval(fetchData, refreshInterval);
    return () => clearInterval(interval);
  }, [fetchData, refreshInterval]);

  return { stats, disponibilidad, reservas, reportes, usuarios, loading, error, refetch: fetchData };
};
