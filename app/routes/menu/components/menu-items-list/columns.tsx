import type { ColumnDef } from "@tanstack/react-table";
import { Checkbox } from "~/components/ui/checkbox";
import { Badge } from "~/components/ui/badge";
import type { MenuItem } from "~/services/api/menu-item/dto";
import MenuItemActionsCell from "../../fragments/menu-items/menu-item-actions.cell";

interface GetColumnsProps {
  onEdit: (menuItem: MenuItem) => void;
  onDelete: (menuItem: MenuItem) => void;
}

export const getColumns = ({ onEdit, onDelete }: GetColumnsProps): ColumnDef<MenuItem>[] => [
  {
    id: "select",
    header: ({ table }) => (
      <Checkbox
        checked={table.getIsAllPageRowsSelected()}
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Select all"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Select row"
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: "code",
    header: "Mã món",
    cell: ({ row }) => (
      <div className="font-medium">{row.getValue("code")}</div>
    ),
  },
  {
    accessorKey: "name",
    header: "Tên món",
    cell: ({ row }) => {
      return (
        <div className="flex flex-col">
          <span className="font-medium">{row.getValue("name")}</span>
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
    accessorKey: "unitName",
    header: "Đơn vị",
    cell: ({ row }) => (
      <span className="text-sm">{row.getValue("unitName")}</span>
    ),
  },
  {
    accessorKey: "price",
    header: () => <div className="text-right">Giá bán</div>,
    cell: ({ row }) => {
      const price = row.getValue("price") as number;
      return (
        <div className="text-right font-medium">
          {new Intl.NumberFormat("vi-VN", {
            style: "currency",
            currency: "VND",
          }).format(price)}
        </div>
      );
    },
  },
  {
    accessorKey: "active",
    header: "Trạng thái",
    cell: ({ row }) => {
      const active = row.getValue("active") as boolean;
      return (
        <Badge variant={active ? "default" : "secondary"}>
          {active ? "Đang bán" : "Ngừng bán"}
        </Badge>
      );
    },
  },
  {
    id: "actions",
    header: () => <div className="text-right">Thao tác</div>,
    cell: ({ row }) => (
      <MenuItemActionsCell 
        menuItem={row.original} 
        onEdit={onEdit}
        onDelete={onDelete}
      />
    ),
  },
];
