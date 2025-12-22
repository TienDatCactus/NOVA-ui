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
import type { WorkShiftListItem } from "~/services/api/work-shift/dto";
import { useDeleteWorkShift } from "../container/mutation.hooks";

interface DeleteWorkShiftDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  workShift: WorkShiftListItem | null;
}

export default function DeleteWorkShiftDialog({
  open,
  onOpenChange,
  workShift,
}: DeleteWorkShiftDialogProps) {
  const { mutateAsync: deleteWorkShift, isPending } = useDeleteWorkShift();
  const handleConfirm = async () => {
    if (!workShift) return;

    try {
      await deleteWorkShift(workShift.id, {
        onSuccess: () => {
          onOpenChange(false);
        },
      });
    } catch (error) {
      console.error("Delete work shift error:", error);
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Xác nhận xóa ca làm việc</AlertDialogTitle>
          <AlertDialogDescription>
            Bạn có chắc chắn muốn xóa ca làm việc{" "}
            <span className="font-semibold">{workShift?.name}</span> (
            {workShift?.code})? Hành động này không thể hoàn tác.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isPending}>Hủy</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleConfirm}
            disabled={isPending}
            className="bg-destructive hover:bg-destructive/90"
          >
            {isPending ? "Đang xóa..." : "Xóa"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
