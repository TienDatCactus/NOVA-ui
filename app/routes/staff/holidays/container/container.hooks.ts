import { useState, useMemo } from "react";
import { useHolidayList } from "./query.hooks";
import { useHolidayFilter } from "./filter.hooks";
import type { HolidayListItem } from "~/services/api/holiday/dto";

export function useHolidaysContainer() {
  const { data, isPending, refetch } = useHolidayList();
  const { filterState, updateFilter, resetFilter } = useHolidayFilter();

  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [updateDialogOpen, setUpdateDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedHoliday, setSelectedHoliday] =
    useState<HolidayListItem | null>(null);

  // Extract holidays from response data
  const holidays = useMemo(() => {
    return data || [];
  }, [data]);

  // Apply filters
  const filteredHolidays = useMemo(() => {
    let result = [...holidays];

    // Search filter
    if (filterState.search) {
      const searchLower = filterState.search.toLowerCase();
      result = result.filter((holiday) =>
        holiday.name.toLowerCase().includes(searchLower)
      );
    }

    return result;
  }, [holidays, filterState]);

  const handleCreateSuccess = () => {
    refetch();
  };

  const handleUpdateSuccess = () => {
    refetch();
  };

  const handleDeleteSuccess = () => {
    refetch();
  };

  const openUpdateDialog = (holiday: HolidayListItem) => {
    setSelectedHoliday(holiday);
    setUpdateDialogOpen(true);
  };

  const openDeleteDialog = (holiday: HolidayListItem) => {
    setSelectedHoliday(holiday);
    setDeleteDialogOpen(true);
  };

  return {
    // Data
    holidays: filteredHolidays,
    isPending,

    // Dialogs
    createDialogOpen,
    setCreateDialogOpen,
    updateDialogOpen,
    setUpdateDialogOpen,
    deleteDialogOpen,
    setDeleteDialogOpen,
    selectedHoliday,

    // Actions
    handleCreateSuccess,
    handleUpdateSuccess,
    handleDeleteSuccess,
    openUpdateDialog,
    openDeleteDialog,

    // Filters
    filterState,
    updateFilter,
    resetFilter,
  };
}
