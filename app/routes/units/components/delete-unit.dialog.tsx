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
import { Badge } from "~/components/ui/badge";
import { AlertTriangle, Loader2 } from "lucide-react";
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
      <AlertDialogContent className="sm:max-w-[480px]">
        <AlertDialogHeader>
          <div className="flex items-start gap-3">
            <div className="rounded-lg bg-destructive/10 p-2.5 mt-0.5">
              <AlertTriangle className="h-5 w-5 text-destructive" />
            </div>
            <div className="flex-1 space-y-2">
              <AlertDialogTitle className="text-xl">
                Xác nhận xóa đơn vị tính
              </AlertDialogTitle>
              <AlertDialogDescription className="space-y-3 text-sm">
                <p>Bạn có chắc chắn muốn xóa đơn vị tính sau không?</p>
                <div className="rounded-lg border bg-muted/50 p-3 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">Mã:</span>
                    <Badge variant="outline" className="font-mono text-xs">
                      {unit?.code}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">Tên:</span>
                    <span className="font-semibold text-foreground text-sm">
                      {unit?.name}
                    </span>
                  </div>
                </div>
                <p className="text-destructive font-medium flex items-center gap-1.5">
                  <AlertTriangle className="h-3.5 w-3.5" />
                  Hành động này không thể hoàn tác
                </p>
              </AlertDialogDescription>
            </div>
          </div>
        </AlertDialogHeader>
        <AlertDialogFooter className="gap-2 sm:gap-0">
          <AlertDialogCancel disabled={isPending}>Hủy</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            disabled={isPending}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90 gap-2"
          >
            {isPending && <Loader2 className="h-4 w-4 animate-spin" />}
            {isPending ? "Đang xóa..." : "Xóa đơn vị"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
