import { useQuery } from "@tanstack/react-query";
import { FinancesService } from "~/services/api/finances";
import type { FinancialReportsListParams } from "~/services/api/finances/finances.types";

export function useFinancialDashboard(
  params?: FinancialReportsListParams,
  options?: { enabled?: boolean }
) {
  return useQuery({
    queryKey: ["financial-dashboard", params],
    queryFn: async () => {
      const queryParams: FinancialReportsListParams = params || {
        PeriodType: "Today",
        ComparisonType: "PreviousPeriod",
        IncludeTrend: true,
        TrendDays: 14,
      };
      return await FinancesService.getFinancialReport(queryParams);
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false,
    enabled: options?.enabled,
  });
}
