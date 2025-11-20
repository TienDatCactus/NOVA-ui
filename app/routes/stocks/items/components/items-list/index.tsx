import type { RoomListItemDto } from "~/services/api/rooms/dto";
import type { StockItemsListDto } from "~/services/api/stocks/items/dto";
import { DataTable } from "./data-table";
import { columns } from "./columns";

interface StockItemsDataTableProps {
  items: StockItemsListDto;
  isLoading?: boolean;
}

function StockItemsDataTable({ items }: StockItemsDataTableProps) {
  return (
    <div className="container mx-auto py-10">
      <DataTable columns={columns} data={items} />{" "}
    </div>
  );
}

export default StockItemsDataTable;
