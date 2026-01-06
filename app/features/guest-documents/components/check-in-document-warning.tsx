import { AlertCircle, FileText } from "lucide-react";
import { Alert, AlertDescription } from "~/components/ui/alert";
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

interface CheckInDocumentWarningProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  missingCount: number;
  documentsCount: number;
  adultsAmount: number;
  onConfirm: () => void;
}

export default function CheckInDocumentWarning({
  open,
  onOpenChange,
  missingCount,
  documentsCount,
  adultsAmount,
  onConfirm,
}: CheckInDocumentWarningProps) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2 text-amber-600">
            <AlertCircle className="w-5 h-5" />
            Thiếu giấy tờ tùy thân
          </AlertDialogTitle>
          <AlertDialogDescription className="space-y-3">
            <Alert className="border-amber-200 bg-amber-50 dark:bg-amber-950/20">
              <FileText className="w-4 h-4 text-amber-600" />
              <AlertDescription className="text-amber-800 dark:text-amber-200">
                <span>
                  Booking này có <strong>{adultsAmount} khách</strong> nhưng chỉ
                  có <strong>{documentsCount} giấy tờ</strong>.
                </span>
                <span>
                  Thiếu <strong>{missingCount}</strong> giấy tờ.
                </span>
              </AlertDescription>
            </Alert>

            <p className="text-sm text-muted-foreground">
              Theo quy định, mỗi khách cần có giấy tờ tùy thân (Passport hoặc
              CMND/CCCD) trước khi check-in. Bạn có chắc chắn muốn tiếp tục?
            </p>

            <div className="text-xs text-muted-foreground bg-muted/30 p-3 rounded-md">
              <strong>Lưu ý:</strong> Bạn vẫn có thể upload giấy tờ sau khi
              check-in từ trang chi tiết booking.
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Hủy</AlertDialogCancel>
          <AlertDialogAction
            onClick={onConfirm}
            className="bg-amber-600 hover:bg-amber-700"
          >
            Tiếp tục Check-in
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
