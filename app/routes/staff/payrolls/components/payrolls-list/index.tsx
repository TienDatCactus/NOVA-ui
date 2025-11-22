import { DataTable } from "./data-table";
import { columns } from "./columns";
import type { PayrollItemDto } from "~/services/api/staff/staff-payroll/dto";

interface PayrollsListProps {
  data: PayrollItemDto[];
  onSuccess?: () => void;
  onRowClick?: (row: PayrollItemDto) => void;
}

export default function PayrollsList({
  data,
  onSuccess,
  onRowClick,
}: PayrollsListProps) {
  return (
    <DataTable
      columns={columns}
      data={data}
      onSuccess={onSuccess}
      onRowClick={onRowClick}
    />
  );
}
