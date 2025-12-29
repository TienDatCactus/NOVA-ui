import { format, parseISO } from "date-fns";
import {
  AlertTriangle,
  ArrowRight,
  Calendar,
  Loader2,
  Repeat,
  Trash2,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "~/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog";
import { RadioGroup, RadioGroupItem } from "~/components/ui/radio-group";
import { Separator } from "~/components/ui/separator";
import { Table, TableBody, TableCell, TableRow } from "~/components/ui/table";
import { cn } from "~/lib/utils";
import type { StaffShiftListItem } from "~/services/api/staff/staff-shift/dto";
import { DeleteScope } from "~/services/api/staff/staff-shift/staff-shift.type";
import { useDeleteStaffShift } from "../container/query.hooks";

interface DeleteScheduleDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  shift: StaffShiftListItem | null;
  onSuccess: () => void;
}

// --- Reusable Table Components ---
const LabelCell = ({ children }: { children: React.ReactNode }) => (
  <TableCell className="w-[120px] bg-muted/30 font-medium border-r text-muted-foreground align-top py-3">
    {children}
  </TableCell>
);

const ValueCell = ({ children }: { children: React.ReactNode }) => (
  <TableCell className="p-3 align-top border-0 text-foreground">
    {children}
  </TableCell>
);

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
      <DialogContent className="max-w-3xl p-0 gap-0 overflow-hidden flex flex-col">
        {/* === HEADER === */}
        <DialogHeader className="px-6 py-4 border-b  shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2  rounded-full ">
              <Trash2 className="w-5 h-5" />
            </div>
            <div className="space-y-1">
              <DialogTitle className="text-lg ">Xóa lịch làm việc</DialogTitle>
              <DialogDescription>
                Hành động này sẽ loại bỏ phân công ca làm việc khỏi hệ thống.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="flex flex-col md:flex-row">
          {/* === LEFT PANEL: CONTEXT INFO === */}
          <div className="flex-1 p-0">
            <div className="p-6">
              <h3 className="mb-3 text-sm font-semibold text-foreground/80 flex items-center gap-2">
                <span className="w-1 h-4 bg-gray-500 rounded-full" />
                Thông tin lịch xóa
              </h3>
              <div className="border rounded-md overflow-hidden">
                <Table>
                  <TableBody>
                    <TableRow className="hover:bg-transparent">
                      <LabelCell>Nhân viên</LabelCell>
                      <ValueCell>
                        <span className="font-semibold">{shift.staffName}</span>
                      </ValueCell>
                    </TableRow>
                    <TableRow className="hover:bg-transparent">
                      <LabelCell>Ca làm việc</LabelCell>
                      <ValueCell>
                        <span className="font-medium text-primary">
                          {shift.shiftName}
                        </span>
                      </ValueCell>
                    </TableRow>
                    <TableRow className="hover:bg-transparent border-b-0">
                      <LabelCell>Ngày làm việc</LabelCell>
                      <ValueCell>
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-muted-foreground" />
                          {formattedDate}
                        </div>
                      </ValueCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </div>
            </div>
          </div>

          {/* === RIGHT PANEL: SCOPE SELECTION === */}
          <div className="w-full md:w-[340px] bg-muted/10 border-l flex flex-col">
            <div className="p-6 space-y-6">
              <div className="space-y-3">
                <h3 className="text-sm font-semibold text-foreground/80 flex items-center gap-2">
                  <span className="w-1 h-4 unded-full" />
                  Phạm vi xóa
                </h3>

                <RadioGroup
                  value={deleteScope}
                  onValueChange={(value) =>
                    setDeleteScope(value as DeleteScope)
                  }
                  className="grid gap-2"
                >
                  {/* Option 1: Single */}
                  <label
                    htmlFor="scope-single"
                    className={cn(
                      "flex items-start gap-3 p-3 border rounded-lg cursor-pointer transition-all hover:bg-background",
                      deleteScope === DeleteScope.Single
                        ? "border-destructive   ring-1 ring-destructive"
                        : "bg-background border-border"
                    )}
                  >
                    <RadioGroupItem
                      value={DeleteScope.Single}
                      id="scope-single"
                      className="mt-1"
                    />
                    <div className="space-y-1">
                      <p className="font-medium text-sm flex items-center gap-2">
                        Chỉ lịch này
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Chỉ xóa ngày {formattedDate}.
                      </p>
                    </div>
                  </label>

                  {/* Option 2: Forward */}
                  <label
                    htmlFor="scope-forward"
                    className={cn(
                      "flex items-start gap-3 p-3 border rounded-lg cursor-pointer transition-all hover:bg-background",
                      deleteScope === DeleteScope.FromThisDateForward
                        ? "border-destructive  ring-1 ring-destructive"
                        : "bg-background border-border"
                    )}
                  >
                    <RadioGroupItem
                      value={DeleteScope.FromThisDateForward}
                      id="scope-forward"
                      className="mt-1"
                    />
                    <div className="space-y-1">
                      <p className="font-medium text-sm flex items-center gap-2">
                        Từ ngày này trở đi
                        <ArrowRight className="w-3.5 h-3.5 text-muted-foreground" />
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Xóa từ {formattedDate} đến tương lai.
                      </p>
                    </div>
                  </label>

                  {/* Option 3: All */}
                  <label
                    htmlFor="scope-all"
                    className={cn(
                      "flex items-start gap-3 p-3 border rounded-lg cursor-pointer transition-all hover:bg-background",
                      deleteScope === DeleteScope.AllInSeries
                        ? "border-destructive  ring-1 ring-destructive"
                        : "bg-background border-border"
                    )}
                  >
                    <RadioGroupItem
                      value={DeleteScope.AllInSeries}
                      id="scope-all"
                      className="mt-1"
                    />
                    <div className="space-y-1">
                      <p className="font-medium text-sm flex items-center gap-2">
                        Tất cả chuỗi lặp
                        <Repeat className="w-3.5 h-3.5 text-muted-foreground" />
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Xóa toàn bộ lịch quá khứ và tương lai.
                      </p>
                    </div>
                  </label>
                </RadioGroup>
              </div>

              <Separator />

              <div className="flex gap-3 p-3 bg-yellow-500/10 text-yellow-600 dark:text-yellow-500 rounded-md text-xs border border-yellow-500/20">
                <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                <p>
                  Hành động này không thể hoàn tác. Dữ liệu chấm công liên quan
                  cũng có thể bị ảnh hưởng.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* === FOOTER === */}
        <DialogFooter className="px-6 py-4 border-t bg-background shrink-0 z-10">
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
            {isDeleting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Đang xóa
              </>
            ) : (
              <>
                <Trash2 className="mr-2 h-4 w-4" /> Xác nhận xóa
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
