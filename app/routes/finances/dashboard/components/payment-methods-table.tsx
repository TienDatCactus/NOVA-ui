import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { formatMoney, cn } from "~/lib/utils";
import {
  Banknote,
  CreditCard,
  Building2,
  Globe,
  Wallet,
  AlertCircle,
  Clock,
  Landmark,
} from "lucide-react";
import type { PaymentCollectionItemDto } from "~/services/api/finances/dto";

// --- Configuration ---
// Icon mapping đơn giản, không màu mè
const METHOD_ICONS: Record<string, any> = {
  cash: Banknote,
  card: CreditCard,
  banktransfer: Building2,
  otacollect: Globe,
  otaprepaid: Globe,
  onaccount: Landmark,
  default: Wallet,
};

function getIcon(method: string) {
  return METHOD_ICONS[method.toLowerCase()] || METHOD_ICONS.default;
}

// --- Sub-component: Row Item ---
interface PaymentRowProps {
  method: string;
  amount: number;
  count: number;
  total: number;
  isPending?: boolean;
}

function PaymentRow({
  method,
  amount,
  count,
  total,
  isPending,
}: PaymentRowProps) {
  const Icon = getIcon(method);
  const percentage = total > 0 ? (amount / total) * 100 : 0;

  return (
    <div
      className={cn(
        "flex items-center justify-between py-3 first:pt-0 last:pb-0",
        isPending && "opacity-80"
      )}
    >
      {/* Left: Icon & Name */}
      <div className="flex items-center gap-3">
        <div
          className={cn(
            "p-2 rounded-md",
            isPending
              ? "bg-muted text-muted-foreground"
              : "bg-primary/5 text-primary"
          )}
        >
          <Icon className="h-4 w-4" />
        </div>
        <div className="flex flex-col">
          <span className="text-sm font-medium">
            {method === "otacollect" || method === "otaprepaid"
              ? "OTA"
              : method === "onaccount"
                ? "Công nợ"
                : method === "banktransfer"
                  ? "Chuyển khoản"
                  : method === "cash"
                    ? "Tiền mặt"
                    : method === "card"
                      ? "Thẻ"
                      : method}
          </span>
          <span className="text-[10px] text-muted-foreground">
            {count} giao dịch
          </span>
        </div>
      </div>

      {/* Right: Amount & Percent */}
      <div className="text-right">
        <div className="text-sm font-bold tabular-nums tracking-tight">
          {formatMoney(amount).vndFormatted}
        </div>
        <div className="text-[10px] text-muted-foreground font-medium">
          {percentage.toFixed(1)}%
        </div>
      </div>
    </div>
  );
}

// --- Main Component ---

interface PaymentMethodsTableProps {
  data: PaymentCollectionItemDto[];
  otaReceivable?: number;
}

export function PaymentMethodsTable({
  data,
  otaReceivable = 0,
}: PaymentMethodsTableProps) {
  const totalAmount = data.reduce((sum, item) => sum + item.amount, 0);

  // Sort: Tiền nhiều lên đầu
  const sortedData = [...data].sort((a, b) => b.amount - a.amount);

  // Logic cảnh báo tiền mặt cao (>50%)
  const cashItem = data.find((d) => d.method.toLowerCase() === "cash");
  const isHighCash = cashItem && cashItem.amount / totalAmount > 0.5;

  return (
    <Card className=" shadow-none border-border/60 flex flex-col p-0">
      <CardHeader className="pb-3 pt-4 px-4 border-b border-border/40">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
            Nguồn tiền thực thu
          </CardTitle>

          {/* Minimal Warning Badge */}
          {isHighCash && (
            <div className="flex items-center gap-1.5 text-[10px] font-medium text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-100">
              <AlertCircle className="h-3 w-3" />
              <span>Tiền mặt cao</span>
            </div>
          )}
        </div>
      </CardHeader>

      <CardContent className="p-4 flex-1 flex flex-col gap-1">
        {/* Main List */}
        <div className="space-y-1">
          {sortedData.map((item, index) => (
            <PaymentRow
              key={index}
              method={item.method}
              amount={item.amount}
              count={item.transactionCount}
              total={totalAmount}
            />
          ))}
        </div>

        {/* Separator if needed */}
        {otaReceivable > 0 && sortedData.length > 0 && (
          <div className="my-2 border-t border-border/50 border-dashed" />
        )}

        {/* OTA Receivable (Pending) - Distinct styling */}
        {otaReceivable > 0 && (
          <div className="flex items-center justify-between py-2 px-3 bg-muted/30 rounded-lg border border-border/50">
            <div className="flex items-center gap-3">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <div className="flex flex-col">
                <span className="text-sm font-medium text-muted-foreground">
                  OTA (Chờ thu)
                </span>
              </div>
            </div>
            <div className="text-right">
              <div className="text-sm font-bold tabular-nums text-muted-foreground">
                {formatMoney(otaReceivable).vndFormatted}
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
