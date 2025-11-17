import { DataTable } from "./data-table";
import { columns } from "./columns";
import type { PayrollItem } from "~/services/api/staff-payroll/dto";

interface PayrollsListProps {
  data: PayrollItem[];
  onSuccess?: () => void;
  onRowClick?: (row: PayrollItem) => void;
}

export default function PayrollsList({ data, onSuccess, onRowClick }: PayrollsListProps) {
  return <DataTable columns={columns} data={data} onSuccess={onSuccess} onRowClick={onRowClick} />;
}
