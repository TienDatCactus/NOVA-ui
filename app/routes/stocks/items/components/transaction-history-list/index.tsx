import type { StockTransactionsResponseDto } from "~/services/api/stocks/items/dto";
import { transactionColumns } from "./columns";
import { DataTable } from "./data-table";
import { Skeleton } from "~/components/ui/skeleton";

interface TransactionHistoryDataTableProps {
  transactions: StockTransactionsResponseDto;
  isLoading?: boolean;
}

export function TransactionHistoryDataTable({
  transactions,
  isLoading,
}: TransactionHistoryDataTableProps) {
  if (isLoading) {
    return (
      <div className="flex flex-col gap-2">
        {Array(8)
          .fill(0)
          .map((_, index) => (
            <Skeleton key={index} className="h-10 w-full" />
          ))}
      </div>
    );
  }
  return (
    <div className="mx-auto container">
      <DataTable columns={transactionColumns} data={transactions} />
    </div>
  );
}
