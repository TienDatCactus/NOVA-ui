import {
  CheckCircle,
  MoreHorizontal,
  PackageCheck,
  Pencil,
  Trash2,
  XCircle,
} from "lucide-react";
import React, { useState } from "react";
import { Button } from "~/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import type { PurchaseRequestListItemDto } from "~/services/api/stocks/purchase-requests/dto";
import EditPurchaseRequestDialog from "../components/edit-purchase-request.dialog";
import ApproveRejectDialog from "./approve-reject.dialog";
import DeleteConfirmDialog from "./delete-confirm.dialog";
import ReceiveStockDialog from "./receive-stock.dialog";

interface PurchaseRequestActionCellProps {
  purchaseRequest: PurchaseRequestListItemDto;
}

const PurchaseRequestActionCell: React.FC<PurchaseRequestActionCellProps> = ({
  purchaseRequest,
}) => {
  const [openEditDialog, setOpenEditDialog] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [openApproveDialog, setOpenApproveDialog] = useState(false);
  const [openRejectDialog, setOpenRejectDialog] = useState(false);
  const [openReceiveDialog, setOpenReceiveDialog] = useState(false);

  const canEdit = purchaseRequest.status === "Draft";
  const canDelete =
    purchaseRequest.status === "Draft" ||
    purchaseRequest.status === "Rejected" ||
    purchaseRequest.status === "Cancelled";
  const canApprove =
    purchaseRequest.status === "Draft" ||
    purchaseRequest.status === "PendingApproval";
  const canReject =
    purchaseRequest.status === "Draft" ||
    purchaseRequest.status === "PendingApproval";
  const canReceive =
    purchaseRequest.status === "Approved" && !purchaseRequest.isReceived;

  const hasAnyAction =
    canEdit || canDelete || canApprove || canReject || canReceive;

  if (!hasAnyAction) {
    return null;
  }

  return (
    <div className="flex justify-end">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="sm">
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>Thao tác</DropdownMenuLabel>
          <DropdownMenuSeparator />

          {canEdit && (
            <DropdownMenuItem onClick={() => setOpenEditDialog(true)}>
              <Pencil className="mr-2 h-4 w-4" />
              Chỉnh sửa
            </DropdownMenuItem>
          )}

          {canApprove && (
            <DropdownMenuItem onClick={() => setOpenApproveDialog(true)}>
              <CheckCircle className="mr-2 h-4 w-4" />
              Phê duyệt
            </DropdownMenuItem>
          )}

          {canReject && (
            <DropdownMenuItem
              className="text-destructive"
              onClick={() => setOpenRejectDialog(true)}
            >
              <XCircle className="mr-2 h-4 w-4" />
              Từ chối
            </DropdownMenuItem>
          )}

          {canReceive && (
            <DropdownMenuItem onClick={() => setOpenReceiveDialog(true)}>
              <PackageCheck className="mr-2 h-4 w-4" />
              Nhận hàng vào kho
            </DropdownMenuItem>
          )}

          {canDelete && (
            <>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="text-destructive"
                onClick={() => setOpenDeleteDialog(true)}
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Xóa
              </DropdownMenuItem>
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      {canEdit && (
        <EditPurchaseRequestDialog
          open={openEditDialog}
          onOpenChange={setOpenEditDialog}
          purchaseRequestId={purchaseRequest.id}
        />
      )}

      <DeleteConfirmDialog
        open={openDeleteDialog}
        onClose={() => setOpenDeleteDialog(false)}
        purchaseRequest={purchaseRequest}
      />

      <ApproveRejectDialog
        open={openApproveDialog}
        onClose={() => setOpenApproveDialog(false)}
        purchaseRequest={purchaseRequest}
        action="approve"
      />

      <ApproveRejectDialog
        open={openRejectDialog}
        onClose={() => setOpenRejectDialog(false)}
        purchaseRequest={purchaseRequest}
        action="reject"
      />

      {canReceive && (
        <ReceiveStockDialog
          open={openReceiveDialog}
          onOpenChange={setOpenReceiveDialog}
          purchaseRequestId={purchaseRequest.id}
        />
      )}
    </div>
  );
};

export default PurchaseRequestActionCell;
