import ReportesHeader from '../components/ReportesHeader';
import ReportesStats from '../components/ReportesStats';
import ReportesFilters from '../components/ReportesFilters';
import ReportesTable from '../components/ReportesTable';
import ReporteDetalleModal from '../components/ReporteDetalleModal';
import { useReportesAdminPage } from '../hooks/useReportesAdminPage';

export default function ReportesAdminPage() {
  const { state, data, ui, actions } = useReportesAdminPage();

  if (ui.loading) return <p>Cargando reportes...</p>;
  if (ui.error) return <p className="text-red-500">{ui.error.message || String(ui.error)}</p>;

  return (
    <div className="space-y-6">
      <ReportesHeader refreshing={ui.refreshing} onRefetch={actions.refetch} onExport={actions.exportarPDF} />

      <ReportesStats stats={data.stats} />

      <ReportesFilters
        filtroEstado={state.filtroEstado}
        onFiltroEstado={actions.setFiltroEstado}
        filtroTexto={state.filtroTexto}
        onFiltroTexto={actions.setFiltroTexto}
      />

      <ReportesTable
        reportes={data.reportes}
        onRowClick={actions.setReporteSeleccionado}
        onChangeEstado={actions.cambiarEstado}
      />

      {state.reporteSeleccionado && (
        <ReporteDetalleModal reporte={state.reporteSeleccionado} onClose={() => actions.setReporteSeleccionado(null)} />
      )}
    </div>
  );
}
