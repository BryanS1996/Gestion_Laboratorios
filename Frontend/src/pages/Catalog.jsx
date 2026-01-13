import { useState, useEffect, useMemo } from 'react';
import ReservationModal from '../components/ReservationModal';
import { useAuth } from '../hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import {
  Search,
  CalendarDays,
  Filter,
  Monitor,
  Network,
  FlaskConical,
  Users as UsersIcon,
  MapPin,
  Clock,
  LogOut,
} from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const Catalog = () => {
  const { user, loading, logout, jwtToken } = useAuth();
  const navigate = useNavigate();

  const [modalOpen, setModalOpen] = useState(false);
  const [selectedLab, setSelectedLab] = useState(null);
  const [labs, setLabs] = useState([]);

  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('Todos');
  const [fecha, setFecha] = useState(() => new Date().toISOString().split('T')[0]);

  useEffect(() => {
    const loadLabs = async () => {
      if (!jwtToken) return;
      try {
        const res = await fetch(`${API_URL}/laboratorios`, {
          headers: { Authorization: `Bearer ${jwtToken}` },
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Error cargando laboratorios');

        // Soporta ambas respuestas: array directo o { laboratorios: [...] }
        const list = Array.isArray(data) ? data : (data.laboratorios || []);
        setLabs(list);
      } catch (e) {
        // Fallback a labs simulados si Firestore aún no tiene datos
        setLabs([
          {
            id: 'lab-computacion-a',
            nombre: 'Laboratorio de Computación A',
            tipo: 'Computación',
            estado: 'Disponible',
            descripcion: 'Equipos modernos para desarrollo de software.',
            capacidad: 30,
            ubicacion: 'PC 8th Edificio, Monterosa 2F',
          },
          {
            id: 'lab-redes-b',
            nombre: 'Laboratorio de Redes B',
            tipo: 'Redes',
            estado: 'Disponible',
            descripcion: 'Herramientas para configuración de redes.',
            capacidad: 20,
            ubicacion: 'Bloque B, Sótano',
          },
          {
            id: 'lab-quimica',
            nombre: 'Laboratorio de Química',
            tipo: 'Química',
            estado: 'Ocupado',
            descripcion: 'Equipamiento para prácticas de química.',
            capacidad: 25,
            ubicacion: 'Módulo C',
          },
        ]);
      }
    };
    loadLabs();
  }, [jwtToken]);

  const tipos = useMemo(() => {
    const set = new Set(['Todos']);
    labs.forEach((l) => {
      if (l.tipo) set.add(l.tipo);
    });
    return Array.from(set);
  }, [labs]);

  const filteredLabs = useMemo(() => {
    const q = search.trim().toLowerCase();
    return labs.filter((l) => {
      if (typeFilter !== 'Todos' && (l.tipo || 'Otros') !== typeFilter) return false;
      if (!q) return true;
      return (
        (l.nombre || '').toLowerCase().includes(q) ||
        (l.descripcion || '').toLowerCase().includes(q) ||
        (l.ubicacion || '').toLowerCase().includes(q)
      );
    });
  }, [labs, search, typeFilter]);

  const getLabIcon = (lab) => {
    const t = (lab.tipo || '').toLowerCase();
    const n = (lab.nombre || '').toLowerCase();
    if (t.includes('red') || n.includes('red')) return Network;
    if (t.includes('quim') || n.includes('quim')) return FlaskConical;
    return Monitor;
  };

  const normalizeEstado = (lab) => {
    const estado = String(lab.estado || 'Disponible').toLowerCase();
    // consideramos ocupado si coincide con "ocupado" o "no_disponible"
    const ocupado = estado === 'ocupado' || estado === 'no_disponible';
    return { ocupado, label: ocupado ? 'Ocupado' : 'Disponible' };
  };

  const openModalFor = (lab) => {
    setSelectedLab(lab);
    setModalOpen(true);
  };

  const handleReserveClick = (lab) => {
    if (user?.role !== 'student') {
      alert('Solo los estudiantes pueden hacer reservas.');
      return;
    }
    openModalFor(lab);
  };

  // --- AQUÍ ESTÁ EL CAMBIO PRINCIPAL ---
  const handleReserve = async (reservationData) => {
    try {
      const res = await fetch(`${API_URL}/reservas`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${jwtToken}`,
        },
        body: JSON.stringify(reservationData),
      });
      const data = await res.json();
      
      if (!res.ok) throw new Error(data.error || 'Error creando reserva');

      // 1. Cerramos el modal actual
      setModalOpen(false);

      // 2. Redirigimos a "Mis Reservas" pasando los datos de la reserva creada
      navigate('/mis-reservas', { 
        state: { 
          reservationCreated: true, 
          reservationData: reservationData // Enviamos los datos para mostrarlos en el modal verde
        } 
      });

    } catch (e) {
      alert(`❌ ${e.message}`);
      throw e;
    }
  };
  // -------------------------------------

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center text-slate-600">
        Cargando...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Top bar */}
      <header className="sticky top-0 z-10 bg-white/90 backdrop-blur border-b border-slate-200">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center gap-4">
          <div className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold">
            FI
          </div>

          <div className="min-w-[170px]">
            <p className="text-sm font-semibold text-slate-800">Facultad de Ingeniería</p>
            <p className="text-xs text-slate-400">Sistema de Laboratorios</p>
          </div>

          <div className="hidden md:flex items-center gap-2 flex-1">
            <div className="relative w-full max-w-xl">
              <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Buscar laboratorio..."
                className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-200"
              />
            </div>
          </div>

          {user?.role === 'student' && (
            <button
              onClick={() => navigate('/mis-reservas')}
              className="px-4 py-2 rounded-xl bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700"
            >
              Mis Reservas
            </button>
          )}

          <div className="flex items-center gap-3">
            <div className="text-right hidden sm:block">
              <p className="text-sm font-semibold text-slate-700">{user?.displayName || 'Usuario'}</p>
              <p className="text-xs text-slate-400 capitalize">{user?.role || ''}</p>
            </div>

            <button
              onClick={async () => {
                await logout();
                navigate('/login');
              }}
              className="p-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-600"
              title="Cerrar sesión"
            >
              <LogOut size={18} />
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-6 py-6">
        {/* Filters */}
        <div className="flex flex-col md:flex-row md:items-end gap-4">
          <div className="flex items-center gap-2">
            <Filter size={18} className="text-slate-400" />
            <label className="text-xs font-semibold text-slate-500">Tipo de Laboratorio</label>
          </div>

          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="w-full md:w-56 px-3 py-2 rounded-xl border border-slate-200 bg-white"
          >
            {tipos.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
            {!tipos.length && <option>Todos</option>}
          </select>

          <div className="flex items-center gap-2 md:ml-6">
            <CalendarDays size={18} className="text-slate-400" />
            <label className="text-xs font-semibold text-slate-500">Fecha</label>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="date"
              value={fecha}
              onChange={(e) => setFecha(e.target.value)}
              className="px-3 py-2 rounded-xl border border-slate-200 bg-white"
            />
            <button
              onClick={() => setFecha(new Date().toISOString().split('T')[0])}
              className="px-4 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-sm font-semibold"
            >
              Hoy
            </button>
          </div>

          <div className="md:ml-auto text-sm text-slate-500">
            Mostrando <span className="font-semibold text-slate-700">{filteredLabs.length}</span> de{' '}
            <span className="font-semibold text-slate-700">{labs.length}</span> laboratorios
          </div>
        </div>

        {/* Cards */}
        <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredLabs.map((lab) => {
            const Icon = getLabIcon(lab);
            const { ocupado, label } = normalizeEstado(lab);

            return (
              <div
                key={lab.id}
                className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden"
              >
                <div className="p-6">
                  <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mb-4">
                    <Icon size={26} />
                  </div>

                  <div className="flex items-start justify-between gap-3">
                    <h3 className="font-bold text-slate-800 leading-tight">{lab.nombre}</h3>

                    {/* Badge con punto (igual a la imagen) */}
                    <span
                      className={`inline-flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded-md ${
                        !ocupado
                          ? 'bg-green-50 text-green-700 ring-1 ring-green-200'
                          : 'bg-red-50 text-red-700 ring-1 ring-red-200'
                      }`}
                    >
                      <span
                        className={`w-2 h-2 rounded-full ${!ocupado ? 'bg-green-500' : 'bg-red-500'}`}
                      />
                      {label}
                    </span>
                  </div>

                  <p className="text-sm text-slate-500 mt-2 line-clamp-2">
                    {lab.descripcion || 'Sin descripción'}
                  </p>

                  <div className="mt-4 space-y-2 text-sm text-slate-600">
                    {lab.capacidad != null && (
                      <div className="flex items-center gap-2">
                        <UsersIcon size={16} className="text-slate-400" />
                        <span>Capacidad: {lab.capacidad} personas</span>
                      </div>
                    )}

                    {lab.ubicacion && (
                      <div className="flex items-center gap-2">
                        <MapPin size={16} className="text-slate-400" />
                        <span>{lab.ubicacion}</span>
                      </div>
                    )}

                    {/* Ver horario clickeable */}
                    <button
                      onClick={() => openModalFor(lab)}
                      className="flex items-center gap-2 text-sm text-slate-500 hover:text-slate-800"
                    >
                      <Clock size={16} className="text-slate-400" />
                      Ver Horario
                    </button>
                  </div>

                  <button
                    onClick={() => handleReserveClick(lab)}
                    disabled={ocupado}
                    className={`mt-5 w-full px-4 py-2 rounded-xl font-semibold text-sm transition-colors ${
                      !ocupado
                        ? 'bg-blue-600 text-white hover:bg-blue-700'
                        : 'bg-slate-200 text-slate-500 cursor-not-allowed'
                    }`}
                  >
                    Reservar
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <ReservationModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        lab={selectedLab}
        onReserve={handleReserve}
        jwtToken={jwtToken}
        defaultDate={fecha}
      />
    </div>
  );
};

export default Catalog;