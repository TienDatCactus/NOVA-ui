import { useMemo } from "react";
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
      IssuedFrom: filters.issuedFrom,
      IssuedTo: filters.issuedTo,
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
    total: 0,
    hasNext: false,
  };

  console.log("📦 Container Hook:", {
    response,
    invoices,
    invoicesLength: invoices.length,
    meta,
  });

  return {
    invoices: invoices, // Dùng trực tiếp data từ API, không filter thêm
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
