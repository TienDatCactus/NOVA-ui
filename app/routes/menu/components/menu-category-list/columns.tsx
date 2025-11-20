import { type ColumnDef } from "@tanstack/react-table";
import { format, parseISO } from "date-fns";
import { Badge } from "~/components/ui/badge";
import { Checkbox } from "~/components/ui/checkbox";
import { DataTableColumnHeader } from "~/components/table/table-header";
import type { MenuCategoryItemDto } from "~/services/api/menu-category/dto";
import MenuCategoryActionsCell from "../../fragments/menu-categories/actions.cell";

/**
 * Factory function to create columns with action callbacks
 * @param onEdit - Callback khi click edit
 */
export const columns: ColumnDef<MenuCategoryItemDto>[] = [
  {
    id: "select",
    header: ({ table }) => (
      <div className="flex items-center">
        <Checkbox
          checked={
            table.getIsAllPageRowsSelected() ||
            (table.getIsSomePageRowsSelected() && "indeterminate")
          }
          onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
          aria-label="Chọn tất cả"
        />
      </div>
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Chọn dòng"
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },
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
    accessorKey: "code",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Mã danh mục" />
    ),
    cell: ({ row }) => {
      return (
        <span className="font-mono text-sm font-medium">
          {row.original.code}
        </span>
      );
    },
  },
  {
    accessorKey: "name",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Tên danh mục" />
    ),
    cell: ({ row }) => {
      const category = row.original;

      return (
        <div className="flex items-center gap-2">
          <span className="font-semibold">{category.name}</span>
        </div>
      );
    },
  },
  {
    accessorKey: "menuItemCount",
    header: ({ column }) => (
      <DataTableColumnHeader
        column={column}
        title="Số món ăn"
        className="text-center"
      />
    ),
    cell: ({ row }) => {
      const count = row.original.menuItemCount;
      return (
        <div className="flex justify-center">
          <Badge variant="outline" className="font-normal">
            {count} món
          </Badge>
        </div>
      );
    },
  },
  {
    accessorKey: "active",
    header: ({ column }) => (
      <DataTableColumnHeader
        column={column}
        title="Trạng thái"
        className="text-center"
      />
    ),
    cell: ({ row }) => {
      const isActive = row.original.active;
      return (
        <div className="flex justify-center">
          <Badge variant={isActive ? "success" : "warning"} className="text-xs">
            {isActive ? "Hoạt động" : "Ngưng"}
          </Badge>
        </div>
      );
    },
  },
  {
    accessorKey: "createdAt",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Ngày tạo" />
    ),
    cell: ({ row }) => {
      const createdAt = row.original.createdAt;
      if (!createdAt) return <span className="text-muted-foreground">—</span>;

      return (
        <span className="text-sm text-muted-foreground">
          {format(createdAt, "dd/MM/yyyy")}
        </span>
      );
    },
  },
  {
    id: "actions",
    header: () => <p className="text-center">Thao tác</p>,
    cell: ({ row }) => {
      return (
        <div className="flex justify-center">
          <MenuCategoryActionsCell category={row.original} />
        </div>
      );
    },
    enableSorting: false,
    enableHiding: false,
  },
];
