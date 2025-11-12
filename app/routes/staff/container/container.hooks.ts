import { useMemo } from "react";
import { useStaffFilters } from "./filter.hooks";
import { useStaffList } from "./query.hooks";
import type { StaffListItem } from "~/services/api/staff/dto";

export function useStaffContainer() {
  const {
    filters,
    apiParams,
    clientFilters,
    handleFilterChange,
    handleResetFilters,
  } = useStaffFilters();

  const { data, isPending, isError, error, refetch } = useStaffList(apiParams);

  // Client-side filtering for search text
  const filteredStaffs = useMemo(() => {
    if (!data) return [];

    let result: StaffListItem[] = data; // API returns array directly

    // Search filter (client-side)
    if (clientFilters.searchText) {
      result = result.filter((staff) => {
        const searchText = clientFilters.searchText;
        return (
          staff.code.toLowerCase().includes(searchText) ||
          staff.fullName.toLowerCase().includes(searchText) ||
          staff.position.toLowerCase().includes(searchText) ||
          staff.department.toLowerCase().includes(searchText)
        );
      });
    }

    return result;
  }, [data, clientFilters.searchText]);

  return {
    staffs: filteredStaffs,
    totalStaffs: filteredStaffs.length,
    filters,
    isPending,
    isError,
    error,
    refetch,
    onFilterChange: handleFilterChange,
    onResetFilters: handleResetFilters,
  };
}
