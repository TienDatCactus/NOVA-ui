import { useState } from "react";
import type { UserItem } from "~/services/api/user/dto";

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

  // Derived value for API params (if needed in future)
  const includeInactive = filters.statusFilter !== "active";

  const updateFilter = <K extends keyof UserFilters>(
    key: K,
    value: UserFilters[K]
  ) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const resetFilters = () => {
    setFilters(DEFAULT_FILTERS);
  };

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

      // Role filter (client-side)
      const matchesRole =
        filters.roleFilter === "all" || user.roles.includes(filters.roleFilter);

      return matchesSearch && matchesStatus && matchesRole;
    });
  };

  return {
    filters,
    updateFilter,
    resetFilters,
    filterUsers,
    includeInactive,
  };
}

export default useUserFilters;
