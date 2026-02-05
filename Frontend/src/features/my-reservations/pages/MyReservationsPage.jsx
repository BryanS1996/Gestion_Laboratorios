import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { useAuth } from "../../../hooks/useAuth";
import { useMyReservationsQuery } from "../hooks/useMyReservationsQuery";
import { useMyReservationsActions } from "../hooks/useMyReservationsActions";
import ReservationsMobileList from "../components/ReservationsMobileList";
import ReservationsDesktopTable from "../components/ReservationsDesktopTable";
import ReportModal from "../components/ReportModal";
import { toISODate } from "../../../shared/utils/dates";
import { Spinner } from "../../../shared/components";

export default function MyReservationsPage() {
  const { jwtToken } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const { data: reservations = [], isLoading, refetch } = useMyReservationsQuery(jwtToken);
  const { cancelReservation, payForReservation } = useMyReservationsActions(jwtToken);

  const [reportOpen, setReportOpen] = useState(false);
  const [selectedReserva, setSelectedReserva] = useState(null);

  // Toast after Stripe redirect
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    if (params.get("paid") === "1") {
      toast.success("✅ Reserva confirmada");
      refetch();
      navigate("/mis-reservas", { replace: true });
    }
  }, [location.search, navigate, refetch]);

  const onCancel = async (r) => {
    if (!confirm("¿Estás seguro de cancelar esta reserva?")) return;
    await cancelReservation(r.id);
  };

  const onPay = async (r) => {
    const t = toast.loading("Iniciando pago...");
    try {
      const payload = {
        laboratorioId: r.laboratorioId,
        laboratorioNombre: r.laboratorioNombre || r.laboratorioId,
        fecha: toISODate(r.fecha) || r.date,
        horaInicio: Number(r.horaInicio),
        horaFin: Number(r.horaFin),
      };
      const data = await payForReservation(payload);

      if (data?.status === "paid") {
        toast.success("Pago ya registrado ✅", { id: t });
        await refetch();
        return;
      }

      if (data?.url) {
        toast.success("Redirigiendo a Stripe...", { id: t });
        window.location.href = data.url;
        return;
      }

      toast.error("No se recibió URL de pago", { id: t });
    } catch (err) {
      toast.error(err.message || "Error iniciando el pago", { id: t });
    }
  };

  const onReport = (r) => {
    setSelectedReserva(r);
    setReportOpen(true);
  };

  const onReportSent = async () => refetch();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh] text-slate-600 gap-2">
        <Spinner />
        <span className="text-sm">Cargando reservas...</span>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4 md:p-8 bg-transparent">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-2xl md:text-3xl font-bold mb-6 text-slate-800">Mis Reservas</h1>

        <ReservationsMobileList
          reservations={reservations}
          onCancel={onCancel}
          onPay={onPay}
          onReport={onReport}
        />

        <ReservationsDesktopTable
          reservations={reservations}
          onCancel={onCancel}
          onPay={onPay}
          onReport={onReport}
        />
      </div>

      <ReportModal
        isOpen={reportOpen}
        onClose={() => setReportOpen(false)}
        jwtToken={jwtToken}
        reserva={selectedReserva}
        onReportSent={onReportSent}
      />
    </div>
  );
}
