import { type ColumnDef } from "@tanstack/react-table";
import { format, parseISO } from "date-fns";
import { vi } from "date-fns/locale";
import {
  Briefcase,
  Building2,
  DollarSign,
  PackageOpen,
  Receipt,
  Wrench,
  Zap,
} from "lucide-react";
import { useState } from "react";
import { DataTableColumnHeader } from "~/components/table/table-header";
import { Button } from "~/components/ui/button";
import { formatMoney } from "~/lib/utils";
import type { ExpenseListItemDto } from "~/services/api/expenses/dto";
import ExpensesActionCell from "../../fragments/expenses-action.cell";
import SourceTypeBadge from "../../fragments/source-type-badge";
import StatusBadge from "../../fragments/status-badge";
import { ExpenseDetailDialog } from "../expense-detail.dialog";

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
const CATEGORY_LABELS: Record<string, string> = {
  Procurement: "Mua sắm",
  Salary: "Lương",
  Utilities: "Tiện ích",
  Maintenance: "Bảo trì",
  Office: "Văn phòng",
  Other: "Khác",
};

export const columns: ColumnDef<ExpenseListItemDto>[] = [
  {
    accessorKey: "receiptNumber",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Số chứng từ" />
    ),
    cell: ({ row }) => {
      const [open, setOpen] = useState(false);
      return (
        <>
          <Button
            variant="link"
            onClick={() => setOpen(true)}
            className="font-mono text-sm p-0 text-muted-foreground hover:text-primary"
          >
            {row.original.receiptNumber}
          </Button>
          <ExpenseDetailDialog
            open={open}
            onClose={() => setOpen(false)}
            expenseId={row.original.id}
          />
        </>
      );
    },
  },
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
      const Label = CATEGORY_LABELS[row.original.categoryName];
      return (
        <div className="flex items-center gap-2">
          <Icon className="h-4 w-4 text-muted-foreground" />
          <span className="font-medium">{Label}</span>
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
    accessorKey: "status",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Trạng thái" />
    ),
    cell: ({ row }) => {
      return <StatusBadge status={row.original.status} />;
    },
  },
  {
    accessorKey: "sourceType",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Nguồn gốc" />
    ),
    cell: ({ row }) => {
      return <SourceTypeBadge sourceType={row.original.sourceType} />;
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
