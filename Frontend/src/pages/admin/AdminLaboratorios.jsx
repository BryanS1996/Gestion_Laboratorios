import { useEffect, useMemo, useState } from 'react';
import { DateTime } from 'luxon';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '../../hooks/useAuth';

import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

const ZONE = 'America/Guayaquil';
const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

/* =========================
   Utils
========================= */
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

const Empty = ({ label = 'No hay laboratorios para mostrar' }) => (
  <div className="col-span-full flex items-center justify-center">
    <p className="text-gray-400 text-sm">{label}</p>
  </div>
);

/* =========================
   Date range helpers
========================= */
const buildRange = (baseISO, mode) => {
  const base = DateTime.fromISO(String(baseISO), { zone: ZONE });
  if (!base.isValid) return null;

  if (mode === 'day') {
    const start = base.startOf('day');
    const end = start.plus({ days: 1 });
    return { start, end, label: start.toFormat('dd/LL/yyyy') };
  }

  if (mode === 'week') {
    // Luxon: startOf('week') depende de locale; si quieres Lunes fijo:
    const start = base.set({ weekday: 1 }).startOf('day'); // lunes
    const end = start.plus({ days: 7 });
    return {
      start,
      end,
      label: `${start.toFormat('dd/LL/yyyy')} - ${end.minus({ days: 1 }).toFormat('dd/LL/yyyy')}`,
    };
  }

  // month
  const start = base.startOf('month');
  const end = start.plus({ months: 1 });
  return {
    start,
    end,
    label: start.toFormat('LLLL yyyy'),
  };
};

