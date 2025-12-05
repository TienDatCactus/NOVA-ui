import type { ColumnDef } from "@tanstack/react-table";
import { useState } from "react";
import { DataTableColumnHeader } from "~/components/table/table-header";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import type { StaffListItemDto } from "~/services/api/staff/staff/dto";
import StaffActionsCell from "../../fragments/actions.cell";
import StaffDetailDialog from "../staff-detail-dialog";

const getGenderLabel = (gender?: string | null) => {
  if (!gender) return "-";
  const map: Record<string, string> = {
    Male: "Nam",
    Female: "Nữ",
    Other: "Khác",
  };
  return map[gender] || gender;
};

export const columns: ColumnDef<StaffListItemDto>[] = [
  {
    accessorKey: "index",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="STT" />
    ),
    cell: ({ row }) => (
      <div className="w-12 text-center font-medium text-muted-foreground">
        {row.index + 1}
      </div>
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: "code",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Mã nhân sự" />
    ),
    cell: ({ row }) => {
      // eslint-disable-next-line react-hooks/rules-of-hooks
      const [detailDialogOpen, setDetailDialogOpen] = useState(false);

      return (
        <>
          <Button
            variant="link"
            onClick={() => setDetailDialogOpen(true)}
            className="p-0 m-0 h-auto font-semibold text-primary"
          >
            {row.original.code}
          </Button>
          <StaffDetailDialog
            open={detailDialogOpen}
            onOpenChange={setDetailDialogOpen}
            staffId={row.original.id}
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
      <div className="flex flex-col">
        <span className="font-medium">{row.original.fullName}</span>
        <span className="text-xs text-muted-foreground md:hidden">
          {row.original.email}
        </span>
      </div>
    ),
  },
  {
    accessorKey: "staffRoleName",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Chức vụ" />
    ),
    cell: ({ row }) => (
      <div className="flex items-center">
        <Badge variant="outline" className="font-normal">
          {row.original.staffRoleName || "Chưa phân quyền"}
        </Badge>
      </div>
    ),
  },

  {
    accessorKey: "gender",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Giới tính" />
    ),
    cell: ({ row }) => (
      <div className="text-sm">{getGenderLabel(row.original.gender)}</div>
    ),
  },
  {
    accessorKey: "status",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Trạng thái" />
    ),
    cell: ({ row }) => {
      const status = row.original.status;
      return (
        <Badge
          variant={status == "Active" ? "success" : "destructive"}
          className="font-normal"
        >
          {status == "Active" ? "Hoạt động" : "Không hoạt động"}
        </Badge>
      );
    },
  },
  {
    id: "actions",
    header: ({ column }) => (
      <DataTableColumnHeader
        column={column}
        title="Thao tác"
        className="text-center"
      />
    ),
    cell: ({ row }) => (
      <div className="flex justify-center">
        <StaffActionsCell staff={row.original} />
      </div>
    ),
    enableSorting: false,
    enableHiding: false,
  },
];
