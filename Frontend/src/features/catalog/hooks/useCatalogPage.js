import { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { DateTime } from 'luxon';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '../../../hooks/useAuth';
import { laboratoriosService } from '../../../services/laboratorios.service';
import { reservasService } from '../../../services/reservas.service';
import { stripeService } from '../../../services/stripe.service';
import { ZONE } from '../../../config/env';
import { toISODate } from '../../../shared/utils/dates';
import { getLabStatus, isPremiumLab } from '../utils/labStatus';

export function useCatalogPage() {
  const { user, loading: authLoading, jwtToken, isStudent, isProfessor } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const [modalOpen, setModalOpen] = useState(false);
  const [selectedLab, setSelectedLab] = useState(null);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('Todos');
  const [fecha, setFecha] = useState(() => DateTime.now().setZone(ZONE).toISODate());

  // Detect return from canceled payment
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    if (params.get('payment') === 'cancelled') {
      toast.error('El proceso de pago fue cancelado.', { duration: 5000 });
      navigate('/catalogo', { replace: true });
    }
  }, [location.search, navigate]);

  const labsQuery = useQuery({
    queryKey: ['laboratorios', jwtToken],
    enabled: Boolean(jwtToken),
    queryFn: async () => {
      const data = await laboratoriosService.list(jwtToken);
      return Array.isArray(data) ? data : (data?.laboratorios || []);
    },
  });

  const reservasQuery = useQuery({
    queryKey: ['reservas', jwtToken],
    enabled: Boolean(jwtToken),
    queryFn: async () => {
      const data = await reservasService.list(jwtToken);
      return data?.reservas || [];
    },
  });

  const labs = labsQuery.data || [];

  const reservasDelDia = useMemo(() => {
    const all = reservasQuery.data || [];
    const target = fecha;
    return all.filter((r) => {
      const iso = toISODate(r?.fecha);
      return iso === target;
    });
  }, [reservasQuery.data, fecha]);

  const tipos = useMemo(() => {
    const set = new Set(['Todos']);
    labs.forEach((l) => { if (l?.tipo) set.add(l.tipo); });
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

  const openReservation = (lab) => {
    setSelectedLab(lab);
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setSelectedLab(null);
  };

  const reserve = async (payload, lab) => {
    if (!jwtToken) {
      toast.error('Debes iniciar sesión');
      navigate('/login');
      return;
    }

    // If admin (or not student/professor), prevent booking
    const role = user?.role;
    if (role === 'admin') {
      toast.error('Un administrador no puede reservar.');
      return;
    }

    const premium = isPremiumLab(lab);
    if (premium) {
      // Premium confirmation
      const ok = window.confirm('Este laboratorio es Premium y requiere pago. ¿Deseas continuar?');
      if (!ok) return;

      const t = toast.loading('Redirigiendo a pago...');
      try {
        const data = await stripeService.checkout(jwtToken, payload);
        const url = data?.url;
        if (!url) throw new Error('No se recibió URL de pago');
        toast.dismiss(t);
        window.location.href = url;
      } catch (e) {
        toast.error(e.message || 'Error iniciando pago', { id: t });
      }
      return;
    }

    const t = toast.loading('Creando reserva...');
    try {
      await reservasService.create(jwtToken, payload);
      toast.success('Reserva creada ✅', { id: t });
      closeModal();
      navigate('/mis-reservas');
    } catch (e) {
      toast.error(e.message || 'Error creando reserva', { id: t });
    }
  };

  const getStatus = (lab) => getLabStatus(lab, reservasDelDia);

  const isLoading = authLoading || labsQuery.isLoading || reservasQuery.isLoading;
  const error = labsQuery.error || reservasQuery.error;

  return {
    state: { search, typeFilter, fecha, modalOpen, selectedLab },
    data: { labs, reservasDelDia, tipos, filteredLabs },
    flags: { isLoading, error, isStudent, isProfessor, jwtToken, authLoading },
    actions: {
      setSearch,
      setTypeFilter,
      setFecha,
      openReservation,
      closeModal,
      reserve,
      getStatus,
    },
  };
}
