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
  // Chỉ cần trả về data từ API
  const filteredStaffs = useMemo(() => {
    if (!data?.data) return [];
    return data.data;
  }, [data]);

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
