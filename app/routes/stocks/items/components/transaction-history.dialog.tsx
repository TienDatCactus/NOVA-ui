import { useState, useMemo } from "react";
import { format, subDays } from "date-fns";
import { History } from "lucide-react";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "~/components/ui/table";
import { Skeleton } from "~/components/ui/skeleton";
import { useStockItemTransactions } from "../container/query.hooks";
import { TransactionFilters } from "../fragments/transaction-filters";
import { formatMoney } from "~/lib/utils";
import { FE_URL } from "~/lib/fe-url";
import type { StockTransactionsItemDto } from "~/services/api/stocks/items/dto";
import {
  Empty,
  EmptyDescription,
  EmptyMedia,
  EmptyTitle,
} from "~/components/ui/empty";

interface TransactionHistoryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  itemId: string;
  itemName: string;
}

// Badge helper for transaction types
function getTransactionTypeBadge(type: string) {
  const config: Record<
    string,
    {
      variant: "default" | "success" | "destructive" | "warning";
      label: string;
    }
  > = {
    OpeningBalance: { variant: "default", label: "Tồn đầu kỳ" },
    PurchaseIn: { variant: "success", label: "Nhập hàng" },
    ConsumptionOut: { variant: "warning", label: "Xuất tiêu thụ" },
    AdjustmentIn: { variant: "success", label: "Điều chỉnh +" },
    AdjustmentOut: { variant: "destructive", label: "Điều chỉnh -" },
  };
  return config[type] || { variant: "default" as const, label: type };
}

// Badge helper for source types
function getSourceTypeBadge(type: string) {
  const config: Record<
    string,
    { variant: "default" | "secondary"; label: string }
  > = {
    Manual: { variant: "secondary", label: "Thủ công" },
    PosOrder: { variant: "default", label: "Đơn hàng POS" },
    PurchaseRequest: { variant: "default", label: "Yêu cầu mua hàng" },
    StockAdjustment: { variant: "default", label: "Điều chỉnh kho" },
  };
  return config[type] || { variant: "default" as const, label: type };
}

// Get source URL based on type
function getSourceUrl(
  sourceType: string,
  sourceId: string | null
): string | null {
  if (!sourceId) return null;

  const routes: Record<string, string> = {
    PurchaseRequest: `${FE_URL.dashboard.stocks.purchaseRequests}/${sourceId}`,
    StockAdjustment: `${FE_URL.dashboard.stocks.adjustments}/${sourceId}`,
    PosOrder: `/dashboard/orders/${sourceId}`, // Adjust based on actual POS route
  };

  return routes[sourceType] || null;
}

