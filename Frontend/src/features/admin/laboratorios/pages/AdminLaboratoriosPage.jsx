import LabsHeader from '../components/LabsHeader';
import ExportControls from '../components/ExportControls';
import LabsGrid from '../components/LabsGrid';
import { useAdminLaboratoriosPage } from '../hooks/useAdminLaboratoriosPage';

export default function AdminLaboratoriosPage() {
  const { state, data, ui, actions } = useAdminLaboratoriosPage();
  if (ui.error) return <p className="text-red-600">Error cargando laboratorios</p>;

  const emptyLabel = ui.hasSearch ? 'No hay resultados para tu búsqueda' : 'No hay laboratorios para mostrar';

  return (
    <div className="h-[calc(100vh-64px)] flex flex-col gap-4 overflow-hidden animate-fade-in">
      <LabsHeader
        fecha={state.fecha}
        onFechaChange={actions.setFecha}
        search={state.search}
        onSearchChange={actions.setSearch}
      />

      <ExportControls
        exportMode={state.exportMode}
        onExportModeChange={actions.setExportMode}
        onExport={actions.exportarPDFReservas}
        disabled={!ui.canExport}
      />

      <LabsGrid labs={data.laboratorios} showSkeleton={ui.showSkeleton} emptyLabel={emptyLabel} />
    </div>
  );
}
