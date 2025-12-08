import type { ColumnDef } from "@tanstack/react-table";
import { Badge } from "~/components/ui/badge";
import { DataTableColumnHeader } from "~/components/table/table-header";
import type { UserItem } from "~/services/api/user/dto";
import {
  getRoleBadgeColors,
  getRoleDisplayName,
} from "~/services/types/users.types";
import ActionsMenuCell from "../../fragments/actions.cell";
import { Button } from "~/components/ui/button";
import { useState } from "react";
import { UserDetailDialog } from "../user-detail-dialog";

export const columns: ColumnDef<UserItem>[] = [
  {
    accessorKey: "userName",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Tên tài khoản" />
    ),
    cell: ({ row }) => {
      const [openDetailDialog, setOpenDetailDialog] = useState(false);
      return (
        <>
          <Button
            onClick={() => setOpenDetailDialog(true)}
            variant="link"
            size="sm"
          >
            {row.getValue("fullName")}
          </Button>
          <UserDetailDialog
            open={openDetailDialog}
            user={row.original}
            onClose={() => setOpenDetailDialog(false)}
          />
        </>
      );
    },
  },
  {
    accessorKey: "fullName",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Họ và tên" />
    ),
    cell: ({ row }) => (
      <div className="flex items-center gap-2">
        <span className="text-sm">{row.getValue("fullName")}</span>
      </div>
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

      const isLocked =
        user.lockoutEnd && new Date(user.lockoutEnd) > new Date();

      return isLocked ? (
        <Badge variant="destructive">Bị khóa</Badge>
      ) : (
        <Badge variant="success">Hoạt động</Badge>
      );
    },
  },
  {
    id: "actions",
    header: () => <div className="text-center">Thao tác</div>,
    cell: ({ row, table }) => {
      const user = row.original;

      return (
        <div className="flex justify-center">
          <ActionsMenuCell user={user} />
        </div>
      );
    },
    enableSorting: false,
    enableHiding: false,
  },
];
