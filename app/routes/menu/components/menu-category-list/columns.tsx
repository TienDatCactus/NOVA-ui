import { type ColumnDef } from "@tanstack/react-table";
import { Badge } from "~/components/ui/badge";
import { Checkbox } from "~/components/ui/checkbox";
import type { MenuCategoryItem } from "~/services/api/menu-category/dto";
import MenuCategoryActionsCell from "../../fragments/menu-category-actions.cell";

export const columns: ColumnDef<MenuCategoryItem>[] = [
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
    header: "STT",
    cell: ({ row }) => {
      return <span className="font-medium">{row.index + 1}</span>;
    },
  },
  {
    accessorKey: "code",
    header: "Mã danh mục",
    cell: ({ row }) => {
      const code = row.original.code;
      return (
        <div className="font-mono text-sm bg-muted px-2 py-1 rounded inline-block">
          {code}
        </div>
      );
    },
  },
  {
    accessorKey: "name",
    header: "Tên danh mục",
    cell: ({ row }) => {
      const category = row.original;

      return <span className="font-semibold">{category.name}</span>;
    },
  },
  {
    accessorKey: "active",
    header: () => <p className="text-center">Trạng thái</p>,
    cell: ({ row }) => {
      const active = row.original.active;
      return (
        <div className="flex justify-center">
          <Badge variant={active ? "default" : "secondary"}>
            {active ? "Hoạt động" : "Ngưng hoạt động"}
          </Badge>
        </div>
      );
    },
  },
  {
    id: "actions",
    header: () => null,
    cell: ({ row }) => {
      return <MenuCategoryActionsCell category={row.original} />;
    },
    enableSorting: false,
    enableHiding: false,
  },
];
