import { type ColumnDef } from "@tanstack/react-table";
import { Badge } from "~/components/ui/badge";
import { DataTableColumnHeader } from "~/components/table/table-header";
import { format, parseISO } from "date-fns";
import { vi } from "date-fns/locale";
import type { StockAdjustmentListItemDto } from "~/services/api/stocks/stock-adjustments/dto";
import StockAdjustmentActionCell from "../../fragments/stock-adjustment-action.cell";

export const columns: ColumnDef<StockAdjustmentListItemDto>[] = [
  {
    accessorKey: "reference",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Mã phiếu" />
    ),
    cell: ({ row }) => (
      <span className="font-mono text-sm font-medium">
        {row.original.reference}
      </span>
    ),
  },
  {
    accessorKey: "adjustmentDate",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Ngày điều chỉnh" />
    ),
    cell: ({ row }) => (
      <span className="text-sm">
        {format(parseISO(row.original.adjustmentDate), "dd/MM/yyyy HH:mm", {
          locale: vi,
        })}
      </span>
    ),
  },
  {
    accessorKey: "reason",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Lý do" />
    ),
    cell: ({ row }) => (
      <div className="max-w-md">
        <p className="text-sm line-clamp-2">{row.original.reason}</p>
      </div>
    ),
  },
  {
    accessorKey: "items",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Số mục" />
    ),
    cell: ({ row }) => (
      <div className="text-center">
        <span className="text-sm font-medium">{row.original.items.length}</span>
        <span className="text-xs text-muted-foreground ml-1">mục</span>
      </div>
    ),
    enableSorting: false,
  },
  {
    accessorKey: "isApplied",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Trạng thái" />
    ),
    cell: ({ row }) => {
      const isApplied = row.original.isApplied;
      return (
        <Badge variant={isApplied ? "default" : "outline"}>
          {isApplied ? "Đã áp dụng" : "Chưa áp dụng"}
        </Badge>
      );
    },
  },
  {
    id: "actions",
    header: () => null,
    cell: ({ row }) => <StockAdjustmentActionCell adjustment={row.original} />,
    enableSorting: false,
    enableHiding: false,
  },
];
