// src/pages/PagoExitoso.jsx
import { useEffect, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import toast from "react-hot-toast";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

export default function PagoExitoso() {
  const { jwtToken, loading } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const ranRef = useRef(false);

  useEffect(() => {
    if (ranRef.current) return;

    const run = async () => {
      const params = new URLSearchParams(location.search);
      const sessionId = params.get("session_id");

      if (!sessionId) {
        toast.error("Missing session_id");
        navigate("/catalogo", { replace: true });
        return;
      }

      // Wait until auth finishes (important right after returning from Stripe)
      if (loading) return;

      // If there is no jwtToken, send user to login but keep return path
      if (!jwtToken) {
        navigate(`/login`, { replace: true, state: { from: location.pathname + location.search } });
        return;
      }

      ranRef.current = true;

      const t = toast.loading("Verificando pago...");

      try {
        const res = await fetch(`${API_URL}/stripe/verify?session_id=${encodeURIComponent(sessionId)}`, {
          headers: { Authorization: `Bearer ${jwtToken}` },
        });

        const data = await res.json();
        if (!res.ok) throw new Error(data?.error || "Verify failed");

        if (data.status === "confirmed") {
          toast.success("✅ Pago confirmado. Reserva lista.", { id: t });

          // Redirect to MyReservations with paid=1 so it shows the success toast too
          const reservaId = data.reservaId || "";
          navigate(`/mis-reservas?paid=1${reservaId ? `&reservaId=${reservaId}` : ""}`, {
            replace: true,
          });
          return;
        }

        // pending (rare, but possible)
        toast("Pago aún pendiente. Reintentando...", { id: t });

        // Small retry once
        setTimeout(() => {
          navigate(`/pago-exitoso?session_id=${encodeURIComponent(sessionId)}`, { replace: true });
        }, 1500);
      } catch (err) {
        console.error(err);
        toast.error(err.message || "Error verificando el pago", { id: t });
        navigate("/mis-reservas", { replace: true });
      }
    };

    run();
  }, [jwtToken, loading, location.pathname, location.search, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-slate-50">
      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-6 max-w-md w-full text-center">
        <div className="text-2xl font-bold text-slate-900">Procesando pago…</div>
        <p className="mt-2 text-sm text-slate-500">
          Estamos verificando tu transacción con Stripe y confirmando la reserva.
        </p>
        <div className="mt-6 text-sm text-slate-400">No cierres esta ventana.</div>
      </div>
    </div>
  );
}
