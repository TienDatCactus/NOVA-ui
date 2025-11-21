import { useQuery } from "@tanstack/react-query";
import { StaffShiftService } from "~/services/api/staff/staff-shift";
import { WorkShiftService } from "~/services/api/staff/work-shift";
import type { StaffShiftListParams } from "~/services/api/staff/staff-shift/staff-shift.type";

// GET /api/StaffShifts - Query hook for staff shift list
export function useStaffShiftList(params?: StaffShiftListParams) {
  return useQuery({
    queryKey: ["staff-shifts", params],
    queryFn: async () => await StaffShiftService.getStaffShiftList(params),
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    refetchOnMount: false,
  });
}

// GET /api/WorkShifts - Query hook for work shift list
export function useWorkShiftList() {
  return useQuery({
    queryKey: ["work-shifts"],
    queryFn: async () => await WorkShiftService.getWorkShiftList(),
    staleTime: 10 * 60 * 1000, // 10 minutes (work shifts change less frequently)
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    refetchOnMount: false,
  });
}

// GET /api/WorkShifts/active - Query hook for active work shift list only
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
