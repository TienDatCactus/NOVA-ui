import { useMemo } from "react";
import { format } from "date-fns";
import { useInvoices } from "./query.hooks";
import useInvoiceFilters from "./filter.hooks";

function useInvoicesContainer() {
  const { filters, updateFilter, resetFilters, filterInvoices } =
    useInvoiceFilters();

  // Convert filters to API params
  const apiParams = useMemo(
    () => ({
      Page: filters.page,
      PageSize: filters.pageSize,
      Status: filters.status,
      PaymentMethod: filters.paymentMethod,
      IssuedFrom: filters.dateRange?.from
        ? format(filters.dateRange.from, "yyyy-MM-dd")
        : undefined,
      IssuedTo: filters.dateRange?.to
        ? format(filters.dateRange.to, "yyyy-MM-dd")
        : undefined,
      Keyword: filters.searchText || undefined,
    }),
    [filters]
  );

  const { data: response, isPending, refetch } = useInvoices(apiParams);

  // Response now has data array and meta object
  const invoices = response?.data || [];
  const meta = response?.meta || {
    page: 1,
    pageSize: 10,
    total: invoices.length,
    hasNext: false,
  };
  return {
    invoices: invoices,
    meta: {
      page: meta.page,
      pageSize: meta.pageSize,
      totalItems: meta.total,
      totalPages: Math.ceil(meta.total / meta.pageSize),
      hasNext: meta.hasNext,
    },
    isPending,
    filters,
    updateFilter,
    resetFilters,
    refetch,
  };
}

export default useInvoicesContainer;
