import { Navigate } from 'react-router-dom';
import ReservationModal from '../../../components/ReservationModal';
import { useCatalogPage } from '../hooks/useCatalogPage';
import CatalogShell from '../components/CatalogShell';
import CatalogFilters from '../components/CatalogFilters';
import LabGrid from '../components/LabGrid';

export default function CatalogPage() {
  const { state, data, flags, actions } = useCatalogPage();

  // If auth is loading, wait (prevents flickers)
  if (flags.isLoading) {
    return (
      <CatalogShell>
        <div className="bg-white border rounded-2xl p-8 text-center text-slate-500">Cargando...</div>
      </CatalogShell>
    );
  }

  if (!flags.jwtToken) {
    return <Navigate to="/login" replace state={{ from: '/catalogo' }} />;
  }

  const canReserve = flags.isStudent || flags.isProfessor;

  return (
    <CatalogShell>
      <h1 className="text-2xl font-bold text-slate-900 mb-2">Catálogo de laboratorios</h1>
      <p className="text-sm text-slate-600 mb-6">Selecciona fecha y reserva un horario disponible.</p>

      <CatalogFilters
        search={state.search}
        onSearch={actions.setSearch}
        tipos={data.tipos}
        typeFilter={state.typeFilter}
        onTypeFilter={actions.setTypeFilter}
        fecha={state.fecha}
        onFecha={actions.setFecha}
        total={data.labs.length}
        filtered={data.filteredLabs.length}
      />

      <LabGrid
        labs={data.filteredLabs}
        getStatus={actions.getStatus}
        canReserve={canReserve}
        onOpen={actions.openReservation}
      />

      <ReservationModal
        isOpen={state.modalOpen}
        onClose={actions.closeModal}
        lab={state.selectedLab}
        jwtToken={flags.jwtToken}
        defaultDate={state.fecha}
        onReserve={(payload) => actions.reserve(payload, state.selectedLab)}
      />
    </CatalogShell>
  );
}
