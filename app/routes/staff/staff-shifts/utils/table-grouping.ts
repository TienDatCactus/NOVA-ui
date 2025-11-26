import type {
  StaffShiftListItem,
  StaffShiftListResponseDto,
} from "~/services/api/staff/staff-shift/dto";
import type { WorkShiftListResponseDto } from "~/services/api/work-shift/dto";

/**
 * Groups shifts by date and shift name for calendar view
 * Structure: { "2025-11-27": { "Morning Shift": [shift1, shift2], ... }, ... }
 */
export function groupByDateAndShift(
  shifts: StaffShiftListResponseDto
): Record<string, Record<string, StaffShiftListItem[]>> {
  const grouped: Record<string, Record<string, StaffShiftListItem[]>> = {};

  (shifts || []).forEach((shift) => {
    const dateStr = shift.workDate;
    const shiftName = shift.shiftName || "unknown";

    if (!grouped[dateStr]) {
      grouped[dateStr] = {};
    }
    if (!grouped[dateStr][shiftName]) {
      grouped[dateStr][shiftName] = [];
    }
    grouped[dateStr][shiftName].push(shift);
  });

  return grouped;
}

/**
 * Groups shifts by staff ID for staff view
 * Only includes shifts with active work shifts
 * Structure: { "staffId1": [shift1, shift2], "staffId2": [...], ... }
 */
export function groupByStaff(
  shifts: StaffShiftListResponseDto,
  workShifts: WorkShiftListResponseDto
): Record<string, StaffShiftListItem[]> {
  const grouped: Record<string, StaffShiftListItem[]> = {};

  (shifts || []).forEach((shift) => {
    const workShift = (workShifts || []).find((ws) => ws.id === shift.shiftId);
    if (workShift?.active) {
      const key = shift.staffId;
      if (!grouped[key]) {
        grouped[key] = [];
      }
      grouped[key].push(shift);
    }
  });

  return grouped;
}

/**
 * Get unique staff list from grouped staff data
 */
export function getStaffListFromGrouped(
  groupedByStaff: Record<string, StaffShiftListItem[]>
): Array<{ staffId: string; staffName: string; staffCode: string }> {
  return Object.keys(groupedByStaff).map((staffId) => {
    const firstShift = groupedByStaff[staffId][0];
    return {
      staffId,
      staffName: firstShift.staffName || "N/A",
      staffCode: firstShift.staffId,
    };
  });
}
