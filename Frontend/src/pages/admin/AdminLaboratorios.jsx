import { useState } from 'react';
import { useAdminLaboratorios } from '../../hooks/useAdminLaboratorios';
import { DateTime } from 'luxon';

const ZONE = 'America/Guayaquil';

/* =========================
   Helpers Luxon
========================= */
const toDT = (value) => {
  if (!value) return null;

  // Firestore timestamp tipo {_seconds: ...} o {seconds: ...}
  const seconds = value._seconds ?? value.seconds;
  if (seconds) return DateTime.fromSeconds(seconds, { zone: 'utc' }).setZone(ZONE);

  // Timestamp con toDate()
  if (typeof value?.toDate === 'function') {
    return DateTime.fromJSDate(value.toDate()).setZone(ZONE);
  }

  // JS Date
  if (value instanceof Date) {
    return DateTime.fromJSDate(value).setZone(ZONE);
  }

  // string (YYYY-MM-DD o ISO)
  if (typeof value === 'string') {
    const dt = DateTime.fromISO(value, { zone: ZONE });
    return dt.isValid ? dt : null;
  }

  return null;
};

const fmtFecha = (value) => {
  const dt = toDT(value);
  return dt ? dt.toFormat('dd/LL/yyyy') : '—';
};

const fmtHoraBloque = (horaInicio, horaFin) => {
  if (horaInicio == null || horaFin == null) return '—';
  const hi = DateTime.fromObject(
    { hour: Number(horaInicio), minute: 0 },
    { zone: ZONE }
  ).toFormat('HH:mm');
  const hf = DateTime.fromObject(
    { hour: Number(horaFin), minute: 0 },
    { zone: ZONE }
  ).toFormat('HH:mm');
  return `${hi}-${hf}`;
};

const fmtFechaHora = (value) => {
  const dt = toDT(value);
  return dt ? dt.toFormat('dd/LL/yyyy HH:mm') : '—';
};

/* =====================================================
   PAGE
===================================================== */
const AdminLaboratorios = () => {
  // ✅ Fecha "hoy" en Ecuador (evita el bug de ayer)
  const [fecha, setFecha] = useState(
    DateTime.now().setZone(ZONE).toISODate()
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
            Horarios reservados – {fmtFecha(fecha)}
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

        {lab.horarios?.length === 0 ? (
          <p className="text-xs text-gray-400">
            Sin reservas
          </p>
        ) : (
          <div className="grid grid-cols-2 gap-2">
            {lab.horarios?.map((r, i) => (
              <div
                key={i}
                className="text-xs border rounded-md p-2 bg-gray-50"
              >
                {/* ✅ Hora exacta en bloque HH:mm-HH:mm */}
                <p className="font-medium">
                  {fmtHoraBloque(r.horaInicio, r.horaFin)}
                </p>

                <p className="text-gray-400 truncate">
                  {r.userEmail || '—'}
                </p>

                <p className="text-[10px] capitalize text-gray-500">
                  {r.estado}
                </p>

                {/* ✅ (Opcional) si tu backend manda createdAt */}
                {r.createdAt && (
                  <p className="text-[10px] text-gray-400 mt-1">
                    Creada: {fmtFechaHora(r.createdAt)}
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* FOOTER */}
      <div className="mt-3 text-xs text-gray-500">
        Total reservas: {lab.horarios?.length || 0}
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