export function TransactionHistoryDialog({
  open,
  onOpenChange,
  itemId,
  itemName,
}: TransactionHistoryDialogProps) {
  // Default to last 30 days
  const [fromDate, setFromDate] = useState<Date | undefined>(
    subDays(new Date(), 30)
  );
  const [toDate, setToDate] = useState<Date | undefined>(new Date());
  const [transactionType, setTransactionType] = useState<string>("all");
  const [sourceType, setSourceType] = useState<string>("all");

  // Format dates for API
  const fromDateStr = fromDate ? format(fromDate, "yyyy-MM-dd") : undefined;
  const toDateStr = toDate ? format(toDate, "yyyy-MM-dd") : undefined;

  // Fetch transactions
  const { data: transactions, isPending } = useStockItemTransactions(itemId, {
    fromDate: fromDateStr,
    toDate: toDateStr,
    includeInactive: false,
  });

  const filteredTransactions = useMemo(() => {
    if (!transactions) return [];

    return transactions.filter((tx: StockTransactionsItemDto) => {
      const matchesTransactionType =
        transactionType === "all" || tx.transactionType === transactionType;
      const matchesSourceType =
        sourceType === "all" || tx.sourceType === sourceType;
      return matchesTransactionType && matchesSourceType;
    });
  }, [transactions, transactionType, sourceType]);

  const handleClearFilters = () => {
    setFromDate(subDays(new Date(), 30));
    setToDate(new Date());
    setTransactionType("all");
    setSourceType("all");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Lịch sử giao dịch - {itemName}</DialogTitle>
          <DialogDescription>
            Xem chi tiết các giao dịch nhập xuất kho của hàng hóa
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Filters */}
          <TransactionFilters
            fromDate={fromDate}
            toDate={toDate}
            transactionType={transactionType}
            sourceType={sourceType}
            onFromDateChange={setFromDate}
            onToDateChange={setToDate}
            onTransactionTypeChange={setTransactionType}
            onSourceTypeChange={setSourceType}
            onClearFilters={handleClearFilters}
          />

          <div className="border rounded-lg">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Ngày</TableHead>
                  <TableHead>Loại giao dịch</TableHead>
                  <TableHead>Nguồn</TableHead>
                  <TableHead className="text-right">Số lượng</TableHead>
                  <TableHead className="text-right">Giá</TableHead>
                  <TableHead>Mã tham chiếu</TableHead>
                  <TableHead>Ghi chú</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isPending ? (
                  // Loading skeleton
                  Array.from({ length: 5 }).map((_, i) => (
                    <TableRow key={i}>
                      <TableCell>
                        <Skeleton className="h-4 w-24" />
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-6 w-20" />
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-6 w-24" />
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-4 w-16 ml-auto" />
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-4 w-20 ml-auto" />
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-4 w-32" />
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-4 w-40" />
                      </TableCell>
                    </TableRow>
                  ))
                ) : filteredTransactions.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="h-32 text-center">
                      <Empty>
                        <EmptyMedia variant={"icon"}>
                          <History />
                        </EmptyMedia>
                        <EmptyTitle>Không có giao dịch nào</EmptyTitle>
                        <EmptyDescription>
                          Chưa có giao dịch nào trong khoảng thời gian này
                        </EmptyDescription>
                      </Empty>
                    </TableCell>
                  </TableRow>
                ) : (
                  // Data rows
                  filteredTransactions.map((tx: StockTransactionsItemDto) => {
                    const typeBadge = getTransactionTypeBadge(
                      tx.transactionType
                    );
                    const sourceBadge = getSourceTypeBadge(tx.sourceType);
                    const isOut =
                      tx.transactionType === "ConsumptionOut" ||
                      tx.transactionType === "AdjustmentOut";
                    const sourceUrl = getSourceUrl(tx.sourceType, tx.sourceId);

                    return (
                      <TableRow key={tx.id}>
                        <TableCell className="whitespace-nowrap">
                          {format(
                            new Date(tx.transactionDate),
                            "dd/MM/yyyy HH:mm"
                          )}
                        </TableCell>
                        <TableCell>
                          <Badge variant={typeBadge.variant}>
                            {typeBadge.label}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant={sourceBadge.variant}>
                            {sourceBadge.label}
                          </Badge>
                        </TableCell>
                        <TableCell
                          className={`text-right font-mono ${
                            isOut ? "text-red-600" : "text-green-600"
                          }`}
                        >
                          {isOut ? "-" : "+"}
                          {tx.quantity}
                        </TableCell>
                        <TableCell className="text-right font-mono">
                          {formatMoney(tx.costPrice).vndFormatted}
                        </TableCell>
                        <TableCell>
                          {sourceUrl ? (
                            <a
                              href={sourceUrl}
                              className="text-primary hover:underline"
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              {tx.reference}
                            </a>
                          ) : (
                            <span className="text-muted-foreground">
                              {tx.reference}
                            </span>
                          )}
                        </TableCell>
                        <TableCell className="max-w-xs truncate text-muted-foreground text-sm">
                          {tx.note || "—"}
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>

          {/* Summary */}
          {!isPending && filteredTransactions.length > 0 && (
            <div className="text-sm text-muted-foreground text-right">
              Tổng số giao dịch:{" "}
              <span className="font-semibold">
                {filteredTransactions.length}
              </span>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
