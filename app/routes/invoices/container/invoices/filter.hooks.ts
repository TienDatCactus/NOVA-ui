import { useState } from "react";
import type { InvoiceListParams } from "~/services/api/invoices/invoice.types";

const DEFAULT_FILTERS: InvoiceListParams = {
  BookingCode: "",
  BookingId: "",
  InvoiceType: "",
  Page: 1,
  PageSize: 20,
  IssuedFrom: undefined,
  IssuedTo: undefined,
  Keyword: "",
  PaymentMethod: "",
  SortBy: "issuedAt",
  SortDirection: "desc",
  Status: "",
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
