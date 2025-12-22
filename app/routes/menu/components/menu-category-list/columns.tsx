import { type ColumnDef } from "@tanstack/react-table";
import { format } from "date-fns";
import { DataTableColumnHeader } from "~/components/table/table-header";
import { Badge } from "~/components/ui/badge";
import { useAuth } from "~/lib/auth/components";
import { RouteModule } from "~/lib/auth/roles";
import type { MenuCategoryItemDto } from "~/services/api/menu-category/dto";
import MenuCategoryActionsCell from "../../fragments/menu-categories/actions.cell";

export const columns: ColumnDef<MenuCategoryItemDto>[] = [
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
        <Badge variant="outline" className="font-normal">
          {count} món
        </Badge>
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
        <Badge variant={isActive ? "success" : "warning"} className="text-xs">
          {isActive ? "Hoạt động" : "Ngưng"}
        </Badge>
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
    header: () => null,
    cell: ({ row }) => {
      const { can } = useAuth();
      if (can.update(RouteModule.MenuCategories))
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
