import { useState } from "react";

export type PurchaseRequestStatus =
  | "Draft"
  | "Approved"
  | "Rejected"
  | "Fulfilled"
  | "Cancelled"
  | "";

export type PurchaseRequestFilters = {
  status: PurchaseRequestStatus;
};

const initialFilters: PurchaseRequestFilters = {
  status: "",
};

/**
 * Hook quản lý filters cho danh sách purchase requests
 */
export default function usePurchaseRequestFilters() {
  const [filters, setFilters] =
    useState<PurchaseRequestFilters>(initialFilters);

  const updateFilter = <K extends keyof PurchaseRequestFilters>(
    key: K,
    value: PurchaseRequestFilters[K]
  ) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const resetFilters = () => {
    setFilters(initialFilters);
  };

  return {
    filters,
    updateFilter,
    resetFilters,
  };
}
