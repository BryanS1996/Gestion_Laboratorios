import { useState, useEffect, useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import ReservationModal from '../components/ReservationModal';
import { useAuth } from '../hooks/useAuth';
import toast, { Toaster } from 'react-hot-toast'; 
import {
  Filter,
  CalendarDays,
  Monitor,
  Network,
  FlaskConical,
  Users as UsersIcon,
  MapPin,
  Clock,
  CreditCard
} from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const Catalog = () => {
  const { user, loading, jwtToken, isStudent, isProfessor } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [modalOpen, setModalOpen] = useState(false);
  const [selectedLab, setSelectedLab] = useState(null);
  const [labs, setLabs] = useState([]);
  
  const [reservasDelDia, setReservasDelDia] = useState([]);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('Todos');
  const [fecha, setFecha] = useState(() => new Date().toISOString().split('T')[0]);

  // 1. Cargar Laboratorios
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
        toast.error('Error al cargar laboratorios');
      }
    };
    loadLabs();
  }, [jwtToken]);

  // ✅ 2. Cargar Reservas (FILTRO ROBUSTO PARA CORREGIR "DISPONIBLE")
  useEffect(() => {
    const cargarReservasFecha = async () => {
      if (!jwtToken) return;
      try {
        const res = await fetch(`${API_URL}/reservas`, { 
          headers: { Authorization: `Bearer ${jwtToken}` } 
        });
        const data = await res.json();
        const listaReservas = data.reservas || [];
        
        // --- AQUÍ ESTÁ LA CORRECCIÓN DE DISPONIBILIDAD ---
        // Este filtro revisa si la fecha coincide, sin importar si es texto o Timestamp
        const delDia = listaReservas.filter(r => {
            if (!r.fecha) return false;
            
            // Caso A: El backend ya lo manda arreglado como texto "2026-01-20"
            if (typeof r.fecha === 'string') {
              return r.fecha.startsWith(fecha);
            } 
            
            // Caso B: El backend manda objeto Firebase {_seconds: ...}
            if (r.fecha._seconds) {
               // Convertimos a fecha JS
               const dateObj = new Date(r.fecha._seconds * 1000);
               // Obtenemos YYYY-MM-DD en UTC (formato estándar)
               const fechaUTC = dateObj.toISOString().split('T')[0];
               // Obtenemos YYYY-MM-DD Local por si acaso
               const fechaLocal = dateObj.toLocaleDateString('en-CA'); // Formato ISO local

               return fechaUTC === fecha || fechaLocal === fecha;
            }
            return false;
        });
        
        setReservasDelDia(delDia);
      } catch (error) {
        console.error("Error cargando reservas:", error);
      }
    };
    cargarReservasFecha();
  }, [fecha, jwtToken]);

  // Detectar retorno de pago cancelado
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    if (params.get('payment') === 'cancelled') {
      toast.error('El proceso de pago fue cancelado.', { duration: 5000 });
      // Limpiamos la URL
      navigate('/catalogo', { replace: true });
    }
  }, [location, navigate]);

  // Filtros
  const tipos = useMemo(() => {
    const set = new Set(['Todos']);
    labs.forEach((l) => { if (l.tipo) set.add(l.tipo); });
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

  // ✅ 3. Lógica "Agotado" (Suma de horas)
  const normalizeEstado = (lab) => {
    const HORAS_TOTALES_DIA = 10; 
    const labIdActual = String(lab.id || lab._id);

    const reservasEsteLab = reservasDelDia.filter(r => {
      const resLabId = String(r.laboratorioId);
      const esActiva = r.estado !== 'cancelada';
      return resLabId === labIdActual && esActiva;
    });

    const horasOcupadas = reservasEsteLab.reduce((total, r) => {
      const inicio = parseInt(r.horaInicio);
      const fin = parseInt(r.horaFin);
      return total + (fin - inicio);
    }, 0);

    const estaLleno = horasOcupadas >= HORAS_TOTALES_DIA;
    const estadoStr = String(lab.estado || '').toLowerCase();
    
    if (estadoStr === 'mantenimiento') return { ocupado: true, label: 'Mantenimiento', color: 'red' };
    if (estadoStr === 'ocupado') return { ocupado: true, label: 'Ocupado', color: 'red' };
    if (estaLleno) return { ocupado: true, label: 'Agotado', color: 'red' };

    return { ocupado: false, label: 'Disponible', color: 'green' };
  };

  const openModalFor = (lab) => {
    setSelectedLab(lab);
    setModalOpen(true);
  };

  const handleOpenReservationModal = (lab) => {
    const canReserve = user?.role === 'student' || user?.role === 'professor';
    if (!canReserve) {
      toast.error('No tienes permisos para reservar.');
      return;
    }
    openModalFor(lab);
  };

  // --- LÓGICA DE PAGOS ---
  const processPremiumPayment = async (reservationData, toastId) => {
    toast.dismiss(toastId); 
    const loadingToast = toast.loading('Iniciando pasarela de pago...');

    try {
      const res = await fetch(`${API_URL}/stripe/create-checkout-session`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${jwtToken}`,
        },
        body: JSON.stringify({
          laboratorioId: selectedLab.id,
          laboratorioNombre: selectedLab.nombre,
          fecha: reservationData.fecha,
          horaInicio: reservationData.horaInicio,
          horaFin: reservationData.horaFin,
          precio: 5.00,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        if (res.status === 409) {
          throw new Error(data.error || 'Ese horario ya está reservado.');
        }
        throw new Error(data.error || 'Error creando reserva');
      }
      
      if (data.url) {
        toast.success('Redirigiendo a Stripe...', { id: loadingToast });
        setTimeout(() => {
           window.location.href = data.url;
        }, 1000);
      } else {
        toast.error('No se recibió la URL de pago', { id: loadingToast });
      }
    } catch (error) {
      toast.error(`Error: ${error.message}`, { id: loadingToast });
    }
  };

  const processStandardReservation = async (reservationData) => {
    const loadingToast = toast.loading('Procesando reserva...');

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

      // Calculamos si hubo cancelaciones (propio de la prioridad profesor)
      const cancelledCount = Array.isArray(data.cancelled) ? data.cancelled.length : 0;

      if (isProfessor && cancelledCount > 0) {
        toast.success(`✅ Reserva confirmada. Se cancelaron ${cancelledCount} reserva(s) de estudiante por prioridad.`, { id: loadingToast });
      } else {
        toast.success('✅ Reserva confirmada.', { id: loadingToast });
      }

      navigate('/mis-reservas', {
        state: {
          reservationCreated: true,
          reservationData: data, 
        },
      });

    } catch (e) {
      toast.error(e.message, { id: loadingToast });
    }
  };
  // Manejador del botón del Modal
  const handleReserve = (reservationData) => {
    const isPremium = selectedLab?.tipoAcceso === 'premium' || selectedLab?.tipoAcceso === 'Premium';

    if (isPremium) {
      toast((t) => (
        <div className="flex flex-col gap-2 min-w-[300px]">
          <div className="flex items-start gap-3">
             <div className="bg-blue-100 p-2 rounded-full text-blue-600">
                <CreditCard size={24} />
             </div>
             <div>
                <h3 className="font-bold text-gray-900">Laboratorio Premium</h3>
                <p className="text-sm text-gray-500 mt-1">
                  Esta reserva requiere un pago de <strong>$5.00</strong>. 
                  ¿Deseas continuar a la pasarela de pago?
                </p>
             </div>
          </div>
          <div className="flex gap-2 mt-4 justify-end">
            <button
              onClick={() => toast.dismiss(t.id)}
              className="px-3 py-1.5 text-sm font-medium text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            >
              Cancelar
            </button>
            <button
              onClick={() => processPremiumPayment(reservationData, t.id)}
              className="px-3 py-1.5 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm transition-colors"
            >
              Sí, ir a Pagar
            </button>
          </div>
        </div>
      ), {
        duration: Infinity,
        position: 'top-center',
        style: {
           background: '#fff',
           padding: '16px',
           borderRadius: '12px',
           boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
           border: '1px solid #e5e7eb'
        }
      });
    } else {
      processStandardReservation(reservationData);
    }
  };

  if (loading) return <div className="flex justify-center p-10">Cargando...</div>;

  return (
    <div 
      className="min-h-screen flex flex-col p-4 relative z-10 animate-moveBg"
      style={{
        backgroundColor: "#d3b11d", 
        backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 304 304' width='304' height='304'%3E%3Cpath fill='%230066ec' fill-opacity='0.4' d='M44.1 224a5 5 0 1 1 0 2H0v-2h44.1zm160 48a5 5 0 1 1 0 2H82v-2h122.1zm57.8-46a5 5 0 1 1 0-2H304v2h-42.1zm0 16a5 5 0 1 1 0-2H304v2h-42.1zm6.2-114a5 5 0 1 1 0 2h-86.2a5 5 0 1 1 0-2h86.2zm-256-48a5 5 0 1 1 0 2H0v-2h12.1zm185.8 34a5 5 0 1 1 0-2h86.2a5 5 0 1 1 0 2h-86.2zM258 12.1a5 5 0 1 1-2 0V0h2v12.1zm-64 208a5 5 0 1 1-2 0v-54.2a5 5 0 1 1 2 0v54.2zm48-198.2V80h62v2h-64V21.9a5 5 0 1 1 2 0zm16 16V64h46v2h-48V37.9a5 5 0 1 1 2 0zm-128 96V208h16v12.1a5 5 0 1 1-2 0V210h-16v-76.1a5 5 0 1 1 2 0zm-5.9-21.9a5 5 0 1 1 0 2H114v48H85.9a5 5 0 1 1 0-2H112v-48h12.1zm-6.2 130a5 5 0 1 1 0-2H176v-74.1a5 5 0 1 1 2 0V242h-60.1zm-16-64a5 5 0 1 1 0-2H114v48h10.1a5 5 0 1 1 0 2H112v-48h-10.1zM66 284.1a5 5 0 1 1-2 0V274H50v30h-2v-32h18v12.1zM236.1 176a5 5 0 1 1 0 2H226v94h48v32h-2v-30h-48v-98h12.1zm25.8-30a5 5 0 1 1 0-2H274v44.1a5 5 0 1 1-2 0V146h-10.1zm-64 96a5 5 0 1 1 0-2H208v-80h16v-14h-42.1a5 5 0 1 1 0-2H226v18h-16v80h-12.1zm86.2-210a5 5 0 1 1 0 2H272V0h2v32h10.1zM98 101.9V146H53.9a5 5 0 1 1 0-2H96v-42.1a5 5 0 1 1 2 0zM53.9 34a5 5 0 1 1 0-2H80V0h2v34H53.9zm60.1 3.9V66H82v64H69.9a5 5 0 1 1 0-2H80V64h32V37.9a5 5 0 1 1 2 0zM101.9 82a5 5 0 1 1 0-2H128V37.9a5 5 0 1 1 2 0V82h-28.1zm16-64a5 5 0 1 1 0-2H146v44.1a5 5 0 1 1-2 0V18h-26.1zm102.2 270a5 5 0 1 1 0 2H98v14h-2v-16h124.1zM242 149.9V160h16v34h-16v62h48v48h-2v-46h-48v-66h16v-30h-16v-12.1a5 5 0 1 1 2 0zM53.9 18a5 5 0 1 1 0-2H64V2H48V0h18v18H53.9zm112 32a5 5 0 1 1 0-2H192V0h50v2h-48v48h-28.1zm-48-48a5 5 0 0 1-9.8-2h2.07a3 3 0 1 0 5.66 0H178v34h-18V21.9a5 5 0 1 1 2 0V32h14V2h-58.1zm0 96a5 5 0 1 1 0-2H137l32-32h39V21.9a5 5 0 1 1 2 0V66h-40.17l-32 32H117.9zm28.1 90.1a5 5 0 1 1-2 0v-76.51L175.59 80H224V21.9a5 5 0 1 1 2 0V82h-49.59L146 112.41v75.69zm16 32a5 5 0 1 1-2 0v-99.51L184.59 96H300.1a5 5 0 0 1 3.9-3.9v2.07a3 3 0 0 0 0 5.66v2.07a5 5 0 0 1-3.9-3.9H185.41L162 121.41v98.69zm-144-64a5 5 0 1 1-2 0v-3.51l48-48V48h32V0h2v50H66v55.41l-48 48v2.69zM50 53.9v43.51l-48 48V208h26.1a5 5 0 1 1 0 2H0v-65.41l48-48V53.9a5 5 0 1 1 2 0zm-16 16V89.41l-34 34v-2.82l32-32V69.9a5 5 0 1 1 2 0zM12.1 32a5 5 0 1 1 0 2H9.41L0 43.41V40.6L8.59 32h3.51zm265.8 18a5 5 0 1 1 0-2h18.69l7.41-7.41v2.82L297.41 50H277.9zm-16 160a5 5 0 1 1 0-2H288v-71.41l16-16v2.82l-14 14V210h-28.1zm-208 32a5 5 0 1 1 0-2H64v-22.59L40.59 194H21.9a5 5 0 1 1 0-2H41.41L66 216.59V242H53.9zm150.2 14a5 5 0 1 1 0 2H96v-56.6L56.6 162H37.9a5 5 0 1 1 0-2h19.5L98 200.6V256h106.1zm-150.2 2a5 5 0 1 1 0-2H80v-46.59L48.59 178H21.9a5 5 0 1 1 0-2H49.41L82 208.59V258H53.9zM34 39.8v1.61L9.41 66H0v-2h8.59L32 40.59V0h2v39.8zM2 300.1a5 5 0 0 1 3.9 3.9H3.83A3 3 0 0 0 0 302.17V256h18v48h-2v-46H2v42.1zM34 241v63h-2v-62H0v-2h34v1zM17 18H0v-2h16V0h2v18h-1zm273-2h14v2h-16V0h2v16zm-32 273v15h-2v-14h-14v14h-2v-16h18v1zM0 92.1A5.02 5.02 0 0 1 6 97a5 5 0 0 1-6 4.9v-2.07a3 3 0 1 0 0-5.66V92.1zM80 272h2v32h-2v-32zm37.9 32h-2.07a3 3 0 0 0-5.66 0h-2.07a5 5 0 0 1 9.8 0zM5.9 0A5.02 5.02 0 0 1 0 5.9V3.83A3 3 0 0 0 3.83 0H5.9zm294.2 0h2.07A3 3 0 0 0 304 3.83V5.9a5 5 0 0 1-3.9-5.9zm3.9 300.1v2.07a3 3 0 0 0-1.83 1.83h-2.07a5 5 0 0 1 3.9-3.9zM97 100a3 3 0 1 0 0-6 3 3 0 0 0 0 6zm0-16a3 3 0 1 0 0-6 3 3 0 0 0 0 6zm16 16a3 3 0 1 0 0-6 3 3 0 0 0 0 6zm16 16a3 3 0 1 0 0-6 3 3 0 0 0 0 6zm0 16a3 3 0 1 0 0-6 3 3 0 0 0 0 6zm-48 32a3 3 0 1 0 0-6 3 3 0 0 0 0 6zm16 16a3 3 0 1 0 0-6 3 3 0 0 0 0 6zm32 48a3 3 0 1 0 0-6 3 3 0 0 0 0 6zm-16 16a3 3 0 1 0 0-6 3 3 0 0 0 0 6zm32-16a3 3 0 1 0 0-6 3 3 0 0 0 0 6zm0-32a3 3 0 1 0 0-6 3 3 0 0 0 0 6zm16 32a3 3 0 1 0 0-6 3 3 0 0 0 0 6zm32 16a3 3 0 1 0 0-6 3 3 0 0 0 0 6zm0-16a3 3 0 1 0 0-6 3 3 0 0 0 0 6zm-16-64a3 3 0 1 0 0-6 3 3 0 0 0 0 6zm16 0a3 3 0 1 0 0-6 3 3 0 0 0 0 6zm16 96a3 3 0 1 0 0-6 3 3 0 0 0 0 6zm0 16a3 3 0 1 0 0-6 3 3 0 0 0 0 6zm16 16a3 3 0 1 0 0-6 3 3 0 0 0 0 6zm16-144a3 3 0 1 0 0-6 3 3 0 0 0 0 6zm0 32a3 3 0 1 0 0-6 3 3 0 0 0 0 6zm16-32a3 3 0 1 0 0-6 3 3 0 0 0 0 6zm16-16a3 3 0 1 0 0-6 3 3 0 0 0 0 6zm-96 0a3 3 0 1 0 0-6 3 3 0 0 0 0 6zm0 16a3 3 0 1 0 0-6 3 3 0 0 0 0 6zm16-32a3 3 0 1 0 0-6 3 3 0 0 0 0 6zm96 0a3 3 0 1 0 0-6 3 3 0 0 0 0 6zm-16-64a3 3 0 1 0 0-6 3 3 0 0 0 0 6zm16-16a3 3 0 1 0 0-6 3 3 0 0 0 0 6zm-32 0a3 3 0 1 0 0-6 3 3 0 0 0 0 6zm0-16a3 3 0 1 0 0-6 3 3 0 0 0 0 6zm-16 0a3 3 0 1 0 0-6 3 3 0 0 0 0 6zm-16 0a3 3 0 1 0 0-6 3 3 0 0 0 0 6zM49 36a3 3 0 1 0 0-6 3 3 0 0 0 0 6zm-32 0a3 3 0 1 0 0-6 3 3 0 0 0 0 6zm32 16a3 3 0 1 0 0-6 3 3 0 0 0 0 6zM33 68a3 3 0 1 0 0-6 3 3 0 0 0 0 6zm16-48a3 3 0 1 0 0-6 3 3 0 0 0 0 6zm0 240a3 3 0 1 0 0-6 3 3 0 0 0 0 6zm16 32a3 3 0 1 0 0-6 3 3 0 0 0 0 6zm-16-64a3 3 0 1 0 0-6 3 3 0 0 0 0 6zm0 16a3 3 0 1 0 0-6 3 3 0 0 0 0 6zm-16-32a3 3 0 1 0 0-6 3 3 0 0 0 0 6zm80-176a3 3 0 1 0 0-6 3 3 0 0 0 0 6zm16 0a3 3 0 1 0 0-6 3 3 0 0 0 0 6zm-16-16a3 3 0 1 0 0-6 3 3 0 0 0 0 6zm32 48a3 3 0 1 0 0-6 3 3 0 0 0 0 6zm16-16a3 3 0 1 0 0-6 3 3 0 0 0 0 6zm0-32a3 3 0 1 0 0-6 3 3 0 0 0 0 6zm112 176a3 3 0 1 0 0-6 3 3 0 0 0 0 6zm-16 16a3 3 0 1 0 0-6 3 3 0 0 0 0 6zm0 16a3 3 0 1 0 0-6 3 3 0 0 0 0 6zm0 16a3 3 0 1 0 0-6 3 3 0 0 0 0 6zM17 180a3 3 0 1 0 0-6 3 3 0 0 0 0 6zm0 16a3 3 0 1 0 0-6 3 3 0 0 0 0 6zm0-32a3 3 0 1 0 0-6 3 3 0 0 0 0 6zm16 0a3 3 0 1 0 0-6 3 3 0 0 0 0 6zM17 84a3 3 0 1 0 0-6 3 3 0 0 0 0 6zm32 64a3 3 0 1 0 0-6 3 3 0 0 0 0 6zm16-16a3 3 0 1 0 0-6 3 3 0 0 0 0 6z'%3E%3C/path%3E%3C/svg%3E")`,
        backgroundAttachment: "fixed",
        backgroundSize: "200px 200px", 
        backgroundRepeat: "repeat"
      }}
    >
      <Toaster position="top-center" reverseOrder={false} />

      {/* FILTROS */}
      <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200 mb-6 flex flex-col md:flex-row gap-4 items-center">
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

      {/* GRID DE LABORATORIOS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 auto-rows-fr">
        {filteredLabs.map((lab) => {
          const Icon = getLabIcon(lab);
          const { ocupado, label, color } = normalizeEstado(lab);
          const esPremium = lab.tipoAcceso === 'premium' || lab.tipoAcceso === 'Premium';
          const disabledBtn = isProfessor ? false : ocupado;

          return (
            <div
              key={lab.id}
              className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col h-full hover:shadow-md transition-shadow"
            >
              <div className="p-6 flex flex-col flex-1">
                
                <div className="flex justify-between items-start mb-4">
                  <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center">
                    <Icon size={26} />
                  </div>

                  <div className="flex flex-col items-end gap-2">
                    <span
                      className={`inline-flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded-md ${
                        color === 'red'
                          ? 'bg-red-50 text-red-700 ring-1 ring-red-200'
                          : 'bg-green-50 text-green-700 ring-1 ring-green-200'
                      }`}
                    >
                      <span className={`w-2 h-2 rounded-full ${color === 'red' ? 'bg-red-500' : 'bg-green-500'}`} />
                      {label}
                    </span>

                    {esPremium && (
                      <span className="inline-flex items-center text-xs font-semibold px-2 py-1 rounded bg-yellow-100 text-yellow-800 border border-yellow-200">
                        Premium 🔒
                      </span>
                    )}
                  </div>
                </div>

                <h3 className="font-bold text-slate-800 leading-tight text-lg mb-2">{lab.nombre}</h3>
                
                <p className="text-sm text-slate-500 mt-2 line-clamp-3 mb-4">
                  {lab.descripcion || 'Sin descripción'}
                </p>

                <div className="space-y-2 text-sm text-slate-600 mb-6">
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
                    className="flex items-center gap-2 text-sm text-slate-500 hover:text-slate-800 transition-colors"
                  >
                    <Clock size={16} className="text-slate-400" />
                    Ver Horario
                  </button>
                </div>

                <button
                  onClick={() => handleOpenReservationModal(lab)}
                  disabled={disabledBtn} // 👈 USA LA NUEVA VARIABLE
                  className={`mt-auto w-full px-4 py-3 rounded-xl font-semibold text-sm transition-all shadow-sm active:scale-95 ${
                    !disabledBtn // 👈 CAMBIA ESTO TAMBIÉN PARA EL COLOR
                      ? (esPremium 
                          ? 'bg-slate-900 hover:bg-slate-800 text-white shadow-slate-200' 
                          : 'bg-blue-600 hover:bg-blue-700 text-white shadow-blue-200')
                      : 'bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200'
                  }`}
                >
                  {ocupado 
                    ? (isProfessor ? 'Reservar (Prioridad)' : 'Agotado') // Opcional: Cambiar texto para el profe
                    : (esPremium ? 'Reservar Premium' : 'Reservar')
                  }
                </button>
              </div>
            </div>
          );
        })}
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