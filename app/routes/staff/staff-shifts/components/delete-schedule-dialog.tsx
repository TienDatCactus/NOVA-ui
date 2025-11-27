import { useState } from "react";
import { format, parseISO } from "date-fns";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog";
import { RadioGroup, RadioGroupItem } from "~/components/ui/radio-group";
import { Label } from "~/components/ui/label";
import { Button } from "~/components/ui/button";
import { toast } from "sonner";
import type { StaffShiftListItem } from "~/services/api/staff/staff-shift/dto";
import { DeleteScope } from "~/services/api/staff/staff-shift/staff-shift.type";
import { useDeleteStaffShift } from "../container/query.hooks";
import {
  AlertTriangle,
  Calendar,
  Trash2,
  Repeat,
  ArrowRight,
} from "lucide-react";
import { cn } from "~/lib/utils";
import { Separator } from "~/components/ui/separator";

interface DeleteScheduleDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  shift: StaffShiftListItem | null;
  onSuccess: () => void;
}

export default function DeleteScheduleDialog({
  open,
  onOpenChange,
  shift,
  onSuccess,
}: DeleteScheduleDialogProps) {
  const [deleteScope, setDeleteScope] = useState<DeleteScope>(
    DeleteScope.Single
  );
  const [isDeleting, setIsDeleting] = useState(false);

  // Mutation
  const deleteStaffShift = useDeleteStaffShift();

  if (!shift) return null;

  const workDate = shift.workDate ? parseISO(shift.workDate) : new Date();
  const formattedDate = format(workDate, "dd/MM/yyyy");

  // Giữ nguyên logic tính ngày của bạn
  const endDate = format(
    new Date(workDate.getTime() + 18 * 24 * 60 * 60 * 1000),
    "dd/MM/yyyy"
  );

  const handleDelete = async () => {
    if (!shift.id) {
      toast.error("Không thể xóa lịch làm việc này");
      return;
    }

    setIsDeleting(true);
    try {
      await deleteStaffShift.mutateAsync({ id: shift.id, scope: deleteScope });
      toast.success("Xóa lịch làm việc thành công");
      onSuccess();
      onOpenChange(false);
    } catch (error) {
      console.error("Failed to delete shift schedule:", error);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md p-0 gap-0 overflow-hidden">
        {/* === HEADER: WARN THE USER === */}
        <DialogHeader className="px-6 py-4 bg-destructive/5 border-b border-destructive/10">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-destructive/10 rounded-full text-destructive">
              <Trash2 className="w-5 h-5" />
            </div>
            <div>
              <DialogTitle className="text-lg font-semibold text-foreground">
                Xóa lịch làm việc
              </DialogTitle>
              <DialogDescription className="text-xs mt-0.5">
                Hành động này sẽ loại bỏ phân công ca làm việc.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="p-6 space-y-6">
          {/* 1. CONTEXT CARD: CONFIRM WHAT IS BEING DELETED */}
          <div className="bg-muted/40 rounded-lg border p-3 flex items-center justify-between text-sm">
            <div>
              <span className="font-semibold block">{shift.staffName}</span>
              <span className="text-muted-foreground text-xs">
                {shift.shiftName}
              </span>
            </div>
            <div className="text-right">
              <span className="font-medium block">{formattedDate}</span>
            </div>
          </div>

          {/* 2. DELETION SCOPE: RED RADIO CARDS */}
          <div className="space-y-3">
            <Label className="text-sm font-medium text-foreground">
              Phạm vi xóa
            </Label>
            <RadioGroup
              value={deleteScope}
              onValueChange={(value) => setDeleteScope(value as DeleteScope)}
              className="grid gap-3"
            >
              {/* Option 1: Single */}
              <div>
                <RadioGroupItem
                  value={DeleteScope.Single}
                  id="scope-single"
                  className="peer sr-only"
                />
                <Label
                  htmlFor="scope-single"
                  className="flex items-start gap-3 p-3 border rounded-lg cursor-pointer transition-all hover:bg-muted peer-data-[state=checked]:border-destructive peer-data-[state=checked]:bg-destructive/5 peer-data-[state=checked]:ring-1 peer-data-[state=checked]:ring-destructive"
                >
                  <Calendar className="w-4 h-4 mt-0.5 text-muted-foreground peer-data-[state=checked]:text-destructive" />
                  <div className="space-y-1">
                    <p className="font-medium text-sm">Chỉ lịch này</p>
                    <p className="text-xs text-muted-foreground">
                      Chỉ xóa ngày {formattedDate}, giữ lại các ngày khác.
                    </p>
                  </div>
                </Label>
              </div>

              {/* Option 2: Forward */}
              <div>
                <RadioGroupItem
                  value={DeleteScope.FromThisDateForward}
                  id="scope-forward"
                  className="peer sr-only"
                />
                <Label
                  htmlFor="scope-forward"
                  className="flex items-start gap-3 p-3 border rounded-lg cursor-pointer transition-all hover:bg-muted peer-data-[state=checked]:border-destructive peer-data-[state=checked]:bg-destructive/5 peer-data-[state=checked]:ring-1 peer-data-[state=checked]:ring-destructive"
                >
                  <ArrowRight className="w-4 h-4 mt-0.5 text-muted-foreground peer-data-[state=checked]:text-destructive" />
                  <div className="space-y-1">
                    <p className="font-medium text-sm">Từ ngày này trở đi</p>
                    <p className="text-xs text-muted-foreground">
                      Xóa từ {formattedDate} đến {endDate}.
                    </p>
                  </div>
                </Label>
              </div>

              {/* Option 3: All */}
              <div>
                <RadioGroupItem
                  value={DeleteScope.AllInSeries}
                  id="scope-all"
                  className="peer sr-only"
                />
                <Label
                  htmlFor="scope-all"
                  className="flex items-start gap-3 p-3 border rounded-lg cursor-pointer transition-all hover:bg-muted peer-data-[state=checked]:border-destructive peer-data-[state=checked]:bg-destructive/5 peer-data-[state=checked]:ring-1 peer-data-[state=checked]:ring-destructive"
                >
                  <Repeat className="w-4 h-4 mt-0.5 text-muted-foreground peer-data-[state=checked]:text-destructive" />
                  <div className="space-y-1">
                    <p className="font-medium text-sm">Tất cả chuỗi lặp</p>
                    <p className="text-xs text-muted-foreground">
                      Xóa toàn bộ lịch lặp lại trong quá khứ và tương lai.
                    </p>
                  </div>
                </Label>
              </div>
            </RadioGroup>
          </div>

          {/* 3. WARNING ALERT */}
          <div className="flex gap-2 p-3 bg-destructive/10 text-destructive rounded-md text-xs">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <p>
              Hành động này không thể hoàn tác. Dữ liệu chấm công liên quan (nếu
              có) cũng có thể bị ảnh hưởng.
            </p>
          </div>
        </div>

        {/* === FOOTER === */}
        <DialogFooter className="px-6 py-4 border-t bg-background shrink-0 gap-2 sm:gap-0">
          <Button
            type="button"
            variant="ghost"
            onClick={() => onOpenChange(false)}
            disabled={isDeleting}
          >
            Bỏ qua
          </Button>
          <Button
            type="button"
            variant="destructive"
            onClick={handleDelete}
            disabled={isDeleting}
            className="min-w-[100px]"
          >
            {isDeleting ? "Đang xóa..." : "Xóa lịch"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
