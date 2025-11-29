import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

interface CheckoutState {
  // Invoice selection
  selectedInvoiceId: string | null;
  setSelectedInvoiceId: (id: string | null) => void;

  // Invoice creation
  createdInvoiceId: string | null;
  setCreatedInvoiceId: (id: string | null) => void;

  // UI visibility
  showPreview: boolean;
  setShowPreview: (show: boolean) => void;

  showInvoiceDetail: boolean;
  setShowInvoiceDetail: (show: boolean) => void;

  // Fee toggles (for InvoiceDetailSheet)
  applyVat: boolean;
  setApplyVat: (apply: boolean) => void;

  applyServiceCharge: boolean;
  setApplyServiceCharge: (apply: boolean) => void;

  // Reset all state (when closing checkout sheet)
  reset: () => void;
}

const initialState = {
  selectedInvoiceId: null,
  createdInvoiceId: null,
  showPreview: false,
  showInvoiceDetail: false,
  applyVat: true,
  applyServiceCharge: true,
};

export const useCheckoutStore = create<CheckoutState>()(
  persist(
    (set) => ({
      ...initialState,

      setSelectedInvoiceId: (id) => set({ selectedInvoiceId: id }),
      setCreatedInvoiceId: (id) => set({ createdInvoiceId: id }),
      setShowPreview: (show) => set({ showPreview: show }),
      setShowInvoiceDetail: (show) => set({ showInvoiceDetail: show }),
      setApplyVat: (apply) => set({ applyVat: apply }),
      setApplyServiceCharge: (apply) => set({ applyServiceCharge: apply }),

      reset: () => set(initialState),
    }),
    {
      name: "checkout-storage",
      storage: createJSONStorage(() => localStorage),
    }
  )
);
