import { useMemo, useState } from 'react';
import { useAdminReportesQuery } from './useAdminReportesQuery';
import { useUpdateReporteEstado } from './useUpdateReporteEstado';
import { exportReportesPDF } from '../utils/pdfExport';

const safeLower = (v) => String(v || '').toLowerCase();

export const useReportesAdminPage = () => {
  const [filtroEstado, setFiltroEstado] = useState('todos');
  const [filtroTexto, setFiltroTexto] = useState('');
  const [reporteSeleccionado, setReporteSeleccionado] = useState(null);

  const q = useAdminReportesQuery(filtroEstado);
  const update = useUpdateReporteEstado(filtroEstado);

  const reportes = q.data?.reportes || [];
  const stats = q.data?.stats || null;

  const reportesFiltrados = useMemo(() => {
    const texto = safeLower(filtroTexto);
    return reportes.filter((r) => {
      const cumpleTexto = safeLower(r.titulo).includes(texto) || safeLower(r.userEmail).includes(texto);
      return cumpleTexto;
    });
  }, [reportes, filtroTexto]);

  const exportarPDF = async () => {
    await exportReportesPDF({ reportes: reportesFiltrados });
  };

  return {
    state: {
      filtroEstado,
      filtroTexto,
      reporteSeleccionado,
    },
    data: {
      reportes: reportesFiltrados,
      stats,
    },
    ui: {
      loading: q.isLoading,
      error: q.error,
      refreshing: q.isFetching && !q.isLoading,
    },
    actions: {
      setFiltroEstado,
      setFiltroTexto,
      setReporteSeleccionado,
      refetch: () => q.refetch(),
      cambiarEstado: (id, estado) => update.mutate({ id, estado }),
      exportarPDF,
    },
  };
};
