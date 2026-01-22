import { useState } from 'react';
import { useAdminLaboratorios } from '../../hooks/useAdminLaboratorios';

/* =====================================================
   PAGE
===================================================== */

const AdminLaboratorios = () => {
  const [fecha, setFecha] = useState(
    new Date().toISOString().slice(0, 10)
  );

  const { data, isLoading, error } = useAdminLaboratorios(fecha);

  // ✅ EXTRAEMOS BIEN EL ARRAY
  const laboratorios = data?.laboratorios ?? [];

  if (error) {
    return (
      <p className="text-red-600">
        Error cargando laboratorios
      </p>
    );
  }

  return (
    <div className="h-[calc(100vh-64px)] flex flex-col gap-4 overflow-hidden animate-fade-in">

      {/* HEADER */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">
            Laboratorios
          </h1>
          <p className="text-sm text-gray-500">
            Horarios reservados – {fecha}
          </p>
        </div>

        <input
          type="date"
          value={fecha}
          onChange={(e) => setFecha(e.target.value)}
          className="border rounded px-3 py-2 text-sm"
        />
      </div>

      {/* GRID */}
      <div className="grid grid-cols-2 xl:grid-cols-3 gap-4 flex-1">

        {isLoading ? (
          <>
            <SkeletonLab />
            <SkeletonLab />
            <SkeletonLab />
            <SkeletonLab />
          </>
        ) : laboratorios.length === 0 ? (
          <Empty />
        ) : (
          laboratorios.map((lab) => (
            <LabCard
              key={lab.laboratorioId}
              lab={lab}
            />
          ))
        )}

      </div>
    </div>
  );
};

export default AdminLaboratorios;

/* =====================================================
   COMPONENTES
===================================================== */

const LabCard = ({ lab }) => {
  return (
    <div className="bg-white border rounded-xl p-4 flex flex-col justify-between transition-all hover:shadow-md">

      {/* HEADER */}
      <div className="flex items-start justify-between mb-3">
        <div>
          <h2 className="font-semibold text-lg">
            {lab.laboratorioNombre}
          </h2>
          <p className="text-xs text-gray-500">
            {lab.laboratorioId}
          </p>
        </div>

        {/* ✅ el backend ya decide esto */}
        <StatusBadge ocupado={lab.ocupado} />
      </div>

      {/* HORARIOS */}
      <div className="flex-1">
        <p className="text-sm font-medium mb-2">
          Horarios reservados
        </p>

        {lab.horarios.length === 0 ? (
          <p className="text-xs text-gray-400">
            Sin reservas
          </p>
        ) : (
          <div className="grid grid-cols-2 gap-2">
            {lab.horarios.map((r, i) => (
              <div
                key={i}
                className="text-xs border rounded-md p-2 bg-gray-50"
              >
                <p className="font-medium">
                  {r.horaInicio} – {r.horaFin}
                </p>
                <p className="text-gray-400 truncate">
                  {r.userEmail || '—'}
                </p>
                <p className="text-[10px] capitalize text-gray-500">
                  {r.estado}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* FOOTER */}
      <div className="mt-3 text-xs text-gray-500">
        Total reservas: {lab.horarios.length}
      </div>
    </div>
  );
};

const StatusBadge = ({ ocupado }) => (
  <span
    className={`px-2 py-1 text-xs rounded-full font-medium
      ${ocupado
        ? 'bg-red-100 text-red-600'
        : 'bg-green-100 text-green-600'}
    `}
  >
    {ocupado ? 'Ocupado' : 'Disponible'}
  </span>
);

/* =====================================================
   UI STATES
===================================================== */

const SkeletonLab = () => (
  <div className="bg-white border rounded-xl p-4 animate-pulse space-y-4">
    <div className="h-5 bg-gray-200 rounded w-2/3" />
    <div className="h-4 bg-gray-200 rounded w-1/3" />
    <div className="space-y-2">
      <div className="h-3 bg-gray-200 rounded" />
      <div className="h-3 bg-gray-200 rounded" />
      <div className="h-3 bg-gray-200 rounded" />
    </div>
  </div>
);

const Empty = () => (
  <div className="col-span-full flex items-center justify-center">
    <p className="text-gray-400 text-sm">
      No hay reservas para esta fecha
    </p>
  </div>
);
