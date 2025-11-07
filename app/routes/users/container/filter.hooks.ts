import { useState, useMemo } from "react";
import type { UserItem } from "~/services/api/user/dto";
import type { GetUserListParams } from "~/services/api/user";

export interface UserFilters {
  searchText: string;
  statusFilter: "all" | "active" | "locked";
  roleFilter: string;
}

const DEFAULT_FILTERS: UserFilters = {
  searchText: "",
  statusFilter: "all",
  roleFilter: "all",
};

function useUserFilters() {
  const [filters, setFilters] = useState<UserFilters>(DEFAULT_FILTERS);

  // Convert filters to API params (server-side filtering)
  const apiParams: GetUserListParams = useMemo(() => {
    const params: GetUserListParams = {};

    // Only add role param if not "all"
    if (filters.roleFilter && filters.roleFilter !== "all") {
      params.role = filters.roleFilter;
    }

    return params;
  }, [filters.roleFilter]);

  const updateFilter = <K extends keyof UserFilters>(
    key: K,
    value: UserFilters[K]
  ) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const resetFilters = () => {
    setFilters(DEFAULT_FILTERS);
  };

  // Client-side filtering for search and status (since API doesn't support these yet)
  const filterUsers = (users: UserItem[]) => {
    if (!users) return [];

    return users.filter((user) => {
      // Search filter (client-side)
      const matchesSearch =
        filters.searchText === "" ||
        user.fullName
          .toLowerCase()
          .includes(filters.searchText.toLowerCase()) ||
        user.email.toLowerCase().includes(filters.searchText.toLowerCase()) ||
        user.userName.toLowerCase().includes(filters.searchText.toLowerCase());

      // Status filter (client-side)
      const isLocked = user.lockoutEnabled && user.lockoutEnd;
      const matchesStatus =
        filters.statusFilter === "all" ||
        (filters.statusFilter === "active" && !isLocked) ||
        (filters.statusFilter === "locked" && isLocked);

      return matchesSearch && matchesStatus;
    });
  };

  return {
    filters,
    apiParams,
    updateFilter,
    resetFilters,
    filterUsers,
  };
}

export default useUserFilters;
