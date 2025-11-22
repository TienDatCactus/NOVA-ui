import type { StockTransactionsResponseDto } from "~/services/api/stocks/items/dto";
import { transactionColumns } from "./columns";
import { DataTable } from "./data-table";

interface TransactionHistoryDataTableProps {
  transactions: StockTransactionsResponseDto;
  isLoading?: boolean;
}

export function TransactionHistoryDataTable({
  transactions,
}: TransactionHistoryDataTableProps) {
  return <DataTable columns={transactionColumns} data={transactions} />;
}

export { transactionColumns } from "./columns";
export { DataTable as TransactionDataTable } from "./data-table";
