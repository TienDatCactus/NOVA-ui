import { useQueryClient } from "@tanstack/react-query";
import {
  BadgeCheck,
  Ban,
  CheckCircle2,
  CreditCard,
  Plus,
  RotateCcw,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "~/components/ui/button";
import { InvoicesService } from "~/services/api/invoices";
import type {
  AddCustomItemsRequestDto,
  ConfirmInvoicePaymentRequestDto,
  InvoiceListItemDto,
  InvoicePaymentRequestDto,
  RefundInvoiceRequestDto,
} from "~/services/api/invoices/dto";
import AddItemDialog from "../fragments/invoice-actions/add-custom-items.dialog";
import { InvoicePaymentDialog } from "../fragments/invoice-actions/payment.dialog";
import { RefundDialog } from "../fragments/invoice-actions/refund.dialog";
import { ConfirmPaymentDialog } from "../fragments/invoice-actions/confirm-payment.dialog";
import { UnifiedConfirmDialog } from "../fragments/invoice-actions/unified-confirm.dialog";
type DialogType =
  | "add-item"
  | "finalize"
  | "add-payment"
  | "confirm"
  | "refund"
  | "void"
  | null;

export function InvoiceActions({ invoice }: { invoice: InvoiceListItemDto }) {
  const [dialog, setDialog] = useState<DialogType>(null);
  const qc = useQueryClient();

  const refreshInvoice = () =>
    qc.invalidateQueries({ queryKey: ["invoice", invoice.invoiceId] });

  // Service methods
  const {
    addCustomItemsToInvoice,
    finalizeInvoice,
    addInvoicePayment,
    confirmInvoicePayment,
    refundInvoice,
    voidInvoice,
  } = InvoicesService;

  const canAddItem = ["Unpaid", "DepositOnly"].includes(invoice.status);
  const canFinalize = ["Unpaid", "DepositOnly"].includes(invoice.status);
  const canProceedPayment = [
    "Unpaid",
    "DepositOnly",
    "Overpaid",
    "PartiallyPaid",
  ].includes(invoice.status);

  const canConfirmPayment =
    ["Overpaid", "Paid", "PartiallyPaid"].includes(invoice.status) &&
    typeof invoice.paidAmount === "number" &&
    typeof invoice.total === "number" &&
    invoice.paidAmount >= invoice.total;
  const canRefund = ["Paid", "Overpaid"].includes(invoice.status);
  const canVoid = ["Unpaid", "DepositOnly"].includes(invoice.status);
  const handleAddItem = async (data: AddCustomItemsRequestDto) => {
    await addCustomItemsToInvoice(invoice.invoiceId, data);
    await refreshInvoice();
    toast.success("Đã thêm mục tùy chỉnh");
    setDialog(null);
  };

  const handleFinalize = async () => {
    await finalizeInvoice(invoice.invoiceId);
    await refreshInvoice();
    toast.success("Đã chốt hóa đơn");
    setDialog(null);
  };

  const handleInvoicePayment = async (data: InvoicePaymentRequestDto) => {
    await addInvoicePayment(invoice.invoiceId, data);
    await refreshInvoice();
    toast.success("Đã thêm thanh toán");
    setDialog(null);
  };

  const handleConfirmPayment = async (
    data: ConfirmInvoicePaymentRequestDto
  ) => {
    await confirmInvoicePayment(invoice.invoiceId, data);
    await refreshInvoice();
    toast.success("Đã xác nhận thanh toán");
    setDialog(null);
  };

  const handleRefund = async (data: RefundInvoiceRequestDto) => {
    await refundInvoice(invoice.invoiceId, data);
    await refreshInvoice();
    toast.success("Đã hoàn tiền");
    setDialog(null);
  };

  const handleVoid = async () => {
    await voidInvoice(invoice.invoiceId);
    await refreshInvoice();
    toast.success("Đã hủy hóa đơn");
    setDialog(null);
  };

  return (
    <div className="flex flex-wrap gap-2">
      {canAddItem && (
        <Button
          variant="info-outline"
          size={"sm"}
          onClick={() => setDialog("add-item")}
        >
          <Plus className="h-4 w-4 mr-2" />
          Thêm mục tùy chỉnh
        </Button>
      )}

      {canFinalize && (
        <Button
          variant="success"
          size={"sm"}
          onClick={() => setDialog("finalize")}
        >
          <CheckCircle2 className="h-4 w-4 mr-2" />
          Chốt hóa đơn
        </Button>
      )}

      {canProceedPayment && (
        <Button
          variant="secondary"
          size={"sm"}
          onClick={() => setDialog("add-payment")}
        >
          <CreditCard className="h-4 w-4 mr-2" />
          Thêm thanh toán
        </Button>
      )}

      {canConfirmPayment && (
        <Button
          variant="success"
          size={"sm"}
          onClick={() => setDialog("confirm")}
        >
          <BadgeCheck className="h-4 w-4 mr-2" />
          Xác nhận đã thanh toán
        </Button>
      )}

      {canRefund && (
        <Button
          variant="warning"
          size={"sm"}
          onClick={() => setDialog("refund")}
        >
          <RotateCcw className="h-4 w-4 mr-2" />
          Hoàn tiền
        </Button>
      )}

      {canVoid && (
        <Button
          size={"sm"}
          variant="destructive"
          onClick={() => setDialog("void")}
        >
          <Ban className="h-4 w-4 mr-2" />
          Hủy hóa đơn
        </Button>
      )}

      {/* ----- Dialogs ----- */}
      <AddItemDialog
        open={dialog === "add-item"}
        onClose={() => setDialog(null)}
        onSubmit={handleAddItem}
      />

      <UnifiedConfirmDialog
        open={dialog === "finalize" || dialog === "void"}
        type={dialog === "finalize" ? "finalize" : "void"}
        onConfirm={dialog === "finalize" ? handleFinalize : handleVoid}
        onCancel={() => setDialog(null)}
      />

      <InvoicePaymentDialog
        open={dialog === "add-payment"}
        onClose={() => setDialog(null)}
        onSubmit={handleInvoicePayment}
        remaining={
          typeof invoice.total === "number" &&
          typeof invoice.paidAmount === "number"
            ? invoice.total - invoice.paidAmount
            : 0
        }
      />

      <RefundDialog
        open={dialog === "refund"}
        onClose={() => setDialog(null)}
        onSubmit={handleRefund}
      />
    </div>
  );
}
