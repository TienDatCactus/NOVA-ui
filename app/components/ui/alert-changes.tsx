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
interface AlertChangesProps {
  showCancelDialog: boolean;
  setShowCancelDialog: (open: boolean) => void;
  handleConfirmClose: () => void;
}
function AlertChanges({
  showCancelDialog,
  setShowCancelDialog,
  handleConfirmClose,
}: AlertChangesProps) {
  return (
    <AlertDialog open={showCancelDialog} onOpenChange={setShowCancelDialog}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Có thay đổi chưa được lưu</AlertDialogTitle>
          <AlertDialogDescription>
            Bạn có chắc chắn muốn đóng? Tất cả thay đổi sẽ bị mất.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Tiếp tục chỉnh sửa</AlertDialogCancel>
          <AlertDialogAction onClick={handleConfirmClose}>
            Đóng
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

export default AlertChanges;
