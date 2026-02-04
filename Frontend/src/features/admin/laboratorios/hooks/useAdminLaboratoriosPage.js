import { useMemo, useState } from 'react';
import { DateTime } from 'luxon';
import { useQuery } from '@tanstack/react-query';
import useDebounce from '../../../../hooks/useDebounce';
import { useAuth } from '../../../../hooks/useAuth';
import { ZONE } from '../../../../config/env';
import { getLaboratoriosBase, getEstadoLaboratorios } from '../services/adminLaboratorios.service';
import { buildRange, eachDayISO } from '../utils/dateRange';
import { exportReservasPDF } from '../utils/pdfExport';

const mergeLaboratorios = (baseLabs, estado) => {
  const estadoLabs = estado?.laboratorios || [];
  const estadoMap = new Map(estadoLabs.map((x) => [x.laboratorioId, x]));

  return (baseLabs || []).map((lab) => {
    const id = lab.id || lab._id || lab.laboratorioId;
    const estadoLab = estadoMap.get(id);
    const horarios = Array.isArray(estadoLab?.horarios) ? estadoLab.horarios : [];
    const ocupado = horarios.some((r) => r.estado === 'confirmada' || r.estado === 'pendiente');
    return {
      id,
      nombre: lab.nombre || lab.laboratorioNombre || 'Sin nombre',
      ocupado,
      horarios: horarios.sort((a, b) => Number(a.horaInicio) - Number(b.horaInicio)),
    };
  });
};

export const useAdminLaboratoriosPage = () => {
  const { jwtToken } = useAuth();
  const [fecha, setFecha] = useState(DateTime.now().setZone(ZONE).toISODate());
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search.trim(), 3000);
  const [exportMode, setExportMode] = useState('day'); // day | week | month

  const labsQuery = useQuery({
    queryKey: ['labs-base'],
    enabled: !!jwtToken,
    queryFn: () => getLaboratoriosBase({ jwtToken }),
    staleTime: 0,
    refetchInterval: 4000,
    refetchIntervalInBackground: true,
  });

  const estadoQuery = useQuery({
    queryKey: ['admin-labs-estado', fecha],
    enabled: !!jwtToken && !!fecha,
    queryFn: () => getEstadoLaboratorios({ jwtToken, fecha }),
    staleTime: 0,
    refetchInterval: 2000,
    refetchIntervalInBackground: true,
  });

  const laboratorios = useMemo(() => {
    return mergeLaboratorios(labsQuery.data, estadoQuery.data);
  }, [labsQuery.data, estadoQuery.data]);

  const laboratoriosFiltrados = useMemo(() => {
    const q = String(debouncedSearch || '').trim().toLowerCase();
    if (!q) return laboratorios;
    return laboratorios.filter((lab) => {
      const name = String(lab.nombre || '').toLowerCase();
      const id = String(lab.id || '').toLowerCase();
      return name.includes(q) || id.includes(q);
    });
  }, [laboratorios, debouncedSearch]);

  const isSearchDebouncing = !!search.trim() && search.trim() !== debouncedSearch;
  const isLoadingNetwork = labsQuery.isLoading || estadoQuery.isLoading;
  const showSkeleton = isLoadingNetwork || isSearchDebouncing;

  const exportarPDFReservas = async () => {
    const range = buildRange(fecha, exportMode);
    if (!range || !jwtToken) return;
    const days = eachDayISO(range);

    const estadosPorDia = await Promise.all(
      days.map(async (d) => {
        const json = await getEstadoLaboratorios({ jwtToken, fecha: d });
        return { dateISO: d, laboratorios: json?.laboratorios || [] };
      })
    );

    exportReservasPDF({
      exportMode,
      baseFechaISO: fecha,
      rangeLabel: range.label,
      baseLabs: labsQuery.data || [],
      estadosPorDia,
    });
  };

  return {
    state: {
      fecha,
      search,
      exportMode,
    },
    data: {
      laboratorios: laboratoriosFiltrados,
      total: laboratoriosFiltrados.length,
    },
    ui: {
      showSkeleton,
      isSearchDebouncing,
      isLoadingNetwork,
      error: labsQuery.error || estadoQuery.error,
      hasSearch: !!debouncedSearch,
      canExport: !!jwtToken,
    },
    actions: {
      setFecha,
      setSearch,
      setExportMode,
      exportarPDFReservas,
      refetch: () => {
        labsQuery.refetch();
        estadoQuery.refetch();
      },
    },
  };
};
