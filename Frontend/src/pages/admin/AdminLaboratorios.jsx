import { useMemo, useState } from 'react';
import { DateTime } from 'luxon';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '../../hooks/useAuth';

const ZONE = 'America/Guayaquil';
const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const fmtHoraBloque = (horaInicio, horaFin) => {
  if (horaInicio == null || horaFin == null) return '—';
  const hi = DateTime.fromObject({ hour: Number(horaInicio), minute: 0 }, { zone: ZONE }).toFormat('HH:mm');
  const hf = DateTime.fromObject({ hour: Number(horaFin), minute: 0 }, { zone: ZONE }).toFormat('HH:mm');
  return `${hi}-${hf}`;
};

const toDT = (value) => {
  if (!value) return null;
  const seconds = value._seconds ?? value.seconds;
  if (seconds) return DateTime.fromSeconds(seconds, { zone: 'utc' }).setZone(ZONE);
  if (typeof value?.toDate === 'function') return DateTime.fromJSDate(value.toDate()).setZone(ZONE);
  if (value instanceof Date) return DateTime.fromJSDate(value).setZone(ZONE);
  if (typeof value === 'string') {
    const dt = DateTime.fromISO(value, { zone: ZONE });
    return dt.isValid ? dt : null;
  }
  return null;
};

const fmtFechaHora = (value) => {
  const dt = toDT(value);
  return dt ? dt.toFormat('dd/LL/yyyy HH:mm') : '—';
};

const StatusBadge = ({ ocupado }) => (
  <span
    className={`px-2 py-1 text-xs rounded-full font-medium
      ${ocupado ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-600'}`}
  >
    {ocupado ? 'Ocupado' : 'Disponible'}
  </span>
);

const LabCard = ({ lab }) => {
  return (
    <div className="bg-white border rounded-xl p-4 flex flex-col justify-between transition-all hover:shadow-md">
      <div className="flex items-start justify-between mb-3">
        <div>
          <h2 className="font-semibold text-lg">{lab.nombre}</h2>
          <p className="text-xs text-gray-500">{lab.id}</p>
        </div>
        <StatusBadge ocupado={lab.ocupado} />
      </div>

      <div className="flex-1">
        <p className="text-sm font-medium mb-2">Horarios reservados</p>

        {lab.horarios.length === 0 ? (
          <p className="text-xs text-gray-400">Sin reservas</p>
        ) : (
          <div className="grid grid-cols-2 gap-2">
            {lab.horarios.map((r, i) => (
              <div key={i} className="text-xs border rounded-md p-2 bg-gray-50">
                <p className="font-medium">{fmtHoraBloque(r.horaInicio, r.horaFin)}</p>
                <p className="text-gray-400 truncate">{r.userEmail || '—'}</p>
                <p className="text-[10px] capitalize text-gray-500">{r.estado}</p>
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

      <div className="mt-3 text-xs text-gray-500">Total reservas: {lab.horarios.length}</div>
    </div>
  );
};

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
    <p className="text-gray-400 text-sm">No hay laboratorios para mostrar</p>
  </div>
);

const AdminLaboratorios = () => {
  const { jwtToken } = useAuth();

  const [fecha, setFecha] = useState(DateTime.now().setZone(ZONE).toISODate());

  // 1) LABS BASE: MISMO endpoint que usa el catálogo
  const labsQuery = useQuery({
    queryKey: ['labs-base'],
    enabled: !!jwtToken,
    queryFn: async () => {
      const res = await fetch(`${API_BASE}/laboratorios`, {
        headers: { Authorization: `Bearer ${jwtToken}` },
        cache: 'no-store',
      });
      const data = await res.json();
      return Array.isArray(data) ? data : (data.laboratorios || []);
    },
    staleTime: 0,
    refetchInterval: 4000,
    refetchIntervalInBackground: true,
  });

  // 2) ESTADO ADMIN (horarios por fecha)
  const estadoQuery = useQuery({
    queryKey: ['admin-labs-estado', fecha],
    enabled: !!jwtToken && !!fecha,
    queryFn: async () => {
      const res = await fetch(`${API_BASE}/admin/laboratorios/estado?fecha=${encodeURIComponent(fecha)}`, {
        headers: { Authorization: `Bearer ${jwtToken}` },
        cache: 'no-store',
      });
      if (!res.ok) throw new Error('Error cargando estado de laboratorios');
      return res.json();
    },
    staleTime: 0,
    refetchInterval: 2000,
    refetchIntervalInBackground: true,
  });

  const isLoading = labsQuery.isLoading || estadoQuery.isLoading;
  const error = labsQuery.error || estadoQuery.error;

  const laboratorios = useMemo(() => {
    const baseLabs = labsQuery.data || [];
    const estadoLabs = estadoQuery.data?.laboratorios || [];

    const estadoMap = new Map(estadoLabs.map((x) => [x.laboratorioId, x]));

    return baseLabs.map((lab) => {
      const id = lab.id || lab._id || lab.laboratorioId;
      const estado = estadoMap.get(id);

      const horarios = Array.isArray(estado?.horarios) ? estado.horarios : [];
      const ocupado = horarios.some((r) => r.estado === 'confirmada' || r.estado === 'pendiente');

      return {
        id,
        nombre: lab.nombre || lab.laboratorioNombre || 'Sin nombre',
        ocupado,
        horarios: horarios.sort((a, b) => Number(a.horaInicio) - Number(b.horaInicio)),
      };
    });
  }, [labsQuery.data, estadoQuery.data]);

  if (error) return <p className="text-red-600">Error cargando laboratorios</p>;

  return (
    <div className="h-[calc(100vh-64px)] flex flex-col gap-4 overflow-hidden animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Laboratorios</h1>
          <p className="text-sm text-gray-500">Horarios reservados – {fecha}</p>
        </div>

        <input
          type="date"
          value={fecha}
          onChange={(e) => setFecha(e.target.value)}
          className="border rounded px-3 py-2 text-sm"
        />
      </div>

      <div className="grid grid-cols-2 xl:grid-cols-3 gap-4 flex-1 overflow-auto pr-2">
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
          laboratorios.map((lab) => <LabCard key={lab.id} lab={lab} />)
        )}
      </div>
    </div>
  );
};

export default AdminLaboratorios;
