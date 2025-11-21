import type { ColumnDef } from "@tanstack/react-table";
import { format, parseISO } from "date-fns";
import { Badge } from "~/components/ui/badge";
import CategoryActionCell from "../../fragments/category-action.cell";
import type { ItemCategoryListItemDto } from "~/services/api/stocks/item-category/dto";
import { DataTableColumnHeader } from "~/components/table/table-header";

export const columns: ColumnDef<ItemCategoryListItemDto>[] = [
  {
    accessorKey: "name",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Tên danh mục" />
    ),
    cell: ({ row }) => {
      const name = row.getValue("name") as string;
      return <div className="font-medium">{name}</div>;
    },
  },
  {
    accessorKey: "description",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Mô tả" />
    ),
    cell: ({ row }) => {
      const description = row.original.description;
      return (
        <div className="max-w-md text-sm text-muted-foreground">
          {description || "—"}
        </div>
      );
    },
  },
  {
    accessorKey: "itemCount",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Số lượng hàng" />
    ),
    cell: ({ row }) => {
      const count = row.getValue("itemCount") as number;
      return <pre className="text-center">{count}</pre>;
    },
  },
  {
    accessorKey: "isActive",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Trạng thái" />
    ),
    cell: ({ row }) => {
      const isActive = row.getValue("isActive") as boolean;
      return (
        <Badge variant={isActive ? "default" : "secondary"}>
          {isActive ? "Hoạt động" : "Ngừng hoạt động"}
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
      const date = row.getValue("createdAt") as string;
      return (
        <div className="text-sm text-muted-foreground">
          {format(parseISO(date), "dd/MM/yyyy HH:mm")}
        </div>
      );
    },
  },
  {
    id: "actions",
    header: "Thao tác",
    cell: ({ row }) => <CategoryActionCell category={row.original} />,
  },
];
