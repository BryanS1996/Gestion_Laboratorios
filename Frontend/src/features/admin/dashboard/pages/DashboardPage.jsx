import { Navigate } from 'react-router-dom';
import { useAuth } from '../../../../hooks/useAuth';
import Spinner from '../../../../components/admin/Spinner';
import BarChart from '../../../../shared/chart/BarChart';
import DoughnutChart from '../../../../shared/chart/DoughnutChart';
import { useDashboardPage } from '../hooks/useDashboardPage';
import DashboardHeader from '../components/DashboardHeader';
import DashboardFilters from '../components/DashboardFilters';
import StatCards from '../components/StatCards';
import ChartCard from '../components/ChartCard';

export default function DashboardPage() {
  const { user, loading: authLoading } = useAuth();
  const isAdmin = user?.role === 'admin';
  const vm = useDashboardPage();

  if (authLoading) return <Spinner />;
  if (!user) return <Navigate to="/login" replace />;
  if (!isAdmin) return <Navigate to="/catalogo" replace />;

  if (vm.query.isLoading) return <Spinner />;
  if (vm.query.error) {
    return (
      <div className="p-6 text-red-600">
        Error cargando dashboard: {vm.query.error.message}
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
        <DashboardHeader />
        <DashboardFilters
          fecha={vm.state.fecha}
          periodo={vm.state.periodo}
          onFechaChange={vm.actions.setFecha}
          onPeriodoChange={vm.actions.setPeriodo}
        />
      </div>

      <StatCards cards={vm.cards} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mt-6">
        <ChartCard title="Reservas por laboratorio" className="lg:col-span-2" heightClass="h-72">
          <BarChart data={vm.charts.reservasPorLab} options={vm.options.barOptions} className="h-full" />
        </ChartCard>
        <ChartCard title="Estado de reservas" heightClass="h-72">
          <DoughnutChart data={vm.charts.estado} options={vm.options.doughnutOptions} className="h-full" />
        </ChartCard>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mt-4">
        <ChartCard title="Top usuarios" heightClass="h-64">
          <BarChart data={vm.charts.topUsuarios} options={vm.options.barOptions} className="h-full" />
        </ChartCard>
        <ChartCard title="Demanda por horario" heightClass="h-64">
          <BarChart data={vm.charts.slots} options={vm.options.barOptions} className="h-full" />
        </ChartCard>
      </div>
    </div>
  );
}
