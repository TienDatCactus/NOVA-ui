import { DataTable } from "./data-table";
import { columns } from "./columns";
import type { PayrollItemDto } from "~/services/api/staff/staff-payroll/dto";

interface PayrollsListProps {
  data: PayrollItemDto[];
}

export default function PayrollsList({ data }: PayrollsListProps) {
  return (
    <div className="mx-auto container">
      <DataTable columns={columns} data={data} />
    </div>
  );
}
