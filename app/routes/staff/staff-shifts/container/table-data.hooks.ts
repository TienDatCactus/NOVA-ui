import { useMemo } from "react";
import type { StaffShiftListResponseDto } from "~/services/api/staff/staff-shift/dto";
import type { WorkShiftListResponseDto } from "~/services/api/work-shift/dto";
import { groupByDateAndShift, groupByStaff } from "../utils/table-grouping";

export function useScheduleTableData(
  shifts: StaffShiftListResponseDto,
  workShifts: WorkShiftListResponseDto,
  viewMode: "shift" | "staff"
) {
  return useMemo(() => {
    if (viewMode === "shift") {
      return { type: "shift" as const, data: groupByDateAndShift(shifts) };
    } else {
      return { type: "staff" as const, data: groupByStaff(shifts, workShifts) };
    }
  }, [shifts, workShifts, viewMode]);
}
