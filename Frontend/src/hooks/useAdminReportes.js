// src/hooks/useAdminReportes.js
import { useEffect, useRef, useState, useCallback } from "react";
import { useAuth } from "./useAuth";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

export const useAdminReportes = () => {
  const { jwtToken } = useAuth();

  const [reportes, setReportes] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);     // only first load
  const [error, setError] = useState(null);

  const intervalRef = useRef(null);
  const inFlightRef = useRef(false);
  const lastHashRef = useRef("");

  const fetchReportes = useCallback(async (isBackground = false) => {
    if (!jwtToken) return;
    if (inFlightRef.current) return;

    inFlightRef.current = true;

    try {
      if (!isBackground) setLoading(true);

      const res = await fetch(`${API_URL}/admin/reportes`, {
        headers: { Authorization: `Bearer ${jwtToken}` },
      });

      if (!res.ok) throw new Error("Error al obtener reportes");

      const data = await res.json();

      const nextReportes = data.reportes || [];
      const nextStats = data.stats || null;

      // Prevent useless re-renders: update only if data changed
      const nextHash = JSON.stringify(
        nextReportes.map((r) => `${r._id}:${r.estado}:${r.fechaCreacion}`)
      );

      if (nextHash !== lastHashRef.current) {
        lastHashRef.current = nextHash;
        setReportes(nextReportes);
        setStats(nextStats);
      }

      setError(null);
    } catch (err) {
      setError(err.message || "Error al obtener reportes");
    } finally {
      inFlightRef.current = false;
      if (!isBackground) setLoading(false);
    }
  }, [jwtToken]);

  const cambiarEstado = async (id, estado) => {
    try {
      const res = await fetch(`${API_URL}/admin/reportes/${id}/estado`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${jwtToken}`,
        },
        body: JSON.stringify({ estado }),
      });

      if (!res.ok) throw new Error("Error al actualizar estado");

      // Optimistic UI update
      setReportes((prev) => prev.map((r) => (r._id === id ? { ...r, estado } : r)));
    } catch (err) {
      console.error(err);
      alert("No se pudo actualizar el estado");
    }
  };

  // First load
  useEffect(() => {
    if (!jwtToken) return;
    fetchReportes(false);
  }, [jwtToken, fetchReportes]);

  // Polling every 1s
  useEffect(() => {
    if (!jwtToken) return;

    // Clear previous interval if any
    if (intervalRef.current) clearInterval(intervalRef.current);

    intervalRef.current = setInterval(() => {
      // Only poll when tab is visible
      if (document.visibilityState === "visible") {
        fetchReportes(true); // background refresh
      }
    }, 1000);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      intervalRef.current = null;
    };
  }, [jwtToken, fetchReportes]);

  return {
    reportes,
    stats,
    loading,
    error,
    cambiarEstado,
    refetch: () => fetchReportes(false),
  };
};
