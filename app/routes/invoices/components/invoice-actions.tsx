import { Ban, CreditCard, Plus, RotateCcw } from "lucide-react";
import { useCallback, useState } from "react";
import { Button } from "~/components/ui/button";
import { AuthLoader, UserRole } from "~/lib/auth/auth.loader";
import { hasAnyRole } from "~/lib/auth/bouncer";
import type {
  AddCustomItemsRequestDto,
  InvoiceListItemDto,
  InvoicePaymentRequestDto,
  RefundInvoiceRequestDto,
} from "~/services/api/invoices/dto";
import {
  useAddCustomItem,
  useInvoicePayment,
  useRefund,
  useVoidInvoice,
} from "../container/invoices/mutation.hooks";
import AddItemDialog from "../fragments/invoice-actions/add-custom-items.dialog";
import { InvoicePaymentDialog } from "../fragments/invoice-actions/payment.dialog";
import { RefundDialog } from "../fragments/invoice-actions/refund.dialog";
import { UnifiedConfirmDialog } from "../fragments/invoice-actions/unified-confirm.dialog";
type DialogType = "add-item" | "add-payment" | "refund" | "void" | null;

export function InvoiceActions({ invoice }: { invoice: InvoiceListItemDto }) {
  const [dialog, setDialog] = useState<DialogType>(null);
  const canAddItem = ["Unpaid", "DepositOnly"].includes(invoice.status);
  const { mutate: addCustomItem, isPending: isAddingItem } = useAddCustomItem(
    invoice?.invoiceId || "",
  );
  const { mutate: invoicePayment, isPending: isPayingInvoice } =
    useInvoicePayment(invoice?.invoiceId || "");
  const { mutate: refund, isPending: isRefunding } = useRefund(
    invoice?.invoiceId || "",
  );
  const { mutate: voidInvoice, isPending: isVoidingInvoice } = useVoidInvoice(
    invoice?.invoiceId || "",
  );

  const remainingBalance =
    typeof invoice.balance === "number"
      ? invoice.balance
      : typeof invoice.total === "number" &&
          typeof invoice.paidAmount === "number"
        ? invoice.total - invoice.paidAmount
        : 0;
  const canProceedPayment =
    remainingBalance > 0 &&
    ["Unpaid", "DepositOnly", "PartiallyPaid"].includes(invoice.status);
  const canRefund = ["Paid", "Overpaid"].includes(invoice.status);
  const canVoid = ["Unpaid", "DepositOnly"].includes(invoice.status);
  const handleAddItem = useCallback(
    (data: AddCustomItemsRequestDto) =>
      addCustomItem(data, {
        onSuccess: () => {
          setDialog(null);
        },
      }),
    [],
  );
  const handleInvoicePayment = useCallback(
    (data: InvoicePaymentRequestDto) =>
      invoicePayment(data, {
        onSuccess: () => {
          setDialog(null);
        },
      }),
    [],
  );
  const handleRefund = useCallback(
    (data: RefundInvoiceRequestDto) =>
      refund(data, {
        onSuccess: () => {
          setDialog(null);
        },
      }),
    [],
  );
  const handleVoid = useCallback(
    () =>
      voidInvoice(undefined, {
        onSuccess: () => {
          setDialog(null);
        },
      }),
    [],
  );

  return (
    <div className="flex flex-wrap gap-2">
      {canAddItem && (
        <Button
          variant="info-outline"
          size={"sm"}
          onClick={() => setDialog("add-item")}
          disabled={isAddingItem}
        >
          <Plus className="h-4 w-4 mr-2" />
          Thêm mục tùy chỉnh
        </Button>
      )}

      {canProceedPayment && (
        <Button
          variant="secondary"
          size={"sm"}
          onClick={() => setDialog("add-payment")}
          disabled={isPayingInvoice}
        >
          <CreditCard className="h-4 w-4 mr-2" />
          Thanh toán
        </Button>
      )}

      {hasAnyRole(AuthLoader.getUser(), [UserRole.HotelManager]) &&
        canRefund && (
          <Button
            variant="warning"
            size={"sm"}
            onClick={() => setDialog("refund")}
            disabled={isRefunding}
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
          disabled={isVoidingInvoice}
        >
          <Ban className="h-4 w-4 mr-2" />
          Hủy hóa đơn
        </Button>
      )}

      <AddItemDialog
        open={dialog === "add-item"}
        onClose={() => setDialog(null)}
        onSubmit={handleAddItem}
      />

      <UnifiedConfirmDialog
        open={dialog === "void"}
        type={"void"}
        onConfirm={handleVoid}
        onCancel={() => setDialog(null)}
      />

      <InvoicePaymentDialog
        open={dialog === "add-payment"}
        onClose={() => setDialog(null)}
        onSubmit={handleInvoicePayment}
        remaining={Math.round(remainingBalance)}
      />

      <RefundDialog
        open={dialog === "refund"}
        onClose={() => setDialog(null)}
        onSubmit={handleRefund}
        maxRefundAmount={invoice.paidAmount || 0}
      />
    </div>
  );
}
