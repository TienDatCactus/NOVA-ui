import { useState, useMemo } from "react";
import type { InvoiceListItemDto } from "~/services/api/invoices/dto";
import type { InvoiceListParams } from "~/services/api/invoices/invoice.types";
import type { DateRange } from "~/components/ui/date-range-picker";
import { format } from "date-fns";

const DEFAULT_FILTERS: InvoiceListParams = {
  BookingCode: undefined,
  BookingId: undefined,
  InvoiceType: undefined,
  Page: 1,
  PageSize: 10,
  IssuedFrom: undefined,
  IssuedTo: undefined,
  Keyword: undefined,
  PaymentMethod: undefined,
  SortBy: undefined,
  SortDirection: undefined,
  Status: undefined,
};

function useInvoiceFilters() {
  const [filters, setFilters] = useState<InvoiceListParams>(DEFAULT_FILTERS);

  const updateFilter = <K extends keyof InvoiceListParams>(
    key: K,
    value: InvoiceListParams[K]
  ) => {
    setFilters((prev) => {
      if (key !== "Page" && key !== "PageSize") {
        return { ...prev, [key]: value, Page: 1 };
      }
      return { ...prev, [key]: value };
    });
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

export default useInvoiceFilters;
