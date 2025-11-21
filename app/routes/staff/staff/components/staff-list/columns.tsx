import type { ColumnDef } from "@tanstack/react-table";
import { DataTableColumnHeader } from "~/components/table/table-header";
import type { StaffListItemDto } from "~/services/api/staff/staff/dto";
import StaffActionsCell from "../../fragments/actions.cell";
import { Button } from "~/components/ui/button";
import { useState } from "react";
import StaffDetailDialog from "../staff-detail-dialog";

interface StaffColumnsProps {
  onEdit?: (staff: StaffListItemDto) => void;
  onDelete?: (staff: StaffListItemDto) => void;
  onView?: (staff: StaffListItemDto) => void;
}

export const columns: ColumnDef<StaffListItemDto>[] = [
  {
    accessorKey: "index",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="STT" />
    ),
    cell: ({ row }) => (
      <div className="w-12 text-center font-medium">{row.index + 1}</div>
    ),
  },
  {
    accessorKey: "code",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Mã nhân sự" />
    ),
    cell: ({ row }) => {
      const [detailDialogOpen, setDetailDialogOpen] = useState(false);
      return (
        <>
          <Button
            variant="link"
            onClick={() => setDetailDialogOpen(true)}
            className="p-0 m-0 h-auto"
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
      <div className="min-w-[150px] font-medium">{row.original.fullName}</div>
    ),
  },
  {
    accessorKey: "phoneNumber",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Số điện thoại" />
    ),
    cell: ({ row }) => (
      <div className="font-mono text-sm">{row.original.phoneNumber || "-"}</div>
    ),
  },

  {
    id: "actions",
    header: "Thao tác",
    cell: ({ row }) => {
      return <StaffActionsCell staff={row.original} />;
    },
    enableSorting: false,
    enableHiding: false,
  },
];

