import { useQuery } from "@tanstack/react-query";
import { StaffRoleService } from "~/services/api/staff-role";

/**
 * Hook để lấy danh sách vai trò nhân sự
 */
export function useStaffRoleList() {
  return useQuery({
    queryKey: ["staff-roles"],
    queryFn: async () => await StaffRoleService.getStaffRoleList(),
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    refetchOnMount: false,
  });
}
