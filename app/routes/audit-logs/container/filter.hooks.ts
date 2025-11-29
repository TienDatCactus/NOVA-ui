import { useState } from "react";
import type { AuditListParams } from "~/services/api/audit/audit.types";

const defaultFilters: AuditListParams = {
  Page: 1,
  PageSize: 20,
  IsArchived: false,
};

export function useAuditFilters() {
  const [filters, setFilters] = useState<AuditListParams>(defaultFilters);

  const updateFilter = <K extends keyof AuditListParams>(
    key: K,
    value: AuditListParams[K]
  ) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const resetFilters = () => {
    setFilters(defaultFilters);
  };

  return {
    filters,
    updateFilter,
    resetFilters,
  };
}
