import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
  AlertDialogDescription,
} from "~/components/ui/alert-dialog";
import { Button } from "~/components/ui/button";

type UnifiedConfirmDialogProps = {
  open: boolean;
  type: "void"; // finalize removed per requirements
  onConfirm: () => void;
  onCancel: () => void;
};

const DIALOG_CONFIG = {
  void: {
    title: "Hủy hóa đơn",
    description:
      "Hóa đơn này sẽ bị hủy vĩnh viễn. Bạn có chắc chắn muốn tiếp tục?",
    actionLabel: "Hủy hóa đơn",
  },
};

export function UnifiedConfirmDialog({
  open,
  type,
  onConfirm,
  onCancel,
}: UnifiedConfirmDialogProps) {
  const config = DIALOG_CONFIG[type];
  return (
    <AlertDialog open={open} onOpenChange={(open) => !open && onCancel()}>
      <AlertDialogContent className="bg-card shadow-sm p-6 max-w-md w-full">
        <AlertDialogHeader>
          <AlertDialogTitle className="text-lg font-bold text-foreground">
            {config.title}
          </AlertDialogTitle>
          <AlertDialogDescription className="text-muted-foreground text-sm mt-2">
            {config.description}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="flex flex-row gap-4 justify-end pt-4">
          <AlertDialogCancel asChild>
            <Button variant={"destructive-ghost"} onClick={onCancel}>
              Hủy
            </Button>
          </AlertDialogCancel>
          <AlertDialogAction asChild>
            <Button variant={"warning"} onClick={onConfirm}>
              {config.actionLabel}
            </Button>
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
