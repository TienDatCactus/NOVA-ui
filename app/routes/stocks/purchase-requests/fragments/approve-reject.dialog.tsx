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
import {
  useApprovePurchaseRequest,
  useRejectPurchaseRequest,
} from "../container/query.hooks";
import type { PurchaseRequestListItemDto } from "~/services/api/stocks/purchase-requests/dto";

interface ApproveRejectDialogProps {
  open: boolean;
  onClose: () => void;
  purchaseRequest: PurchaseRequestListItemDto;
  action: "approve" | "reject";
}

export default function ApproveRejectDialog({
  open,
  onClose,
  purchaseRequest,
  action,
}: ApproveRejectDialogProps) {
  const { mutate: approvePR, isPending: isApproving } =
    useApprovePurchaseRequest();
  const { mutate: rejectPR, isPending: isRejecting } =
    useRejectPurchaseRequest();

  const isPending = action === "approve" ? isApproving : isRejecting;

  const handleAction = () => {
    const mutate = action === "approve" ? approvePR : rejectPR;
    mutate(purchaseRequest.id, {
      onSuccess: () => {
        onClose();
      },
    });
  };

  const isApprove = action === "approve";

  return (
    <AlertDialog open={open} onOpenChange={onClose}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>
            {isApprove ? "Xác nhận phê duyệt" : "Xác nhận từ chối"}
          </AlertDialogTitle>
          <AlertDialogDescription>
            Bạn có chắc chắn muốn {isApprove ? "phê duyệt" : "từ chối"} yêu cầu
            mua hàng <strong>{purchaseRequest.requestNumber}</strong>?
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
                : "Đang từ chối..."
              : isApprove
                ? "Phê duyệt"
                : "Từ chối"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
