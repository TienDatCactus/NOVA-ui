import { useQuery } from "@tanstack/react-query";
import { StaffPayrollService } from "~/services/api/staff/staff-payroll";
import type { PayrollGridParams } from "~/services/api/staff/staff-payroll/dto";

export function usePayrollsQuery(params?: PayrollGridParams) {
  return useQuery({
    queryKey: ["payrolls", params?.year, params?.month],
    queryFn: async () => await StaffPayrollService.getPayrollGrid(params),
    enabled: Boolean(params?.year && params?.month), // Only run when year and month are available
    staleTime: 0, // Always refetch when params change
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  });
}
