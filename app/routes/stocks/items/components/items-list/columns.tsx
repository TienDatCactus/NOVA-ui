import { type ColumnDef } from "@tanstack/react-table";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import { DataTableColumnHeader } from "~/components/table/table-header";
import type { StockItemsListItemDto } from "~/services/api/stocks/items/dto";
import {
  ChevronDown,
  ChevronRight,
  MoreHorizontal,
  Pencil,
  Trash2,
} from "lucide-react";
import { formatMoney } from "~/lib/utils";
import ItemsActionCell from "../../fragments/items-action.cell";

export const columns: ColumnDef<StockItemsListItemDto>[] = [
  {
    accessorKey: "code",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Mã hàng hóa" />
    ),
    cell: ({ row }) => {
      return (
        <div className="flex items-center gap-2">
          <span className="font-mono text-sm font-medium">
            {row.original.code}
          </span>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => row.toggleExpanded()}
          >
            {row.getIsExpanded() ? (
              <ChevronDown className="h-4 w-4" />
            ) : (
              <ChevronRight className="h-4 w-4" />
            )}
          </Button>
        </div>
      );
    },
  },
  {
    accessorKey: "name",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Tên hàng hóa" />
    ),
    cell: ({ row }) => {
      return (
        <div className="flex flex-col gap-1">
          <span className="font-medium">{row.original.name}</span>
          {row.original.description && (
            <span className="text-xs text-muted-foreground line-clamp-1">
              {row.original.description}
            </span>
          )}
        </div>
      );
    },
  },
  {
    accessorKey: "categoryName",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Danh mục" />
    ),
    cell: ({ row }) => {
      return <span className="text-sm">{row.original.categoryName}</span>;
    },
  },
  {
    accessorKey: "currentStock",
    header: ({ column }) => (
      <DataTableColumnHeader
        column={column}
        title="Tồn kho"
        className="justify-end"
      />
    ),
    cell: ({ row }) => {
      const currentStock = row.original.currentStock ?? 0;
      const minStock = row.original.minStock ?? 0;
      const isLowStock = currentStock < minStock && minStock > 0;
      return (
        <div className="text-center font-mono ">
          <span
            className={`font-semibold ${isLowStock ? "text-destructive" : ""}`}
          >
            {currentStock}
          </span>
          <span className="text-xs text-muted-foreground ml-1">
            {row.original.unitName}
          </span>
        </div>
      );
    },
  },
  {
    accessorKey: "averageCost",
    header: ({ column }) => (
      <DataTableColumnHeader
        column={column}
        title="Giá trung bình"
        className="justify-end"
      />
    ),
    cell: ({ row }) => {
      return (
        <div className="text-center font-mono text-sm">
          {formatMoney(row.original.averageCost ?? 0).vndFormatted}
        </div>
      );
    },
  },
  {
    accessorKey: "isActive",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Trạng thái" />
    ),
    cell: ({ row }) => {
      return (
        <Badge variant={row.original.isActive ? "default" : "secondary"}>
          {row.original.isActive ? "Hoạt động" : "Ngừng"}
        </Badge>
      );
    },
  },
  {
    id: "actions",
    header: () => null,
    cell: ({ row }) => {
      return <ItemsActionCell item={row.original} />;
    },
    enableSorting: false,
    enableHiding: false,
  },
];
