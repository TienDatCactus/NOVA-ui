import { type ColumnDef } from "@tanstack/react-table";
import { Badge } from "~/components/ui/badge";
import { Checkbox } from "~/components/ui/checkbox";
import { DataTableColumnHeader } from "~/components/table/table-header";
import { cn, formatMoney } from "~/lib/utils";
import type { MenuListItemDto } from "~/services/api/menu/dto";
import MenuActionsCell from "../../fragments/menu/actions.cell";
import { ChevronDown, ImageIcon } from "lucide-react";
import Image from "~/components/ui/image";
import { Button } from "~/components/ui/button";

export const columns: ColumnDef<MenuListItemDto>[] = [
  {
    accessorKey: "index",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="STT" />
    ),
    cell: ({ row }) => {
      return <span className="font-medium">{row.index + 1}</span>;
    },
  },

  {
    accessorKey: "name",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Tên món" />
    ),
    cell: ({ row }) => {
      const item = row.original;

      return (
        <div className="flex items-center gap-3">
          <div className="space-y-1 flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className="font-semibold truncate">{item.name}</span>
              {!item.active && (
                <Badge variant="secondary" className="text-xs">
                  Ngưng hoạt động
                </Badge>
              )}
            </div>
            <p className="text-xs text-muted-foreground truncate">
              {item.code}
            </p>
          </div>
          {row.getCanExpand() && (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => row.toggleExpanded()}
            >
              <ChevronDown
                className={cn(
                  "h-4 w-4 transition-transform duration-200",
                  row.getIsExpanded() && "rotate-180"
                )}
              />
            </Button>
          )}
        </div>
      );
    },
  },
  {
    accessorKey: "maxQuantityAvailable",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Số lượng tối đa" />
    ),
    cell: ({ row }) => {
      const maxQuantityAvailable = row.original.maxQuantityAvailable || "—";
      return <p className="text-center">{maxQuantityAvailable}</p>;
    },
  },
  {
    accessorKey: "description",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Mô tả" />
    ),
    cell: ({ row }) => {
      const description = row.original.description || "—";
      return (
        <p className="text-sm text-muted-foreground truncate max-w-xs">
          {description}
        </p>
      );
    },
  },
  {
    accessorKey: "unitName",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Đơn vị" />
    ),
    cell: ({ row }) => {
      return (
        <Badge variant="outline" className="font-normal">
          {row.original.unitName}
        </Badge>
      );
    },
  },
  {
    accessorKey: "components",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Trạng thái" />
    ),
    cell: ({ row }) => {
      const active = row.original.active ? "Hoạt động" : "Ngưng hoạt động";

      return (
        <div className="flex items-center gap-1">
          <Badge
            variant={active ? "success" : "destructive"}
            className="text-xs"
          >
            {active}
          </Badge>
        </div>
      );
    },
  },
  {
    accessorKey: "price",
    header: () => <p className="text-end">Giá</p>,
    cell: ({ row }) => {
      const price = row.original.price;
      return (
        <p className="text-end font-semibold">
          {formatMoney(price).vndFormatted}
        </p>
      );
    },
  },
  {
    id: "actions",
    header: () => <p className="text-center">Thao tác</p>,
    cell: ({ row }) => {
      return (
        <div className="flex justify-center">
          <MenuActionsCell menuItem={row.original} />
        </div>
      );
    },
    enableSorting: false,
    enableHiding: false,
  },
];
