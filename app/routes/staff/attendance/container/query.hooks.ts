import { useQuery } from "@tanstack/react-query";
import { StaffAttendanceService } from "~/services/api/staff-attendance";
import { WorkShiftService } from "~/services/api/work-shift";
import type { StaffAttendanceListParams } from "~/services/api/staff-attendance/staff-attendance.type";

/**
 * Hook to fetch staff attendance list
 */
export function useStaffAttendances(params?: StaffAttendanceListParams) {
  return useQuery({
    queryKey: ["staff-attendances", params],
    queryFn: async () =>
      await StaffAttendanceService.getStaffAttendanceList(params || {}),
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    refetchOnMount: false,
  });
}

/**
 * Hook to fetch active work shifts list for attendance calendar
 */
export function useActiveWorkShiftList() {
  return useQuery({
    queryKey: ["work-shifts-active"],
    queryFn: async () => await WorkShiftService.getActiveWorkShiftList(),
    staleTime: 10 * 60 * 1000, // 10 minutes (work shifts change less frequently)
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    refetchOnMount: false,
  });
}
