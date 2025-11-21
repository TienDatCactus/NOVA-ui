import type { PurchaseRequestListDto } from "~/services/api/stocks/purchase-requests/dto";
import { columns } from "./columns";
import { DataTable } from "./data-table";

interface PurchaseRequestsDataTableProps {
  purchaseRequests: PurchaseRequestListDto;
  isLoading?: boolean;
}

function PurchaseRequestsDataTable({
  purchaseRequests,
}: PurchaseRequestsDataTableProps) {
  return <DataTable columns={columns} data={purchaseRequests} />;
}

export default PurchaseRequestsDataTable;
