import { useQuery } from "@tanstack/react-query";
import { ReportsService } from "~/services/api/reports";

function useReports(date: string) {
  return useQuery({
    queryKey: ["reservation-reports", date],
    queryFn: async () => await ReportsService.getReservationReports(date),
  });
}
export default useReports;
