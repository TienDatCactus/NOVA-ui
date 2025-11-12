import { useQuery } from "@tanstack/react-query";
import { ReportsService } from "~/services/api/reports";

function useReports(fromDate: string, toDate: string) {
  return useQuery({
    queryKey: ["reservation-reports", fromDate, toDate],
    queryFn: async () =>
      await ReportsService.getReservationReports(fromDate, toDate),
    enabled: Boolean(fromDate && toDate),
  });
}
export default useReports;
