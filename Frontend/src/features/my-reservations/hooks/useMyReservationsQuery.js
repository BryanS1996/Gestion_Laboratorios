import { useQuery } from "@tanstack/react-query";
import { reservasService } from "../../../services/reservas.service";
import { mapReservationForUI } from "../utils/mapReservations";

export function useMyReservationsQuery(jwtToken) {
  return useQuery({
    queryKey: ["my-reservations"],
    enabled: !!jwtToken,
    queryFn: async () => {
      const data = await reservasService.mine(jwtToken);
      const reservas = data?.reservas || [];
      return reservas.map(mapReservationForUI);
    },
  });
}
