import { useMemo } from "react";
import { useStaffRoleFilters } from "./filter.hooks";
import { useStaffRoleList } from "./query.hooks";

export function useStaffRoleContainer() {
  const { filters, handleFilterChange, handleResetFilters } =
    useStaffRoleFilters();

  const { data, isPending, isError, error, refetch } = useStaffRoleList();

  // Client-side filtering
  const filteredStaffRoles = useMemo(() => {
    if (!data?.data) return [];

    const searchLower = filters.search.toLowerCase().trim();

    return data.data.filter((role) => {
      if (searchLower) {
        const matchesName = role.name.toLowerCase().includes(searchLower);
        const matchesCode = role.code.toLowerCase().includes(searchLower);
        const matchesDescription = role.description
          ?.toLowerCase()
          .includes(searchLower);
        return matchesName || matchesCode || matchesDescription;
      }
      return true;
    });
  }, [data, filters.search]);

  return {
    staffRoles: filteredStaffRoles,
    totalStaffRoles: filteredStaffRoles.length,
    filters,
    isPending,
    isError,
    error,
    refetch,
    onFilterChange: handleFilterChange,
    onResetFilters: handleResetFilters,
  };
}
