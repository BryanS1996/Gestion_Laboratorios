import { useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuth } from '../../../hooks/useAuth';
import { stripeService } from '../../../services/stripe.service';

export function usePagoExitosoPage() {
  const { jwtToken, loading } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const ranRef = useRef(false);

  useEffect(() => {
    if (ranRef.current) return;

    const run = async () => {
      const params = new URLSearchParams(location.search);
      const sessionId = params.get('session_id');

      if (!sessionId) {
        toast.error('Missing session_id');
        navigate('/catalogo', { replace: true });
        return;
      }

      if (loading) return;
      if (!jwtToken) {
        navigate('/login', { replace: true, state: { from: location.pathname + location.search } });
        return;
      }

      ranRef.current = true;
      const t = toast.loading('Verificando pago...');
      try {
        const data = await stripeService.verify(jwtToken, sessionId);

        if (data?.status === 'confirmed') {
          toast.success('✅ Pago confirmado. Reserva lista.', { id: t });
          const reservaId = data?.reservaId || '';
          navigate(`/mis-reservas?paid=1${reservaId ? `&reservaId=${reservaId}` : ''}`, { replace: true });
          return;
        }

        toast('Pago aún pendiente. Reintentando...', { id: t });
        setTimeout(() => {
          navigate(`/pago-exitoso?session_id=${encodeURIComponent(sessionId)}`, { replace: true });
        }, 1500);
      } catch (err) {
        console.error(err);
        toast.error(err?.message || 'Error verificando el pago', { id: t });
        navigate('/mis-reservas', { replace: true });
      }
    };

    run();
  }, [jwtToken, loading, location.pathname, location.search, navigate]);
}
