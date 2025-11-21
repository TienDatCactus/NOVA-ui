import { useQueryClient } from "@tanstack/react-query";
import { endOfWeek, format, startOfWeek } from "date-fns";
import { useEffect, useMemo, useState } from "react";
import type { StaffShiftListItem } from "~/services/api/staff-shift/dto";
import { useScheduleExport } from "./export.hooks";
import { useScheduleFilter } from "./filter.hooks";
import { useActiveWorkShiftList, useStaffShiftList } from "./query.hooks";

export function useSchedulesContainer() {
  const queryClient = useQueryClient();
  const [currentWeekStart, setCurrentWeekStart] = useState<Date>(
    startOfWeek(new Date(), { weekStartsOn: 1 }) // Start from Monday
  );

  const weekEnd = endOfWeek(currentWeekStart, { weekStartsOn: 1 });
  const { filterState, updateFilter, resetFilter } = useScheduleFilter();
  const { isExporting, handleExportMatrix, handleExportForm2 } =
    useScheduleExport({
      currentWeekStart,
      weekEnd,
      selectedStaffId: filterState.selectedStaffId,
    });

  // Query params for API
  const queryParams = {
    from: format(currentWeekStart, "yyyy-MM-dd"),
    to: format(weekEnd, "yyyy-MM-dd"),
    ...(filterState.selectedStaffId && {
      staffId: filterState.selectedStaffId,
    }),
  };

  const { data, isPending, refetch } = useStaffShiftList(queryParams);
  const { data: workShifts, isPending: isWorkShiftsLoading } =
    useActiveWorkShiftList();

  // Refetch when staffId filter changes
  useEffect(() => {
    refetch();
  }, [filterState.selectedStaffId, refetch]);

  // Dialog states
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [updateDialogOpen, setUpdateDialogOpen] = useState(false);
  const [selectedShift, setSelectedShift] = useState<StaffShiftListItem | null>(
    null
  );

  // Filter shifts based on search and filters
  const filteredShifts = useMemo(() => {
    if (!data) return [];

    return data.filter((shift) => {
      const matchesSearch =
        !filterState.searchText ||
        (shift.staffName &&
          shift.staffName
            .toLowerCase()
            .includes(filterState.searchText.toLowerCase())) ||
        (shift.shiftName &&
          shift.shiftName
            .toLowerCase()
            .includes(filterState.searchText.toLowerCase()));

      // matchesStaff is now handled by API query params

      const matchesShift =
        filterState.selectedShiftIds.length === 0 ||
        (shift.shiftId && filterState.selectedShiftIds.includes(shift.shiftId));

      return matchesSearch && matchesShift;
    });
  }, [data, filterState]);

  // Success handlers
  const handleCreateSuccess = () => {
    setCreateDialogOpen(false);
    queryClient.invalidateQueries({ queryKey: ["staff-shifts"] });
    queryClient.invalidateQueries({ queryKey: ["staff-attendances"] });
  };

  const handleDeleteSuccess = () => {
    setSelectedShift(null);
    setDeleteDialogOpen(false);
    queryClient.invalidateQueries({ queryKey: ["staff-shifts"] });
    queryClient.invalidateQueries({ queryKey: ["staff-attendances"] });
  };

  const handleUpdateSuccess = () => {
    setSelectedShift(null);
    setUpdateDialogOpen(false);
    queryClient.invalidateQueries({ queryKey: ["staff-shifts"] });
    queryClient.invalidateQueries({ queryKey: ["staff-attendances"] });
  };

  // Dialog handlers
  const handleOpenDeleteDialog = (shift: StaffShiftListItem) => {
    setSelectedShift(shift);
    setDeleteDialogOpen(true);
  };

  const handleOpenUpdateDialog = (shift: StaffShiftListItem) => {
    setSelectedShift(shift);
    setUpdateDialogOpen(true);
  };

  // Navigation handlers
  const handlePrevWeek = () => {
    setCurrentWeekStart(
      (prev) => new Date(prev.getTime() - 7 * 24 * 60 * 60 * 1000)
    );
  };

  const handleNextWeek = () => {
    setCurrentWeekStart(
      (prev) => new Date(prev.getTime() + 7 * 24 * 60 * 60 * 1000)
    );
  };

  const handleToday = () => {
    setCurrentWeekStart(startOfWeek(new Date(), { weekStartsOn: 1 }));
  };

  return {
    shifts: filteredShifts,
    workShifts: workShifts || [],
    isPending: isPending || isWorkShiftsLoading,
    filterState,
    updateFilter,
    resetFilter,
    createDialogOpen,
    setCreateDialogOpen,
    deleteDialogOpen,
    setDeleteDialogOpen,
    updateDialogOpen,
    setUpdateDialogOpen,
    selectedShift,
    setSelectedShift,
    handleCreateSuccess,
    handleDeleteSuccess,
    handleUpdateSuccess,
    handleOpenDeleteDialog,
    handleOpenUpdateDialog,
    currentWeekStart,
    weekEnd,
    handlePrevWeek,
    handleNextWeek,
    handleToday,
    isExporting,
    handleExportMatrix,
    handleExportForm2,
  };
}
