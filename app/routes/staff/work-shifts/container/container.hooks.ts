import { useMemo, useState } from "react";
import { useWorkShiftList } from "./query.hooks";
import { useWorkShiftFilter } from "./filter.hooks";
import type { WorkShiftListItem } from "~/services/api/staff/work-shift/dto";

export default function useWorkShiftsContainer() {
  const { data, isPending, isError, error, refetch } = useWorkShiftList();
  const { filters, updateFilter, resetFilters } = useWorkShiftFilter();
  const [createDialogOpen, setCreateDialogOpen] = useState(false);

  // Filter work shifts based on filters
  const filteredWorkShifts = useMemo(() => {
    if (!data) return [];

    let result: WorkShiftListItem[] = data;

    // Filter by search query (code or name)
    if (filters.searchQuery.trim()) {
      const query = filters.searchQuery.toLowerCase().trim();
      result = result.filter(
        (shift) =>
          shift.code.toLowerCase().includes(query) ||
          shift.name.toLowerCase().includes(query)
      );
    }

    // Filter by active status
    if (filters.isActive === "active") {
      result = result.filter((shift) => shift.active === true);
    } else if (filters.isActive === "inactive") {
      result = result.filter((shift) => shift.active === false);
    }

    return result;
  }, [data, filters]);

  // Calculate stats
  const stats = useMemo(() => {
    if (!data) {
      return { total: 0, active: 0, inactive: 0 };
    }

    const total = data.length;
    const active = data.filter((shift) => shift.active).length;
    const inactive = total - active;

    return { total, active, inactive };
  }, [data]);

  return {
    workShifts: filteredWorkShifts,
    isPending,
    isError,
    error,
    refetch,
    filters,
    updateFilter,
    resetFilters,
    stats,
    createDialogOpen,
    setCreateDialogOpen,
  };
}
