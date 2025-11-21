import { DataTable } from "./data-table";
import { columns } from "./columns";
import type { StockAdjustmentListDto } from "~/services/api/stocks/stock-adjustments/dto";

interface StockAdjustmentsDataTableProps {
  adjustments: StockAdjustmentListDto;
}

export default function StockAdjustmentsDataTable({
  adjustments,
}: StockAdjustmentsDataTableProps) {
  return <DataTable columns={columns} data={adjustments} />;
}
