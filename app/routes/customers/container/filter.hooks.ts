import { useState } from "react";
import type { CustomerItem } from "~/services/api/customer/dto";

export interface CustomerFilters {
  searchText: string;
  statusFilter: "all" | "active" | "locked";
  roleFilter: string;
}

const DEFAULT_FILTERS: CustomerFilters = {
  searchText: "",
  statusFilter: "all",
  roleFilter: "all",
};

function useCustomerFilters() {
  const [filters, setFilters] = useState<CustomerFilters>(DEFAULT_FILTERS);

  const updateFilter = <K extends keyof CustomerFilters>(
    key: K,
    value: CustomerFilters[K]
  ) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const resetFilters = () => {
    setFilters(DEFAULT_FILTERS);
  };

  const filterCustomers = (customers: CustomerItem[]) => {
    if (!customers) return [];

    return customers.filter((customer) => {
      // Search filter
      const matchesSearch =
        filters.searchText === "" ||
        customer.fullName
          .toLowerCase()
          .includes(filters.searchText.toLowerCase()) ||
        customer.email
          .toLowerCase()
          .includes(filters.searchText.toLowerCase()) ||
        customer.userName
          .toLowerCase()
          .includes(filters.searchText.toLowerCase());

      // Status filter
      const isLocked = customer.lockoutEnabled && customer.lockoutEnd;
      const matchesStatus =
        filters.statusFilter === "all" ||
        (filters.statusFilter === "active" && !isLocked) ||
        (filters.statusFilter === "locked" && isLocked);

      // Role filter
      const matchesRole =
        filters.roleFilter === "all" ||
        customer.roles.includes(filters.roleFilter);

      return matchesSearch && matchesStatus && matchesRole;
    });
  };

  return {
    filters,
    updateFilter,
    resetFilters,
    filterCustomers,
  };
}

export default useCustomerFilters;
