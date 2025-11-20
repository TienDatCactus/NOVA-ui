import type { StockItemsListDto } from "~/services/api/stocks/items/dto";
import { DataTable } from "./data-table";
import { columns } from "./columns";

interface StockItemsDataTableProps {
  items: StockItemsListDto;
  isLoading?: boolean;
}

function StockItemsDataTable({ items }: StockItemsDataTableProps) {
  return <DataTable columns={columns} data={items} />;
}

export default StockItemsDataTable;
