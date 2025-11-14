import { useState, useMemo } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { format, startOfWeek, addDays, addWeeks, subWeeks } from "date-fns";
import { vi } from "date-fns/locale";
import { useStaffAttendances } from "./query.hooks";
import { useAttendanceFilter } from "./filter.hooks";
import { StaffAttendanceService } from "~/services/api/staff-attendance";
import { toast } from "sonner";
import type { StaffAttendanceListItem } from "~/services/api/staff-attendance/dto";

export function useAttendanceContainer() {
  const queryClient = useQueryClient();
  // Week navigation
  const [currentWeekStart, setCurrentWeekStart] = useState(() =>
    startOfWeek(new Date(), { weekStartsOn: 1 })
  );

  const weekDays = useMemo(() => {
    return Array.from({ length: 7 }, (_, i) => addDays(currentWeekStart, i));
  }, [currentWeekStart]);

  const goToPreviousWeek = () =>
    setCurrentWeekStart((prev) => subWeeks(prev, 1));
  const goToNextWeek = () => setCurrentWeekStart((prev) => addWeeks(prev, 1));
  const goToToday = () =>
    setCurrentWeekStart(startOfWeek(new Date(), { weekStartsOn: 1 }));

  // Filter state
  const { filterState, setStaffFilter, setStatusFilter, clearAllFilters } =
    useAttendanceFilter();

  // Query params - apply filters correctly
  const queryParams = useMemo(() => {
    const params: Record<string, string> = {
      from: format(weekDays[0], "yyyy-MM-dd"),
      to: format(weekDays[6], "yyyy-MM-dd"),
    };

    // Don't pass empty filters to API
    // Let frontend filter handle multiple selections
    return params;
  }, [weekDays]);

  // Fetch attendance data
  const { data, isPending, refetch } = useStaffAttendances(queryParams);

  // Apply frontend filters
  const attendanceData = useMemo(() => {
    let filtered = data || [];

    // Filter by staff IDs
    if (filterState.selectedStaffIds.length > 0) {
      filtered = filtered.filter((item: StaffAttendanceListItem) =>
        filterState.selectedStaffIds.includes(item.staffId)
      );
    }

    // Filter by status
    if (filterState.selectedStatus.length > 0) {
      filtered = filtered.filter((item: StaffAttendanceListItem) =>
        filterState.selectedStatus.includes(item.status.toLowerCase())
      );
    }

    return filtered;
  }, [data, filterState.selectedStaffIds, filterState.selectedStatus]);

  // Mark absent dialog state
  const [markAbsentDialogOpen, setMarkAbsentDialogOpen] = useState(false);
  const [selectedAttendance, setSelectedAttendance] =
    useState<StaffAttendanceListItem | null>(null);

  const handleOpenMarkAbsentDialog = (attendance: StaffAttendanceListItem) => {
    setSelectedAttendance(attendance);
    setMarkAbsentDialogOpen(true);
  };

  const handleMarkAbsentSuccess = () => {
    refetch();
    queryClient.invalidateQueries({ queryKey: ["staff-shifts"] });
  };

  // Mark attendance dialog state
  const [markAttendanceDialogOpen, setMarkAttendanceDialogOpen] =
    useState(false);
  const [selectedAttendanceForMark, setSelectedAttendanceForMark] =
    useState<StaffAttendanceListItem | null>(null);

  const handleOpenMarkAttendanceDialog = (
    attendance: StaffAttendanceListItem
  ) => {
    setSelectedAttendanceForMark(attendance);
    setMarkAttendanceDialogOpen(true);
  };

  const handleMarkAttendanceSuccess = () => {
    refetch();
    // Also invalidate schedules if they depend on attendance status
    queryClient.invalidateQueries({ queryKey: ["staff-shifts"] });
  };

  const handleMarkPresent = async (attendance: StaffAttendanceListItem) => {
    if (!attendance?.id) return;
    try {
      await StaffAttendanceService.markPresent(attendance.id);
      toast.success("Đã chấm công thành công");
      refetch();
      // Also invalidate schedules if they depend on attendance status
      queryClient.invalidateQueries({ queryKey: ["staff-shifts"] });
    } catch (error) {
      // Error handled by http interceptor
    }
  };

  return {
    // Week navigation
    currentWeekStart,
    weekDays,
    goToPreviousWeek,
    goToNextWeek,
    goToToday,

    // Data
    attendanceData,
    isPending,
    refetch,

    // Filters
    filterState,
    setStaffFilter,
    setStatusFilter,
    clearAllFilters,

    // Mark absent dialog
    markAbsentDialogOpen,
    setMarkAbsentDialogOpen,
    selectedAttendance,
    handleOpenMarkAbsentDialog,
    handleMarkAbsentSuccess,
    handleMarkPresent,

    // Mark attendance dialog
    markAttendanceDialogOpen,
    setMarkAttendanceDialogOpen,
    selectedAttendanceForMark,
    handleOpenMarkAttendanceDialog,
    handleMarkAttendanceSuccess,
  };
}
