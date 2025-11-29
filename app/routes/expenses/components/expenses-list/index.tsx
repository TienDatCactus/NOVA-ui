import type { ExpenseListResponseDto } from "~/services/api/expenses/dto";
import { columns } from "./columns";
import { DataTable } from "./data-table";

interface ExpensesDataTableProps {
  expenses: ExpenseListResponseDto;
}

export default function ExpensesDataTable({
  expenses,
}: ExpensesDataTableProps) {
  return <DataTable columns={columns} data={expenses} />;
}
