import type { ColumnDef } from "@tanstack/react-table";
import { Badge } from "~/components/ui/badge";
import { DataTableColumnHeader } from "~/components/table/table-header";
import type { UserItem } from "~/services/api/user/dto";
import {
  getRoleBadgeColors,
  getRoleDisplayName,
} from "~/services/types/users.types";
import ActionsMenuCell from "../../fragments/actions.cell";

export const columns: ColumnDef<UserItem>[] = [
  {
    accessorKey: "fullName",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Họ và tên" />
    ),
    cell: ({ row }) => (
      <span className="font-medium">{row.getValue("fullName")}</span>
    ),
  },
  {
    accessorKey: "email",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Email" />
    ),
    cell: ({ row }) => (
      <div className="flex items-center gap-2">
        <span className="text-sm">{row.getValue("email")}</span>
      </div>
    ),
  },
  {
    accessorKey: "phoneNumber",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Số điện thoại" />
    ),
    cell: ({ row }) => (
      <span className="text-muted-foreground">
        {row.getValue("phoneNumber")}
      </span>
    ),
  },
  {
    accessorKey: "roles",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Vai trò" />
    ),
    cell: ({ row }) => {
      const roles = row.getValue("roles") as string[];
      return (
        <div className="flex gap-1 flex-wrap">
          {roles.map((role) => {
            const colors = getRoleBadgeColors(role);
            return (
              <Badge
                key={role}
                variant="outline"
                className={`text-xs ${colors.bg} ${colors.text} ${colors.border} shadow-sm`}
              >
                {getRoleDisplayName(role)}
              </Badge>
            );
          })}
        </div>
      );
    },
  },
  {
    id: "status",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Trạng thái" />
    ),
    cell: ({ row }) => {
      const user = row.original;

      // Check if user is locked: lockoutEnd exists and is in the future
      const isLocked =
        user.lockoutEnd && new Date(user.lockoutEnd) > new Date();

      return isLocked ? (
        <Badge variant="destructive" className="shadow-sm">
          Bị khóa
        </Badge>
      ) : (
        <Badge
          variant="outline"
          className="bg-emerald-50 text-emerald-700 border-emerald-200 shadow-sm"
        >
          Hoạt động
        </Badge>
      );
    },
  },
  {
    id: "actions",
    header: () => <div className="text-center">Thao tác</div>,
    cell: ({ row, table }) => {
      const user = row.original;
      const onViewDetail = (table.options.meta as any)?.onViewDetail;
      const onSuccess = (table.options.meta as any)?.onSuccess;

      return (
        <div className="flex justify-center">
          <ActionsMenuCell
            user={user}
            onViewDetail={onViewDetail}
            onSuccess={onSuccess}
          />
        </div>
      );
    },
    enableSorting: false,
    enableHiding: false,
  },
];
