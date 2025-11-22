import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "~/components/ui/alert-dialog";
import { Textarea } from "~/components/ui/textarea";
import { Label } from "~/components/ui/label";
import { useState } from "react";
import {
  useApprovePurchaseRequest,
  useRejectPurchaseRequest,
  useCancelPurchaseRequest,
} from "../container/query.hooks";
import type { PurchaseRequestListItemDto } from "~/services/api/stocks/purchase-requests/dto";

interface ApproveRejectDialogProps {
  open: boolean;
  onClose: () => void;
  purchaseRequest: PurchaseRequestListItemDto;
  action: "approve" | "reject" | "cancel";
}

export default function ApproveRejectDialog({
  open,
  onClose,
  purchaseRequest,
  action,
}: ApproveRejectDialogProps) {
  const [reason, setReason] = useState("");

  const { mutate: approvePR, isPending: isApproving } =
    useApprovePurchaseRequest();
  const { mutate: rejectPR, isPending: isRejecting } =
    useRejectPurchaseRequest();
  const { mutate: cancelPR, isPending: isCancelling } =
    useCancelPurchaseRequest();

  const isPending =
    action === "approve"
      ? isApproving
      : action === "reject"
        ? isRejecting
        : isCancelling;

  const handleAction = () => {
    if (action === "approve") {
      approvePR(purchaseRequest.id, {
        onSuccess: () => {
          onClose();
        },
      });
    } else if (action === "reject") {
      rejectPR(
        { id: purchaseRequest.id, reason: reason || undefined },
        {
          onSuccess: () => {
            setReason("");
            onClose();
          },
        }
      );
    } else {
      cancelPR(
        { id: purchaseRequest.id, reason: reason || undefined },
        {
          onSuccess: () => {
            setReason("");
            onClose();
          },
        }
      );
    }
  };

  const isApprove = action === "approve";
  const isCancel = action === "cancel";
  const needsReason = !isApprove;

  return (
    <AlertDialog open={open} onOpenChange={onClose}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>
            {isApprove
              ? "Xác nhận phê duyệt"
              : isCancel
                ? "Xác nhận hủy"
                : "Xác nhận từ chối"}
          </AlertDialogTitle>
          <AlertDialogDescription>
            Bạn có chắc chắn muốn{" "}
            {isApprove ? "phê duyệt" : isCancel ? "hủy" : "từ chối"} yêu cầu mua
            hàng <strong>{purchaseRequest.requestNumber}</strong>?
            {isApprove && (
              <>
                <br />
                <span className="font-medium">
                  Sau khi phê duyệt, bạn có thể nhận hàng vào kho.
                </span>
              </>
            )}
          </AlertDialogDescription>
        </AlertDialogHeader>

        {needsReason && (
          <div className="space-y-2 py-4">
            <Label htmlFor="reason">
              Lý do {isCancel ? "hủy" : "từ chối"}{" "}
              <span className="text-muted-foreground text-xs">
                (không bắt buộc)
              </span>
            </Label>
            <Textarea
              id="reason"
              placeholder={`Nhập lý do ${isCancel ? "hủy" : "từ chối"}...`}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="min-h-[80px]"
              disabled={isPending}
            />
          </div>
        )}

        <AlertDialogFooter>
          <AlertDialogCancel disabled={isPending}>Hủy</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleAction}
            disabled={isPending}
            className={
              isApprove
                ? "bg-primary hover:bg-primary/90"
                : "bg-destructive hover:bg-destructive/90"
            }
          >
            {isPending
              ? isApprove
                ? "Đang phê duyệt..."
                : isCancel
                  ? "Đang hủy..."
                  : "Đang từ chối..."
              : isApprove
                ? "Phê duyệt"
                : isCancel
                  ? "Hủy yêu cầu"
                  : "Từ chối"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
