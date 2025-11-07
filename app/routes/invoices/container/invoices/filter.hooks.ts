import { useState } from "react";
import type { InvoiceListItemDto } from "~/services/api/invoices/dto";
import type { DateRange } from "~/components/ui/date-range-picker";

export interface InvoiceFilters {
  searchText: string; // Search by invoice number, booking code, customer name
  status?: string; // Unpaid, DepositOnly, PartiallyPaid, Paid, Overpaid, Refunded, Chargeback, Voided
  paymentMethod?: string; // Unknown, Cash, Card, BankTransfer, OTACollect, OTAPrepaid, OnAccount
  dateRange?: DateRange; // Date range filter
  page: number;
  pageSize: number;
}

const DEFAULT_FILTERS: InvoiceFilters = {
  searchText: "",
  status: undefined,
  paymentMethod: undefined,
  dateRange: undefined,
  page: 1,
  pageSize: 5,
};

function useInvoiceFilters() {
  const [filters, setFilters] = useState<InvoiceFilters>(DEFAULT_FILTERS);

  const updateFilter = <K extends keyof InvoiceFilters>(
    key: K,
    value: InvoiceFilters[K]
  ) => {
    setFilters((prev) => {
      // Reset to page 1 if any filter other than page changes
      if (key !== "page") {
        return { ...prev, [key]: value, page: 1 };
      }
      return { ...prev, [key]: value };
    });
  };

  const resetFilters = () => {
    setFilters(DEFAULT_FILTERS);
  };

  // Client-side filtering for additional refinement (optional)
  const filterInvoices = (invoices: InvoiceListItemDto[]) => {
    return invoices.filter((invoice) => {
      if (filters.searchText) {
        const searchLower = filters.searchText.toLowerCase();
        const matchesSearch =
          invoice.invoiceNo.toLowerCase().includes(searchLower) ||
          invoice.bookingCode.toLowerCase().includes(searchLower) ||
          invoice.customerName.toLowerCase().includes(searchLower);
        if (!matchesSearch) return false;
      }

      if (filters.status && invoice.status !== filters.status) {
        return false;
      }

      if (
        filters.paymentMethod &&
        invoice.paymentMethod !== filters.paymentMethod
      ) {
        return false;
      }

      return true;
    });
  };

  return {
    filters,
    updateFilter,
    resetFilters,
    filterInvoices,
  };
}

export default useInvoiceFilters;
