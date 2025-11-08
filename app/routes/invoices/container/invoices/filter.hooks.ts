import { useState, useMemo } from "react";
import type { InvoiceListItemDto } from "~/services/api/invoices/dto";
import type { InvoiceListParams } from "~/services/api/invoices/invoice.types";
import type { DateRange } from "~/components/ui/date-range-picker";
import { format } from "date-fns";

export interface InvoiceFilters {
  searchText: string; // Maps to Keyword param
  status?: string; // Maps to Status param
  paymentMethod?: string; // Maps to PaymentMethod param
  bookingId?: string; // Maps to BookingId param
  bookingCode?: string; // Maps to BookingCode param
  invoiceType?: string; // Maps to InvoiceType param
  dateRange?: DateRange; // Maps to IssuedFrom and IssuedTo params
  sortBy?: string; // Maps to SortBy param
  sortDirection?: "asc" | "desc"; // Maps to SortDirection param
  page: number; // Maps to Page param
  pageSize: number; // Maps to PageSize param
}

const DEFAULT_FILTERS: InvoiceFilters = {
  searchText: "",
  status: undefined,
  paymentMethod: undefined,
  bookingId: undefined,
  bookingCode: undefined,
  invoiceType: undefined,
  dateRange: undefined,
  sortBy: undefined,
  sortDirection: undefined,
  page: 1,
  pageSize: 10,
};

function useInvoiceFilters() {
  const [filters, setFilters] = useState<InvoiceFilters>(DEFAULT_FILTERS);

  // Convert frontend filters to API params format
  const apiParams: InvoiceListParams = useMemo(() => {
    const params: InvoiceListParams = {
      Page: filters.page,
      PageSize: filters.pageSize,
    };

    // Add Keyword if searchText is not empty
    if (filters.searchText.trim()) {
      params.Keyword = filters.searchText.trim();
    }

    // Add Status filter
    if (filters.status) {
      params.Status = filters.status;
    }

    // Add PaymentMethod filter
    if (filters.paymentMethod) {
      params.PaymentMethod = filters.paymentMethod;
    }

    // Add BookingId filter
    if (filters.bookingId) {
      params.BookingId = filters.bookingId;
    }

    // Add BookingCode filter
    if (filters.bookingCode) {
      params.BookingCode = filters.bookingCode;
    }

    // Add InvoiceType filter
    if (filters.invoiceType) {
      params.InvoiceType = filters.invoiceType;
    }

    // Add date range filters (IssuedFrom and IssuedTo)
    if (filters.dateRange?.from) {
      params.IssuedFrom = format(
        filters.dateRange.from,
        "yyyy-MM-dd'T'HH:mm:ss"
      );
    }
    if (filters.dateRange?.to) {
      params.IssuedTo = format(filters.dateRange.to, "yyyy-MM-dd'T'HH:mm:ss");
    }

    // Add sorting params
    if (filters.sortBy) {
      params.SortBy = filters.sortBy;
    }
    if (filters.sortDirection) {
      params.SortDirection = filters.sortDirection;
    }

    return params;
  }, [
    filters.page,
    filters.pageSize,
    filters.searchText,
    filters.status,
    filters.paymentMethod,
    filters.bookingId,
    filters.bookingCode,
    filters.invoiceType,
    filters.dateRange,
    filters.sortBy,
    filters.sortDirection,
  ]);

  const updateFilter = <K extends keyof InvoiceFilters>(
    key: K,
    value: InvoiceFilters[K]
  ) => {
    setFilters((prev) => {
      // Reset to page 1 if any filter other than page changes
      if (key !== "page" && key !== "pageSize") {
        return { ...prev, [key]: value, page: 1 };
      }
      return { ...prev, [key]: value };
    });
  };

  const resetFilters = () => {
    setFilters(DEFAULT_FILTERS);
  };

  // Client-side filtering is not needed since backend handles all filtering
  // Keep this for backward compatibility or additional client-side refinement if needed
  const filterInvoices = (invoices: InvoiceListItemDto[]) => {
    return invoices; // Return as-is since backend already filtered
  };

  return {
    filters,
    apiParams,
    updateFilter,
    resetFilters,
    filterInvoices,
  };
}

export default useInvoiceFilters;
