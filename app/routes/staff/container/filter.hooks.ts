import { useState, useMemo } from "react";

export interface StaffFilters {
  searchText: string;
  staffRoleIds?: string[];
}

const DEFAULT_FILTERS: StaffFilters = {
  searchText: "",
  staffRoleIds: [],
};

export function useStaffFilters() {
  const [filters, setFilters] = useState<StaffFilters>(DEFAULT_FILTERS);

  const handleFilterChange = <K extends keyof StaffFilters>(
    key: K,
    value: StaffFilters[K]
  ) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const handleResetFilters = () => {
    setFilters(DEFAULT_FILTERS);
  };

  // Convert filters to API params
  const apiParams = useMemo(() => {
    const params: { code?: string; fullName?: string } = {};

    const searchText = filters.searchText.trim();
    if (searchText) {
      // API có thể support search theo cả code và fullName
      // Nếu search text giống format code (chỉ chữ/số, không dấu), search theo code
      // Ngược lại search theo fullName (tên có thể có dấu, khoảng trắng)
      if (/^[A-Z0-9]+$/i.test(searchText)) {
        params.code = searchText;
      } else {
        // Tìm theo tên (contains)
        params.fullName = searchText;
      }
    }
    return params;
  }, [filters.searchText]);

  // Client-side filtering for additional filters (if needed)
  const clientFilters = useMemo(() => {
    return {
      searchText: filters.searchText.toLowerCase().trim(),
    };
  }, [filters.searchText]);

  return {
    filters,
    apiParams,
    clientFilters,
    handleFilterChange,
    handleResetFilters,
  };
}
