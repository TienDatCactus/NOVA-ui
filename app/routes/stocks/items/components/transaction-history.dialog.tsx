import { useState, useMemo } from "react";
import { format, subDays } from "date-fns";
import { History } from "lucide-react";
import { Button } from "~/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog";
import { Skeleton } from "~/components/ui/skeleton";
import { useStockItemTransactions } from "../container/query.hooks";
import { TransactionFilters } from "../fragments/transaction-filters";
import type { StockTransactionsItemDto } from "~/services/api/stocks/items/dto";
import {
  Empty,
  EmptyDescription,
  EmptyMedia,
  EmptyTitle,
} from "~/components/ui/empty";
import { TransactionHistoryDataTable } from "./transaction-history-list";

interface TransactionHistoryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  itemId: string;
  itemName: string;
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

          {/* Table with DataTable */}
          {isPending ? (
            <div className="space-y-2">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : filteredTransactions.length === 0 ? (
            <div className="border rounded-lg p-12">
              <Empty>
                <EmptyMedia variant={"icon"}>
                  <History />
                </EmptyMedia>
                <EmptyTitle>Không có giao dịch nào</EmptyTitle>
                <EmptyDescription>
                  Chưa có giao dịch nào trong khoảng thời gian này
                </EmptyDescription>
              </Empty>
            </div>
          ) : (
            <TransactionHistoryDataTable
              transactions={filteredTransactions}
              isLoading={isPending}
            />
          )}

          {/* Summary */}
          {!isPending && filteredTransactions.length > 0 && (
            <div className="flex justify-between items-center text-sm text-muted-foreground">
              <div>Hiển thị {filteredTransactions.length} giao dịch</div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
