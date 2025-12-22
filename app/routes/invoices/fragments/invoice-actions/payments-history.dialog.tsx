import { format } from "date-fns";
import { vi } from "date-fns/locale";
import {
  Banknote,
  Calendar,
  CheckCircle2,
  CreditCard,
  FileX,
  Globe,
  Loader2,
  Wallet,
  XCircle,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog";
import { cn, formatMoney } from "~/lib/utils";
import { useInvoicePaymentsHistory } from "../../container/invoices/query.hooks";

interface PaymentsHistoryDialogProps {
  invoiceId: string;
  open: boolean;
  onClose: (open: boolean) => void;
}

// --- Helper Configurations ---

const METHOD_CONFIG: Record<
  string,
  { label: string; icon: any; color: string }
> = {
  cash: {
    label: "Tiền mặt",
    icon: Banknote,
    color: "text-emerald-600 bg-emerald-100/50",
  },
  card: {
    label: "Thẻ",
    icon: CreditCard,
    color: "text-purple-600 bg-purple-100/50",
  },
  transfer: {
    label: "Chuyển khoản",
    icon: Globe,
    color: "text-blue-600 bg-blue-100/50",
  },
  default: {
    label: "Khác",
    icon: Wallet,
    color: "text-gray-600 bg-gray-100/50",
  },
};

const STATUS_CONFIG: Record<
  string,
  { label: string; icon: any; color: string }
> = {
  completed: {
    label: "Thành công",
    icon: CheckCircle2,
    color: "text-emerald-600",
  },
  pending: { label: "Đang xử lý", icon: Loader2, color: "text-amber-600" },
  failed: { label: "Thất bại", icon: XCircle, color: "text-red-600" },
  cancelled: { label: "Đã hủy", icon: FileX, color: "text-muted-foreground" },
};

export default function PaymentsHistoryDialog({
  invoiceId,
  open,
  onClose,
}: PaymentsHistoryDialogProps) {
  const { data: payments, isLoading } = useInvoicePaymentsHistory(invoiceId, {
    enabled: open,
  });

  const totalPaid =
    payments?.reduce(
      (sum, p) => (p.status === "completed" ? sum + (p.amount || 0) : sum),
      0
    ) || 0;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md p-0 overflow-y-auto flex flex-col max-h-[85vh]">
        <DialogHeader className="px-6 py-4 border-b bg-muted/10">
          <DialogTitle>Lịch sử thanh toán</DialogTitle>
          <DialogDescription>
            Chi tiết các giao dịch liên quan đến hóa đơn này.
          </DialogDescription>
        </DialogHeader>

        {/* Summary Block */}
        <div className="bg-emerald-50/50 dark:bg-emerald-900/10 px-6 py-3 border-b border-emerald-100 dark:border-emerald-900/50 flex justify-between items-center">
          <span className="text-xs font-medium text-emerald-700 dark:text-emerald-400 uppercase tracking-wide">
            Tổng thực thu
          </span>
          <span className="text-lg font-bold text-emerald-700 dark:text-emerald-400 font-mono">
            {formatMoney(totalPaid).vndFormatted}
          </span>
        </div>

        <div className="flex-1 overflow-hidden min-h-[300px] relative bg-background">
          {isLoading ? (
            <div className="absolute inset-0 flex items-center justify-center">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : !payments || payments.length === 0 ? (
            <div className="absolute inset-0 flex flex-col items-center justify-center text-muted-foreground">
              <FileX className="h-10 w-10 mb-2 opacity-20" />
              <p className="text-sm">Chưa có giao dịch nào</p>
            </div>
          ) : (
            <div className="px-6 py-4 space-y-4">
              {payments.map((payment) => {
                const methodCfg =
                  METHOD_CONFIG[payment.method?.toLowerCase() || ""] ||
                  METHOD_CONFIG.default;
                const statusCfg =
                  STATUS_CONFIG[payment.status?.toLowerCase() || ""] ||
                  STATUS_CONFIG.completed;
                const MethodIcon = methodCfg.icon;
                const StatusIcon = statusCfg.icon;

                return (
                  <div
                    key={payment.paymentId}
                    className="group flex flex-col gap-3 p-3 rounded-lg border border-border/40 hover:border-border hover:bg-muted/30 transition-all"
                  >
                    {/* Top Row: Icon, Method Name, Amount */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={cn("p-2 rounded-md", methodCfg.color)}>
                          <MethodIcon className="h-4 w-4" />
                        </div>
                        <div>
                          <p className="text-sm font-semibold">
                            {methodCfg.label}
                          </p>
                          <div className="flex items-center gap-1.5 text-xs text-muted-foreground mt-0.5">
                            <Calendar className="h-3 w-3" />
                            <span>
                              {format(
                                new Date(payment.createdAt || ""),
                                "HH:mm dd/MM/yyyy",
                                { locale: vi }
                              )}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <p
                          className={cn(
                            "text-sm font-bold font-mono",
                            payment.status === "cancelled" ||
                              payment.status === "failed"
                              ? "text-muted-foreground line-through decoration-destructive/50"
                              : "text-foreground"
                          )}
                        >
                          {formatMoney(payment.amount || 0).vndFormatted}
                        </p>
                        <div
                          className={cn(
                            "flex items-center justify-end gap-1 text-[10px] font-medium mt-1",
                            statusCfg.color
                          )}
                        >
                          <StatusIcon className="h-3 w-3" />
                          <span>{statusCfg.label}</span>
                        </div>
                      </div>
                    </div>

                    {/* Bottom Row: Note (if any) */}
                    {payment.note && (
                      <div className="text-xs text-muted-foreground bg-muted/50 p-2 rounded border border-border/50 italic">
                        "{payment.note}"
                      </div>
                    )}

                    {/* Footer: ID */}
                    <div className="flex justify-between items-center pt-1">
                      <span className="text-[10px] text-muted-foreground/50 font-mono">
                        ID: {payment.paymentId}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
