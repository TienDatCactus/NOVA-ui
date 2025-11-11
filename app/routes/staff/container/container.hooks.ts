import { useMemo } from "react";
import { useStaffFilters } from "./filter.hooks";
import { useStaffList } from "./query.hooks";

export function useStaffContainer() {
  const {
    filters,
    apiParams,
    clientFilters,
    handleFilterChange,
    handleResetFilters,
  } = useStaffFilters();

  const { data, isPending, isError, error, refetch } = useStaffList(apiParams);

  // Filter ở frontend
  const filteredStaffs = useMemo(() => {
    if (!data?.data) return [];

    let result = data.data;

    // Filter by staff roles (client-side)
    if (filters.staffRoleIds && filters.staffRoleIds.length > 0) {
      result = result.filter((staff) =>
        staff.staffRoleId
          ? filters.staffRoleIds!.includes(staff.staffRoleId)
          : false
      );
    }

    return result;
  }, [data, filters.staffRoleIds]);

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
