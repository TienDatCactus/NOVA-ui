import { Skeleton } from "~/components/ui/skeleton";
import type { StockItemsListDto } from "~/services/api/stocks/items/dto";
import { columns } from "./columns";
import { DataTable } from "./data-table";

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
