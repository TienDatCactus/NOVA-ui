import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { toast } from "sonner";
import { InvoicesService } from "~/services/api/invoices";
import type {
  AddCustomItemsRequestDto,
  InvoicePaymentRequestDto,
  RefundInvoiceRequestDto,
} from "~/services/api/invoices/dto";

// React Query mutations
const useAddCustomItem = (invoiceId: string) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: AddCustomItemsRequestDto) =>
      InvoicesService.addCustomItemsToInvoice(invoiceId, data),
    onSuccess: async () => {
      qc.invalidateQueries({ queryKey: ["invoice-detail", invoiceId] });
      qc.invalidateQueries({ queryKey: ["invoices"] });
    },
  });
};

const useInvoicePayment = (invoiceId: string) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: InvoicePaymentRequestDto) =>
      InvoicesService.addInvoicePayment(invoiceId, data),
    onSuccess: async () => {
      qc.invalidateQueries({ queryKey: ["invoice-detail", invoiceId] });
      qc.invalidateQueries({ queryKey: ["invoices"] });
    },
  });
};

const useRefund = (invoiceId: string) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: RefundInvoiceRequestDto) =>
      InvoicesService.refundInvoice(invoiceId, data),
    onSuccess: async () => {
      qc.invalidateQueries({ queryKey: ["invoice-detail", invoiceId] });
      qc.invalidateQueries({ queryKey: ["invoices"] });
    },
  });
};

const useVoidInvoice = (invoiceId: string) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => InvoicesService.voidInvoice(invoiceId),
    onSuccess: async () => {
      qc.invalidateQueries({ queryKey: ["invoice-detail", invoiceId] });
      qc.invalidateQueries({ queryKey: ["invoices"] });
    },
  });
};

export { useAddCustomItem, useInvoicePayment, useRefund, useVoidInvoice };
