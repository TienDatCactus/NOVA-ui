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
import { useDeleteUnit } from "../container/unit-mutation.hooks";
import type { UnitItemDetailResponseDto } from "~/services/api/units/dto";

interface DeleteUnitDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  unit: UnitItemDetailResponseDto | null;
  onSuccess?: () => void;
}

export default function DeleteUnitDialog({
  open,
  onOpenChange,
  unit,
  onSuccess,
}: DeleteUnitDialogProps) {
  const { mutate: deleteUnit, isPending } = useDeleteUnit();

  const handleDelete = () => {
    if (!unit) return;

    deleteUnit(unit.id, {
      onSuccess: () => {
        onOpenChange(false);
        onSuccess?.();
      },
    });
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Xác nhận xóa đơn vị tính</AlertDialogTitle>
          <AlertDialogDescription>
            Bạn có chắc chắn muốn xóa đơn vị tính{" "}
            <span className="font-semibold text-foreground">{unit?.name}</span> (
            <span className="font-mono">{unit?.code}</span>)?
            <br />
            <span className="text-destructive">
              Hành động này không thể hoàn tác.
            </span>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isPending}>Hủy</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            disabled={isPending}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {isPending ? "Đang xóa..." : "Xóa"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
