import { useState, useEffect, useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import ReservationModal from '../components/ReservationModal';
import { useAuth } from '../hooks/useAuth';
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
  CheckCircle2,
} from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const Catalog = () => {
  const { user, loading, logout, jwtToken } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [modalOpen, setModalOpen] = useState(false);
  const [selectedLab, setSelectedLab] = useState(null);
  const [labs, setLabs] = useState([]);

  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('Todos');
  const [fecha, setFecha] = useState(() => new Date().toISOString().split('T')[0]);

  // ✅ Para mostrar notificación verde si se reservó correctamente
  const [showSuccess, setShowSuccess] = useState(
    location.state?.reservationCreated || false
  );

  useEffect(() => {
    const loadLabs = async () => {
      if (!jwtToken) return;
      try {
        const res = await fetch(`${API_URL}/laboratorios`, {
          headers: { Authorization: `Bearer ${jwtToken}` },
        });
        const data = await res.json();
        const list = Array.isArray(data) ? data : (data.laboratorios || []);
        setLabs(list);
      } catch (e) {
        console.error('Error cargando laboratorios:', e.message);
        setLabs([]);
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

  // ✅ NUEVA FUNCIÓN: Maneja el pago premium para limpiar el JSX
  const handlePremiumPayment = async (lab) => {
    if (!confirm('💳 Este laboratorio es premium y requiere pago. ¿Deseas continuar al pago?')) {
      return;
    }

    try {
      // NOTA: Aquí asumo horas fijas (7-9) por tu ejemplo anterior.
      // Lo ideal sería abrir un modal para elegir horas ANTES de pagar.
      const res = await fetch(`${API_URL}/stripe/create-checkout-session`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${jwtToken}`,
        },
        body: JSON.stringify({
          laboratorioId: lab.id,
          fecha,
          horaInicio: 7, 
          horaFin: 9,
          motivo: 'Reserva premium',
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Error iniciando pago');
      
      if (data.url) {
        window.location.href = data.url; // 🔁 Redirigir a Stripe Checkout
      } else {
        alert('❌ No se recibió URL de pago');
      }
    } catch (error) {
      alert(`❌ Error al iniciar pago: ${error.message}`);
    }
  };

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

      setModalOpen(false);
      navigate('/mis-reservas', {
        state: {
          reservationCreated: true,
          reservationData: data.reserva || reservationData,
        },
      });
    } catch (e) {
      alert(`❌ ${e.message}`);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center text-slate-600">
        Cargando...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* ✅ Barra de navegación */}
      <header className="sticky top-0 z-10 bg-white/90 backdrop-blur border-b border-slate-200">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center gap-4">
          <div className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold">FI</div>
          
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
        {/* ✅ Mensaje de éxito */}
        {showSuccess && (
          <div className="mb-4 p-4 rounded-xl bg-green-100 border border-green-300 text-green-800 flex items-center gap-2">
            <CheckCircle2 className="text-green-600" />
            <span>Reserva realizada con éxito</span>
            <button onClick={() => setShowSuccess(false)} className="ml-auto text-green-700 font-bold">✕</button>
          </div>
        )}

        {/* Filtros */}
        <div className="flex flex-col md:flex-row md:items-end gap-4">
          <div className="flex items-center gap-2">
            <Filter size={18} className="text-slate-400" />
            <label className="text-xs font-semibold text-slate-500">Tipo</label>
          </div>
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="w-full md:w-56 px-3 py-2 rounded-xl border border-slate-200 bg-white"
          >
            {tipos.map((t) => <option key={t} value={t}>{t}</option>)}
          </select>
          <div className="flex items-center gap-2 md:ml-6">
            <CalendarDays size={18} className="text-slate-400" />
            <label className="text-xs font-semibold text-slate-500">Fecha</label>
          </div>
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
          <div className="md:ml-auto text-sm text-slate-500">
            Mostrando <span className="font-semibold text-slate-700">{filteredLabs.length}</span> de{' '}
            <span className="font-semibold text-slate-700">{labs.length}</span> laboratorios
          </div>
        </div>

        {/* Tarjetas de laboratorios */}
        <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredLabs.map((lab) => {
            const Icon = getLabIcon(lab);
            const { ocupado, label } = normalizeEstado(lab);
            const esPremium = lab.tipoAcceso === 'premium';

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
                    <div>
                      <h3 className="font-bold text-slate-800 leading-tight">{lab.nombre}</h3>
                      {esPremium && (
                        <span className="mt-1 inline-flex items-center text-xs font-semibold px-2 py-1 rounded bg-yellow-100 text-yellow-800">
                          Premium 🔒
                        </span>
                      )}
                    </div>
                    <span
                      className={`inline-flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded-md ${
                        !ocupado
                          ? 'bg-green-50 text-green-700 ring-1 ring-green-200'
                          : 'bg-red-50 text-red-700 ring-1 ring-red-200'
                      }`}
                    >
                      <span className={`w-2 h-2 rounded-full ${!ocupado ? 'bg-green-500' : 'bg-red-500'}`} />
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
                    <button
                      onClick={() => openModalFor(lab)}
                      className="flex items-center gap-2 text-sm text-slate-500 hover:text-slate-800"
                    >
                      <Clock size={16} className="text-slate-400" />
                      Ver Horario
                    </button>
                  </div>

                  <button
                    onClick={() => {
                      if (esPremium) {
                        handlePremiumPayment(lab);
                      } else {
                        handleReserveClick(lab);
                      }
                    }}
                    disabled={ocupado}
                    className={`mt-5 w-full px-4 py-2 rounded-xl font-semibold text-sm transition-colors ${
                      !ocupado
                        ? (esPremium ? 'bg-yellow-600 hover:bg-yellow-700' : 'bg-blue-600 hover:bg-blue-700') + ' text-white'
                        : 'bg-slate-200 text-slate-500 cursor-not-allowed'
                    }`}
                  >
                    {esPremium ? 'Reservar Premium' : 'Reservar'}
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