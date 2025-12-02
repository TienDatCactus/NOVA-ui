import type { PurchaseRequestListDto } from "~/services/api/stocks/purchase-requests/dto";
import { columns } from "./columns";
import { DataTable } from "./data-table";
import { Skeleton } from "~/components/ui/skeleton";

interface PurchaseRequestsDataTableProps {
  purchaseRequests: PurchaseRequestListDto;
  isLoading?: boolean;
}

function PurchaseRequestsDataTable({
  purchaseRequests,
  isLoading,
}: PurchaseRequestsDataTableProps) {
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
      <DataTable columns={columns} data={purchaseRequests} />
    </div>
  );
}

export default PurchaseRequestsDataTable;
