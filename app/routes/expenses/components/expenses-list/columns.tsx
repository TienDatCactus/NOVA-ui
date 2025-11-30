import { type ColumnDef } from "@tanstack/react-table";
import { format, parseISO } from "date-fns";
import { vi } from "date-fns/locale";
import {
  Building2,
  Briefcase,
  Receipt,
  Wrench,
  Zap,
  PackageOpen,
  DollarSign,
} from "lucide-react";
import { DataTableColumnHeader } from "~/components/table/table-header";
import { formatMoney } from "~/lib/utils";
import type { ExpenseListItemDto } from "~/services/api/expenses/dto";
import ExpensesActionCell from "../../fragments/expenses-action.cell";

// Category icon mapping
const CATEGORY_ICONS: Record<
  string,
  React.ComponentType<{ className?: string }>
> = {
  Procurement: PackageOpen,
  Salary: Briefcase,
  Utilities: Zap,
  Maintenance: Wrench,
  Office: Building2,
  Other: Receipt,
};

export const columns: ColumnDef<ExpenseListItemDto>[] = [
  {
    accessorKey: "expenseDate",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Ngày chi" />
    ),
    cell: ({ row }) => {
      const date = parseISO(row.original.expenseDate);
      return (
        <div className="whitespace-nowrap">
          <div className="text-sm font-medium">
            {format(date, "dd/MM/yyyy", { locale: vi })}
          </div>
          <div className="text-xs text-muted-foreground">
            {format(date, "EEEE", { locale: vi })}
          </div>
        </div>
      );
    },
    sortingFn: "datetime",
  },
  {
    accessorKey: "category",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Danh mục" />
    ),
    cell: ({ row }) => {
      const Icon = CATEGORY_ICONS[row.original.category] || DollarSign;
      return (
        <div className="flex items-center gap-2">
          <Icon className="h-4 w-4 text-muted-foreground" />
          <span className="font-medium">{row.original.categoryName}</span>
        </div>
      );
    },
  },
  {
    accessorKey: "description",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Mô tả" />
    ),
    cell: ({ row }) => {
      return (
        <div className="max-w-[400px]">
          <p className="line-clamp-2 text-sm">{row.original.description}</p>
        </div>
      );
    },
  },
  {
    accessorKey: "amount",
    header: ({ column }) => (
      <DataTableColumnHeader
        column={column}
        title="Số tiền"
        className="justify-end"
      />
    ),
    cell: ({ row }) => {
      return (
        <div className="text-right">
          <div className="font-mono text-sm font-semibold">
            {formatMoney(row.original.amount).vndFormatted}
          </div>
        </div>
      );
    },
  },
  {
    accessorKey: "paymentMethodName",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Phương thức" />
    ),
    cell: ({ row }) => {
      return (
        <span className="text-sm font-medium">
          {row.original.paymentMethodName}
        </span>
      );
    },
  },
  {
    accessorKey: "receiptNumber",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Số chứng từ" />
    ),
    cell: ({ row }) => {
      return (
        <span className="font-mono text-xs text-muted-foreground">
          {row.original.receiptNumber}
        </span>
      );
    },
  },
  {
    id: "actions",
    header: () => null,
    cell: ({ row }) => {
      return <ExpensesActionCell expense={row.original} />;
    },
    enableSorting: false,
    enableHiding: false,
  },
];
