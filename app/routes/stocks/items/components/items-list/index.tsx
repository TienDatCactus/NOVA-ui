import type { RoomListItemDto } from "~/services/api/rooms/dto";
import type { StockItemsListDto } from "~/services/api/stocks/items/dto";
import { DataTable } from "./data-table";
import { columns } from "./columns";
import { Skeleton } from "~/components/ui/skeleton";

interface StockItemsDataTableProps {
  items: StockItemsListDto;
  isLoading?: boolean;
}

function StockItemsDataTable({ items, isLoading }: StockItemsDataTableProps) {
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
    <div className="container mx-auto ">
      <DataTable columns={columns} data={items} />
    </div>
  );
}

export default StockItemsDataTable;
