import {
  CheckCircle,
  Download,
  Eye,
  MoreHorizontal,
  PackageCheck,
  Pencil,
  SquareX,
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
import PurchaseRequestDetailDialog from "../components/purchase-request-detail.dialog";
import ApproveRejectDialog from "./approve-reject.dialog";
import DeleteConfirmDialog from "./delete-confirm.dialog";
import ReceiveStockDialog from "./receive-stock.dialog";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "~/components/ui/tooltip";
import { PurchaseRequestsService } from "~/services/api/stocks/purchase-requests";
import { toast } from "sonner";

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
  const [openCancelDialog, setOpenCancelDialog] = useState(false);
  const [openReceiveDialog, setOpenReceiveDialog] = useState(false);

  const canEdit = purchaseRequest.status === "Draft";
  const canDelete =
    purchaseRequest.status === "Draft" ||
    purchaseRequest.status === "Rejected" ||
    purchaseRequest.status === "Cancelled";
  const canApprove = purchaseRequest.status === "Draft";
  const canReject = canApprove;
  const canCancel =
    purchaseRequest.status === "Draft" || purchaseRequest.status === "Approved";
  const canReceive =
    purchaseRequest.status === "Approved" && !purchaseRequest.isReceived;

  const hasAnyAction =
    canEdit || canDelete || canApprove || canReject || canCancel || canReceive;

  const handleExport = async () => {
    try {
      const blob = await PurchaseRequestsService.exportPurchaseRequest(
        purchaseRequest.id
      );
      console.log("Blob received:", blob);

      const url = window.URL.createObjectURL(blob as any);
      const a = document.createElement("a");
      a.href = url;
      const filename = `purchase-request-${purchaseRequest.id}.xlsx`;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);

      toast.success("Xuất báo cáo thành công");
    } catch (e) {
      console.error(e);
      toast.error("Xuất báo cáo thất bại");
    }
  };
  // Always show action button to allow viewing details
  return (
    <div className="flex justify-end items-center gap-2">
      {canApprove && (
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant={"success"}
              size={"icon"}
              onClick={() => setOpenApproveDialog(true)}
            >
              <CheckCircle className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Phê duyệt yêu cầu</TooltipContent>
        </Tooltip>
      )}

      {canReject && (
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="destructive"
              size={"icon"}
              onClick={() => setOpenRejectDialog(true)}
            >
              <XCircle className=" h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Từ chối yêu cầu</TooltipContent>
        </Tooltip>
      )}
      {hasAnyAction && (
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

            {canReceive && (
              <DropdownMenuItem onClick={() => setOpenReceiveDialog(true)}>
                <PackageCheck className="mr-2 h-4 w-4" />
                Nhận hàng vào kho
              </DropdownMenuItem>
            )}
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleExport} className="text-green-700">
              <Download className="mr-2 h-4 w-4 text-green-700" />
              Xuất phiếu
            </DropdownMenuItem>
            {canCancel && (
              <DropdownMenuItem
                variant="destructive"
                onClick={() => setOpenCancelDialog(true)}
              >
                <SquareX className="mr-2 h-4 w-4" />
                Hủy yêu cầu
              </DropdownMenuItem>
            )}

            {canDelete && (
              <DropdownMenuItem
                variant="destructive"
                onClick={() => setOpenDeleteDialog(true)}
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Xóa
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      )}

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

      <ApproveRejectDialog
        open={openCancelDialog}
        onClose={() => setOpenCancelDialog(false)}
        purchaseRequest={purchaseRequest}
        action="cancel"
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
