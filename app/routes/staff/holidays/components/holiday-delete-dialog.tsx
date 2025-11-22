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
import { Loader2 } from "lucide-react";
import { useState } from "react";
import { HolidayService } from "~/services/api/holiday";
import { toast } from "sonner";
import type { HolidayListItem } from "~/services/api/holiday/dto";
import { useDeleteHoliday } from "../container/mutation.hooks";

interface DeleteHolidayDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  holiday: HolidayListItem | null;
  onSuccess?: () => void;
}

export default function DeleteHolidayDialog({
  open,
  onOpenChange,
  holiday,
}: DeleteHolidayDialogProps) {
  const { mutateAsync: deleteHoliday, isPending } = useDeleteHoliday();
  const handleDelete = async () => {
    if (!holiday) return;

    try {
      await deleteHoliday(holiday.id, {
        onSuccess: () => {
          onOpenChange(false);
        },
      });
    } catch (error) {
      console.error("Delete holiday error:", error);
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Xác nhận xóa ngày nghỉ</AlertDialogTitle>
          <AlertDialogDescription>
            Bạn có chắc chắn muốn xóa ngày nghỉ{" "}
            <span className="font-semibold text-foreground">
              {holiday?.name}
            </span>
            ? Hành động này không thể hoàn tác.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isPending}>Hủy</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            disabled={isPending}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isPending ? "Đang xóa..." : "Xóa"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
