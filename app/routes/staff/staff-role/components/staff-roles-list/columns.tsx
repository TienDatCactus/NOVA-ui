import type { ColumnDef } from "@tanstack/react-table";
import { DataTableColumnHeader } from "~/components/table/table-header";
import type { StaffRoleItem } from "~/services/api/staff/staff-role/dto";
import RoleActionCell from "../../fragments/actions.cell";

export const columns: ColumnDef<StaffRoleItem>[] = [
  {
    accessorKey: "code",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Mã vai trò" />
    ),
    cell: ({ row }) => {
      const code = row.getValue("code") as string;
      return <div className="font-mono text-sm font-medium">{code}</div>;
    },
  },
  {
    accessorKey: "name",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Tên vai trò" />
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
    id: "actions",
    header: "Thao tác",
    cell: ({ row }) => <RoleActionCell role={row.original} />,
  },
];
