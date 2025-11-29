import { useState } from "react";
import type { UserItem } from "~/services/api/user/dto";

export interface UserFilters {
  roleFilter: string;
}

const DEFAULT_FILTERS: UserFilters = {
  roleFilter: "all",
};

function useUserFilters() {
  const [filters, setFilters] = useState<UserFilters>(DEFAULT_FILTERS);

  const updateFilter = <K extends keyof UserFilters>(
    key: K,
    value: UserFilters[K]
  ) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const resetFilters = () => {
    setFilters(DEFAULT_FILTERS);
  };

  return {
    filters,
    updateFilter,
    resetFilters,
  };
}

export default useUserFilters;
