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
    setFilters((prev) => {
      // Reset to page 1 when changing PageSize or any filter (except Page itself)
      if (key === "PageSize") {
        return {
          ...prev,
          [key]: value,
          Page: 1, // Always reset to first page when changing page size
        };
      }

      if (key !== "Page") {
        return {
          ...prev,
          [key]: value,
          Page: 1, // Reset to page 1 when applying new filters
        };
      }

      return {
        ...prev,
        [key]: value,
      };
    });
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
