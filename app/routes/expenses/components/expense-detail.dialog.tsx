import { format, parseISO } from "date-fns";
import { vi } from "date-fns/locale";
import {
  Calendar,
  CreditCard,
  User,
  Tag,
  Building2,
  Briefcase,
  Wrench,
  Zap,
  PackageOpen,
  Receipt,
  DollarSign,
  Share2,
  Download,
  Copy,
} from "lucide-react";
import { Button } from "~/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog";
import { ScrollArea } from "~/components/ui/scroll-area";
import { formatMoney } from "~/lib/utils";
import { PAYMENT_METHODS } from "~/services/types/payment.types";
import { useExpenseDetail } from "../container/query.hooks";
import SourceTypeBadge from "../fragments/source-type-badge";
import StatusBadge from "../fragments/status-badge";
import { toast } from "sonner";

type ExpenseDetailDialogProps = {
  open: boolean;
  onClose: () => void;
  expenseId: string;
};

// --- CONFIGURATION ---
const CATEGORY_CONFIG: Record<
  string,
  { icon: React.ComponentType<{ className?: string }>; label: string }
> = {
  Procurement: { icon: PackageOpen, label: "Mua sắm" },
  Salary: { icon: Briefcase, label: "Lương & Nhân sự" },
  Utilities: { icon: Zap, label: "Tiện ích" },
  Maintenance: { icon: Wrench, label: "Bảo trì" },
  Office: { icon: Building2, label: "Văn phòng" },
  Other: { icon: Receipt, label: "Khác" },
};

// --- MINIMAL ROW HELPER ---
// Loại bỏ background icon, chỉ giữ lại text và icon thuần
const MinimalRow = ({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: React.ReactNode;
}) => (
  <div className="flex items-center justify-between py-3 border-b border-border/40 last:border-0">
    <div className="flex items-center gap-3 text-muted-foreground">
      <Icon className="w-4 h-4" />
      <span className="text-sm font-medium">{label}</span>
    </div>
    <div className="text-sm font-medium text-foreground text-right max-w-[200px] truncate">
      {value}
    </div>
  </div>
);

export function ExpenseDetailDialog({
  open,
  onClose,
  expenseId,
}: ExpenseDetailDialogProps) {
  const { data: expense } = useExpenseDetail(expenseId, { enabled: open });

  if (!expense) return null;

  const categoryConfig = CATEGORY_CONFIG[expense.category] || {
    icon: DollarSign,
    label: expense.categoryName || expense.category,
  };

  const paymentMethod = PAYMENT_METHODS.find(
    (m) => m.value === expense.paymentMethod
  );

  const handleCopyId = () => {
    navigator.clipboard.writeText(expense.receiptNumber);
    toast.success("Đã sao chép mã phiếu");
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md p-0 gap-0 overflow-hidden border-none shadow-2xl">
        {/* HEADER: Clean & Functional */}
        <DialogHeader className="px-6 py-4 flex flex-row items-center justify-between border-b border-border/40 bg-background/50 backdrop-blur-sm sticky top-0 z-10">
          <DialogTitle className="text-base font-semibold text-foreground">
            Chi tiết phiếu chi
          </DialogTitle>
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 hover:bg-muted"
              onClick={handleCopyId}
            >
              <Copy className="w-4 h-4 text-muted-foreground" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 hover:bg-muted"
            >
              <Download className="w-4 h-4 text-muted-foreground" />
            </Button>
          </div>
        </DialogHeader>

        <ScrollArea className="max-h-[80vh]">
          <div className="p-6 space-y-8">
            {/* 1. AMOUNT HERO: Typography Driven */}
            <div className="flex flex-col items-center justify-center space-y-2 py-4">
              <span className="text-xs font-medium text-muted-foreground uppercase tracking-widest">
                Tổng thanh toán
              </span>
              <h1 className="text-4xl font-bold tracking-tighter text-foreground">
                {formatMoney(expense.amount).vndFormatted}
              </h1>
              <div className="flex items-center gap-2 mt-2">
                <StatusBadge status={expense.status} />
                <SourceTypeBadge sourceType={expense.sourceType} />
              </div>
            </div>

            {/* 2. DETAILS LIST: Table-like structure */}
            <div className="space-y-1">
              <MinimalRow
                icon={Calendar}
                label="Ngày giao dịch"
                value={format(
                  parseISO(expense.expenseDate),
                  "dd/MM/yyyy HH:mm",
                  { locale: vi }
                )}
              />
              <MinimalRow
                icon={Tag}
                label="Danh mục"
                value={categoryConfig.label}
              />
              <MinimalRow
                icon={CreditCard}
                label="Phương thức"
                value={paymentMethod?.label || "Tiền mặt"}
              />
              <MinimalRow
                icon={User}
                label="Người tạo"
                value={expense.createdBy}
              />
              <MinimalRow
                icon={Receipt}
                label="Mã phiếu"
                value={
                  <span className="font-mono">{expense.receiptNumber}</span>
                }
              />
            </div>

            {/* 3. NOTE SECTION: Subtle background */}
            {expense.description && (
              <div className="bg-muted/30 rounded-xl p-4 text-sm text-muted-foreground leading-relaxed">
                <span className="font-semibold text-foreground block mb-1 text-xs uppercase">
                  Ghi chú:
                </span>
                {expense.description}
              </div>
            )}

            {/* 4. FOOTER META */}
            <div className="text-center">
              <p className="text-[10px] text-muted-foreground/50 font-mono">
                ID: {expense.id}
              </p>
            </div>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
