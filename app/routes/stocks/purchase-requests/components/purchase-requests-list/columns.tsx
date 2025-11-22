import { type ColumnDef } from "@tanstack/react-table";
import { Badge } from "~/components/ui/badge";
import { DataTableColumnHeader } from "~/components/table/table-header";
import type { PurchaseRequestListItemDto } from "~/services/api/stocks/purchase-requests/dto";
import { format, parseISO } from "date-fns";
import { vi } from "date-fns/locale";
import PurchaseRequestActionCell from "../../fragments/purchase-request-action.cell";
import { Button } from "~/components/ui/button";
import { useState } from "react";
import PurchaseRequestDetailDialog from "../purchase-request-detail.dialog";

export const getStatusBadge = (status: string) => {
  const variants: Record<
    string,
    {
      variant: "default" | "secondary" | "destructive" | "outline";
      label: string;
    }
  > = {
    Draft: { variant: "secondary", label: "Nháp" },
    PendingApproval: { variant: "outline", label: "Chờ duyệt" },
    Approved: { variant: "default", label: "Đã duyệt" },
    Rejected: { variant: "destructive", label: "Từ chối" },
    Fulfilled: { variant: "default", label: "Đã nhận hàng" },
    Cancelled: { variant: "secondary", label: "Đã hủy" },
  };

  const config = variants[status] || variants.Draft;
  return <Badge variant={config.variant}>{config.label}</Badge>;
};
export const columns: ColumnDef<PurchaseRequestListItemDto>[] = [
  {
    accessorKey: "requestNumber",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Số phiếu" />
    ),
    cell: ({ row }) => {
      const [openDetailDialog, setOpenDetailDialog] = useState(false);

      return (
        <>
          <Button
            variant="link"
            size="sm"
            onClick={() => setOpenDetailDialog(true)}
          >
            {row.original.requestNumber}
          </Button>
          <PurchaseRequestDetailDialog
            open={openDetailDialog}
            onOpenChange={setOpenDetailDialog}
            purchaseRequestId={row.original.id}
          />
        </>
      );
    },
  },
  {
    accessorKey: "requestedAt",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Ngày tạo" />
    ),
    cell: ({ row }) => {
      return (
        <span className="text-sm">
          {format(parseISO(row.original.requestedAt), "dd/MM/yyyy HH:mm", {
            locale: vi,
          })}
        </span>
      );
    },
  },
  {
    accessorKey: "status",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Trạng thái" />
    ),
    cell: ({ row }) => {
      return getStatusBadge(row.original.status);
    },
  },
  {
    accessorKey: "items",
    header: ({ column }) => (
      <DataTableColumnHeader
        column={column}
        title="Số mặt hàng"
        className="justify-center"
      />
    ),
    cell: ({ row }) => {
      return (
        <div className="text-center">
          <span className="font-semibold">{row.original.items.length}</span>
          <span className="text-xs text-muted-foreground ml-1">mặt hàng</span>
        </div>
      );
    },
  },
  {
    accessorKey: "approvedByName",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Người duyệt" />
    ),
    cell: ({ row }) => {
      return (
        <span className="text-sm">
          {row.original.approvedByName || (
            <span className="text-muted-foreground italic">Chưa duyệt</span>
          )}
        </span>
      );
    },
  },
  {
    accessorKey: "isReceived",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Nhận hàng" />
    ),
    cell: ({ row }) => {
      return row.original.isReceived ? (
        <Badge variant="default">Đã nhận</Badge>
      ) : (
        <Badge variant="secondary">Chưa nhận</Badge>
      );
    },
  },
  {
    id: "actions",
    header: () => null,
    cell: ({ row }) => {
      return <PurchaseRequestActionCell purchaseRequest={row.original} />;
    },
    enableSorting: false,
    enableHiding: false,
  },
];
