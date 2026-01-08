import { useMutation, useQueryClient } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { toast } from "sonner";
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
      toast.success("Thêm mục tùy chỉnh vào hóa đơn thành công");
    },
    onError: (error) => {
      if (error instanceof AxiosError) {
        toast.error(
          error.response?.data.message || "Thêm mục tùy chỉnh thất bại"
        );
      }
    },
  });
};

const useInvoicePayment = (invoiceId: string, bookingId?: string) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: InvoicePaymentRequestDto) =>
      InvoicesService.proceedInvoicePayment(invoiceId, data),
    onSuccess: async () => {
      qc.invalidateQueries({ queryKey: ["invoice-detail", invoiceId] });
      qc.invalidateQueries({ queryKey: ["invoices"] });
      if (bookingId) {
        qc.invalidateQueries({ queryKey: ["booking-invoices", bookingId] });
        qc.invalidateQueries({ queryKey: ["bookings-detail"] });
        qc.invalidateQueries({
          queryKey: ["checkout", "pending-charges", bookingId],
        });
      }
      toast.success("Thanh toán hóa đơn thành công");
    },
    onError: (error) => {
      if (error instanceof AxiosError) {
        toast.error(
          error.response?.data.message || "Thanh toán hóa đơn thất bại"
        );
      }
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
      toast.success("Hoàn tiền hóa đơn thành công");
    },
    onError: (error) => {
      if (error instanceof AxiosError) {
        toast.error(
          error.response?.data.message || "Hoàn tiền hóa đơn thất bại"
        );
      }
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
      toast.success("Hủy hóa đơn thành công");
    },
    onError: (error) => {
      if (error instanceof AxiosError) {
        toast.error(error.response?.data.message || "Hủy hóa đơn thất bại");
      }
    },
  });
};

const useSyncInvoiceWithOrders = (invoiceId: string) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => InvoicesService.syncInvoiceWithOrders(invoiceId),
    onSuccess: async () => {
      qc.invalidateQueries({ queryKey: ["invoice-detail", invoiceId] });
      qc.invalidateQueries({ queryKey: ["invoices"] });
      toast.success("Đồng bộ hóa đơn với đơn hàng thành công");
    },
    onError: (error) => {
      if (error instanceof AxiosError) {
        toast.error(
          error.response?.data.message ||
            "Đồng bộ hóa đơn với đơn hàng thất bại"
        );
      }
    },
  });
};

const useExportInvoice = (invoiceId: string) => {
  return useMutation({
    mutationFn: async () => await InvoicesService.exportInvoiceById(invoiceId),
    onError: (error) => {
      if (error instanceof AxiosError) {
        toast.error(error.response?.data.message || "Lỗi khi xuất báo cáo");
      }
    },
  });
};
export {
  useAddCustomItem,
  useInvoicePayment,
  useRefund,
  useVoidInvoice,
  useSyncInvoiceWithOrders,
  useExportInvoice,
};
