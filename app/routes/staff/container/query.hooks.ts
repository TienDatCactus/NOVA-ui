import { useQuery } from "@tanstack/react-query";
import { StaffService } from "~/services/api/staff";
import type { StaffListParams } from "~/services/api/staff/staff.types";

/**
 * Hook to fetch staff list
 */
export function useStaffList(params?: StaffListParams) {
  return useQuery({
    queryKey: ["staffs", params],
    queryFn: async () => await StaffService.getStaffList(params),
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    refetchOnMount: false,
  });
}

/**
 * Hook to fetch staff detail by ID
 */
export function useStaffDetail(id: string | undefined) {
  return useQuery({
    queryKey: ["staff", id],
    queryFn: async () => {
      if (!id) throw new Error("Staff ID is required");
      return await StaffService.getStaffById(id);
    },
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
  });
}
