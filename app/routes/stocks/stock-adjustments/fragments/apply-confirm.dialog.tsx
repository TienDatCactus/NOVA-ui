import { AlertTriangle } from "lucide-react";
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
import { Alert, AlertDescription, AlertTitle } from "~/components/ui/alert";
import { Badge } from "~/components/ui/badge";
import { useApplyStockAdjustment } from "../container/query.hooks";
import type { StockAdjustmentListItemDto } from "~/services/api/stocks/stock-adjustments/dto";

interface ApplyConfirmDialogProps {
  open: boolean;
  onClose: () => void;
  adjustment: StockAdjustmentListItemDto;
}

export default function ApplyConfirmDialog({
  open,
  onClose,
  adjustment,
}: ApplyConfirmDialogProps) {
  const { mutate: applyAdjustment, isPending: isApplying } =
    useApplyStockAdjustment();

  const handleApply = () => {
    applyAdjustment(adjustment.id, {
      onSuccess: () => {
        onClose();
      },
    });
  };

  // Calculate summary
  const increaseItems = adjustment.items.filter(
    (item) => item.quantityDiff > 0
  );
  const decreaseItems = adjustment.items.filter(
    (item) => item.quantityDiff < 0
  );

  return (
    <AlertDialog open={open} onOpenChange={onClose}>
      <AlertDialogContent className="max-w-2xl">
        <AlertDialogHeader>
          <AlertDialogTitle>Xác nhận áp dụng phiếu điều chỉnh</AlertDialogTitle>
          <AlertDialogDescription className="space-y-4">
            <div className="flex items-center gap-2">
              <span>Mã phiếu:</span>
              <Badge variant="outline" className="font-mono">
                {adjustment.reference}
              </Badge>
            </div>

            <Alert variant="destructive">
              <AlertTriangle />
              <AlertTitle>CẢNH BÁO QUAN TRỌNG</AlertTitle>
              <AlertDescription>
                Thao tác này sẽ thay đổi số lượng tồn kho và KHÔNG THỂ HOÀN TÁC!
              </AlertDescription>
            </Alert>

            <div className="space-y-3 text-sm">
              <div>
                <p className="font-semibold mb-2">Tóm tắt điều chỉnh:</p>
                <div className="grid gap-2">
                  {increaseItems.length > 0 && (
                    <div className="flex items-start gap-2">
                      <Badge variant="default" className="bg-green-600">
                        Tăng
                      </Badge>
                      <div className="flex-1">
                        <p className="text-muted-foreground">
                          {increaseItems.length} mục hàng sẽ được{" "}
                          <span className="text-green-600 font-semibold">
                            tăng
                          </span>{" "}
                          tồn kho
                        </p>
                      </div>
                    </div>
                  )}
                  {decreaseItems.length > 0 && (
                    <div className="flex items-start gap-2">
                      <Badge variant="destructive">Giảm</Badge>
                      <div className="flex-1">
                        <p className="text-muted-foreground">
                          {decreaseItems.length} mục hàng sẽ được{" "}
                          <span className="text-red-600 font-semibold">
                            giảm
                          </span>{" "}
                          tồn kho
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="border-t pt-3">
                <p className="font-semibold">Lý do điều chỉnh:</p>
                <p className="text-muted-foreground italic">
                  {adjustment.reason}
                </p>
              </div>
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isApplying}>Hủy</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleApply}
            disabled={isApplying}
            className="bg-orange-600 hover:bg-orange-700"
          >
            {isApplying ? "Đang áp dụng..." : "Xác nhận áp dụng"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
