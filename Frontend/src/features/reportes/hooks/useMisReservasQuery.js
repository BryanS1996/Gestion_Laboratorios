import { useQuery } from "@tanstack/react-query";
import { reservasService } from "../../../services/reservas.service";

export function useMisReservasQuery(jwtToken) {
  return useQuery({
    queryKey: ["mis-reservas-raw"],
    enabled: !!jwtToken,
    queryFn: async () => {
      const data = await reservasService.mine(jwtToken);
      return data?.reservas || [];
    },
  });
}
