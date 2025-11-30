import { useMemo } from "react";
import type { StaffAttendanceListItem } from "~/services/api/staff/staff-attendance/dto";

/**
 * Creates a Map for fast attendance lookup by key: `${staffId}-${shiftId}-${workDate}`
 * Shared utility to avoid duplicating this logic in both view components
 */
export function useAttendanceMap(
  attendances: StaffAttendanceListItem[] | undefined
) {
  return useMemo(() => {
    const map = new Map<string, StaffAttendanceListItem>();
    (attendances || []).forEach((att) => {
      const key = `${att.staffId}-${att.shiftId}-${att.workDate}`;
      map.set(key, att);
    });
    return map;
  }, [attendances]);
}

/**
 * Helper to get attendance from the map
 */
export function getAttendanceFromMap(
  map: Map<string, StaffAttendanceListItem>,
  staffId: string,
  shiftId: string,
  workDate: string
): StaffAttendanceListItem | null {
  const key = `${staffId}-${shiftId}-${workDate}`;
  return map.get(key) || null;
}
