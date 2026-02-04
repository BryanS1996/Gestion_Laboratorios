import { useQuery } from "@tanstack/react-query";
import { reportesService } from "../../../services/reportes.service";

export function useMisReportesQuery(jwtToken) {
  return useQuery({
    queryKey: ["mis-reportes"],
    enabled: !!jwtToken,
    queryFn: async () => {
      const data = await reportesService.mine(jwtToken);
      // backend returns { data: [] }
      return data?.data || [];
    },
  });
}
