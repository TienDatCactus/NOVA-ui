import { useQuery } from "@tanstack/react-query";
import { FinancesService } from "~/services/api/finances";
import type { FinancialReportsListParams } from "~/services/api/finances/finances.types";

export function useFinancialDashboard(
  params?: FinancialReportsListParams,
  options?: { enabled?: boolean }
) {
  return useQuery({
    queryKey: [
      "financial-dashboard",
      params?.PeriodType,
      params?.StartDate,
      params?.EndDate,
    ],
    queryFn: async () => {
      const queryParams: FinancialReportsListParams = params || {
        PeriodType: "ThisMonth", // Most common for SME
        IncludeTrend: true,
        TrendDays: 7, // Changed from 14 to 7
      };
      return await FinancesService.getFinancialReport(queryParams);
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false,
    enabled: options?.enabled,
  });
}
