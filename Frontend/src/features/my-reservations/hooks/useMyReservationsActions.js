import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { reservasService } from "../../../services/reservas.service";
import { stripeService } from "../../../services/stripe.service";

export function useMyReservationsActions(jwtToken) {
  const qc = useQueryClient();

  const cancelMutation = useMutation({
    mutationFn: async (id) => {
      await reservasService.cancel(jwtToken, id);
    },
    onSuccess: async () => {
      toast.success("Reserva cancelada");
      await qc.invalidateQueries({ queryKey: ["my-reservations"] });
    },
    onError: (e) => toast.error(e.message || "Error al cancelar"),
  });

  const payMutation = useMutation({
    mutationFn: async (payload) => {
      return stripeService.checkout(jwtToken, payload);
    },
    onError: (e) => toast.error(e.message || "Error iniciando el pago"),
  });

  return {
    cancelReservation: (id) => cancelMutation.mutateAsync(id),
    payForReservation: (payload) => payMutation.mutateAsync(payload),
    cancelling: cancelMutation.isPending,
    paying: payMutation.isPending,
  };
}