/* =========================
   Component
========================= */
const AdminLaboratorios = () => {
  const { jwtToken } = useAuth();

  const [fecha, setFecha] = useState(DateTime.now().setZone(ZONE).toISODate());

  // 🔎 Search + 3s debounce skeleton
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [isSearchDebouncing, setIsSearchDebouncing] = useState(false);

  // ✅ Export mode
  const [exportMode, setExportMode] = useState('day'); // day | week | month

  useEffect(() => {
    if (!search.trim()) {
      setDebouncedSearch('');
      setIsSearchDebouncing(false);
      return;
    }
    setIsSearchDebouncing(true);
    const t = setTimeout(() => {
      setDebouncedSearch(search.trim());
      setIsSearchDebouncing(false);
    }, 3000);
    return () => clearTimeout(t);
  }, [search]);

  // 1) LABS BASE
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
      const res = await fetch(
        `${API_BASE}/admin/laboratorios/estado?fecha=${encodeURIComponent(fecha)}`,
        {
          headers: { Authorization: `Bearer ${jwtToken}` },
          cache: 'no-store',
        }
      );
      if (!res.ok) throw new Error('Error cargando estado de laboratorios');
      return res.json();
    },
    staleTime: 0,
    refetchInterval: 2000,
    refetchIntervalInBackground: true,
  });

  const isLoadingNetwork = labsQuery.isLoading || estadoQuery.isLoading;
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

  const laboratoriosFiltrados = useMemo(() => {
    const q = debouncedSearch.trim().toLowerCase();
    if (!q) return laboratorios;
    return laboratorios.filter((lab) => {
      const name = String(lab.nombre || '').toLowerCase();
      const id = String(lab.id || '').toLowerCase();
      return name.includes(q) || id.includes(q);
    });
  }, [laboratorios, debouncedSearch]);

  const showSkeleton = isLoadingNetwork || isSearchDebouncing;

  /* =========================
     Export PDF (Day/Week/Month)
     - Para semana/mes: necesitamos traer data por esos rangos.
     - Como tu endpoint /admin/laboratorios/estado solo acepta "fecha",
       aquí hacemos múltiples fetch (uno por día) y combinamos.
  ========================= */
  const exportarPDFReservas = async () => {
    const range = buildRange(fecha, exportMode);
    if (!range) return;

    // 🔥 Traer estado de múltiples días (si week/month)
    const days = [];
    let cursor = range.start;

    while (cursor < range.end) {
      days.push(cursor.toISODate());
      cursor = cursor.plus({ days: 1 });
    }

    // Fetch en paralelo (pero controlado)
    const headers = { Authorization: `Bearer ${jwtToken}` };

    const results = await Promise.all(
      days.map(async (d) => {
        const res = await fetch(
          `${API_BASE}/admin/laboratorios/estado?fecha=${encodeURIComponent(d)}`,
          { headers, cache: 'no-store' }
        );
        if (!res.ok) throw new Error(`Error cargando estado para ${d}`);
        const json = await res.json();
        return { dateISO: d, laboratorios: json?.laboratorios || [] };
      })
    );

    // Map baseLabs => nombre
    const baseMap = new Map(
      (labsQuery.data || []).map((lab) => {
        const id = lab.id || lab._id || lab.laboratorioId;
        const nombre = lab.nombre || lab.laboratorioNombre || 'Sin nombre';
        return [String(id), nombre];
      })
    );

    // Flatten rows: [Fecha, Lab, Usuario, Hora, Estado, Creada]
    const rows = [];
    for (const dayPack of results) {
      const dateLabel = DateTime.fromISO(dayPack.dateISO, { zone: ZONE }).toFormat('dd/LL/yyyy');

      for (const l of dayPack.laboratorios) {
        const labId = String(l.laboratorioId);
        const labName = baseMap.get(labId) || labId;

        const horarios = Array.isArray(l.horarios) ? l.horarios : [];
        for (const r of horarios) {
          rows.push([
            dateLabel,
            labName,
            r.userEmail || '—',
            fmtHoraBloque(r.horaInicio, r.horaFin),
            String(r.estado || '—'),
            r.createdAt ? fmtFechaHora(r.createdAt) : '—',
          ]);
        }
      }
    }

    // Ordenar por fecha luego hora
    rows.sort((a, b) => {
      // a[0] = dd/LL/yyyy
      const da = DateTime.fromFormat(a[0], 'dd/LL/yyyy', { zone: ZONE });
      const db = DateTime.fromFormat(b[0], 'dd/LL/yyyy', { zone: ZONE });
      if (da.toMillis() !== db.toMillis()) return da.toMillis() - db.toMillis();
      // hora a[3] = HH:mm-HH:mm
      return String(a[3]).localeCompare(String(b[3]));
    });

    const doc = new jsPDF({ orientation: 'landscape' });
    const pageWidth = doc.internal.pageSize.getWidth();

    doc.setFontSize(16);
    doc.text('Universidad Central del Ecuador', pageWidth / 2, 16, { align: 'center' });
    doc.setFontSize(12);
    doc.text('Listado de Reservas (Admin)', pageWidth / 2, 24, { align: 'center' });

    doc.setFontSize(10);
    doc.text(`Rango: ${range.label}`, 14, 34);
    doc.text(`Generado: ${DateTime.now().setZone(ZONE).toFormat('dd/LL/yyyy HH:mm')}`, 14, 40);

    autoTable(doc, {
      startY: 48,
      head: [['Fecha', 'Laboratorio', 'Usuario', 'Hora', 'Estado', 'Creada']],
      body: rows.length ? rows : [['—', '—', '—', '—', '—', '—']],
      styles: { fontSize: 8 },
      headStyles: { fillColor: [37, 99, 235], textColor: 255 },
      columnStyles: {
        0: { cellWidth: 28 },
        1: { cellWidth: 60 },
        2: { cellWidth: 65 },
        3: { cellWidth: 28 },
        4: { cellWidth: 30 },
        5: { cellWidth: 35 },
      },
    });

    const filename =
      exportMode === 'day'
        ? `reservas_${fecha}.pdf`
        : exportMode === 'week'
        ? `reservas_semana_${range.start.toISODate()}_${range.end.minus({ days: 1 }).toISODate()}.pdf`
        : `reservas_mes_${range.start.toFormat('yyyy-LL')}.pdf`;

    doc.save(filename);
  };

  if (error) return <p className="text-red-600">Error cargando laboratorios</p>;

  return (
    <div className="h-[calc(100vh-64px)] flex flex-col gap-4 overflow-hidden animate-fade-in">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">Laboratorios</h1>
          <p className="text-sm text-gray-500">Horarios reservados – {fecha}</p>
        </div>

        <div className="flex flex-col sm:flex-row gap-2 sm:items-center">
          {/* Search */}
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por nombre o ID (espera 3s)..."
            className="border rounded px-3 py-2 text-sm w-full sm:w-80"
          />

          {/* Date */}
          <input
            type="date"
            value={fecha}
            onChange={(e) => setFecha(e.target.value)}
            className="border rounded px-3 py-2 text-sm"
          />
        </div>
      </div>

      {/* Export controls */}
      <div className="flex flex-col md:flex-row md:items-center gap-3 bg-white border rounded-xl p-3">
        <div className="text-sm text-gray-600">
          Exportar reservas a PDF:
        </div>

        <div className="flex items-center gap-2">
          <select
            value={exportMode}
            onChange={(e) => setExportMode(e.target.value)}
            className="border rounded px-3 py-2 text-sm"
          >
            <option value="day">Por día</option>
            <option value="week">Por semana</option>
            <option value="month">Por mes</option>
          </select>

          <button
            onClick={exportarPDFReservas}
            disabled={!jwtToken}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-sm"
          >
            Exportar PDF
          </button>
        </div>

        <div className="md:ml-auto text-xs text-gray-500">
          Usa la fecha seleccionada como base del rango
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-2 xl:grid-cols-3 gap-4 flex-1 overflow-auto pr-2">
        {showSkeleton ? (
          <>
            <SkeletonLab />
            <SkeletonLab />
            <SkeletonLab />
            <SkeletonLab />
            <SkeletonLab />
            <SkeletonLab />
          </>
        ) : laboratoriosFiltrados.length === 0 ? (
          <Empty label={debouncedSearch ? 'No hay resultados para tu búsqueda' : 'No hay laboratorios para mostrar'} />
        ) : (
          laboratoriosFiltrados.map((lab) => <LabCard key={lab.id} lab={lab} />)
        )}
      </div>
    </div>
  );
};

export default AdminLaboratorios;
