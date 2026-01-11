import { format, parseISO } from "date-fns";
import {
  AlertTriangle,
  ArrowRight,
  Calendar,
  Loader2,
  Repeat,
  UserCog,
  Users,
} from "lucide-react";
import { useEffect, useState } from "react";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { cn } from "~/lib/utils";
import type { StaffShiftListItem } from "~/services/api/staff/staff-shift/dto";
import { ApplyScope } from "~/services/api/staff/staff-shift/staff-shift.type";
import { useTransferStaffShift } from "../container/query.hooks";
import { useStaffList } from "~/routes/staff/staff/container/query.hooks";

interface TransferShiftDialogProps {
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

export default function TransferShiftDialog({
  open,
  onOpenChange,
  shift,
  onSuccess,
}: TransferShiftDialogProps) {
  const [transferScope, setTransferScope] = useState<ApplyScope>(
    ApplyScope.ThisOnly
  );
  const [targetStaffId, setTargetStaffId] = useState<string>("");
  const [isTransferring, setIsTransferring] = useState(false);

  // Queries
  const { data: staffList } = useStaffList();
  const transferMutation = useTransferStaffShift();

  // Reset form when dialog opens/closes
  useEffect(() => {
    if (open) {
      setTransferScope(ApplyScope.ThisOnly);
      setTargetStaffId("");
    }
  }, [open]);

  if (!shift) return null;

  const workDate = shift.workDate ? parseISO(shift.workDate) : new Date();
  const formattedDate = format(workDate, "dd/MM/yyyy");

  // Filter out current staff and terminated staff from target list
  const availableStaff = (staffList || []).filter(
    (staff) => staff.id !== shift.staffId && staff.status === "Active"
  );

  const handleTransfer = async () => {
    if (!shift.id) {
      toast.error("Không thể chuyển ca làm việc này");
      return;
    }

    if (!targetStaffId) {
      toast.error("Vui lòng chọn nhân viên nhận ca");
      return;
    }

    setIsTransferring(true);
    try {
      await transferMutation.mutateAsync({
        id: shift.id,
        targetStaffId,
        scope: transferScope,
      });
      onSuccess();
      onOpenChange(false);
    } catch (error) {
      console.error("Failed to transfer shift:", error);
    } finally {
      setIsTransferring(false);
    }
  };

  const selectedStaff = availableStaff.find((s) => s.id === targetStaffId);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl p-0 gap-0 overflow-hidden flex flex-col">
        {/* === HEADER === */}
        <DialogHeader className="px-6 py-4 border-b shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-full bg-primary/10">
              <UserCog className="w-5 h-5 text-primary" />
            </div>
            <div className="space-y-1">
              <DialogTitle className="text-lg">Chuyển ca làm việc</DialogTitle>
              <DialogDescription>
                Chuyển ca làm việc từ nhân viên này sang nhân viên khác theo
                phạm vi bạn chọn.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="flex flex-col md:flex-row">
          {/* === LEFT PANEL: CONTEXT INFO === */}
          <div className="flex-1 p-0">
            <div className="p-6 space-y-6">
              {/* Current Shift Info */}
              <div>
                <h3 className="mb-3 text-sm font-semibold text-foreground/80 flex items-center gap-2">
                  <span className="w-1 h-4 bg-primary rounded-full" />
                  Thông tin ca hiện tại
                </h3>
                <div className="border rounded-md overflow-hidden">
                  <Table>
                    <TableBody>
                      <TableRow className="hover:bg-transparent">
                        <LabelCell>Nhân viên hiện tại</LabelCell>
                        <ValueCell>
                          <span className="font-semibold">
                            {shift.staffName}
                          </span>
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

              {/* Target Staff Selection */}
              <div>
                <h3 className="mb-3 text-sm font-semibold text-foreground/80 flex items-center gap-2">
                  <span className="w-1 h-4 bg-green-500 rounded-full" />
                  Nhân viên nhận ca
                </h3>
                <Select value={targetStaffId} onValueChange={setTargetStaffId}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Chọn nhân viên nhận ca..." />
                  </SelectTrigger>
                  <SelectContent>
                    {availableStaff.length === 0 ? (
                      <div className="p-4 text-center text-sm text-muted-foreground">
                        Không có nhân viên khả dụng
                      </div>
                    ) : (
                      availableStaff.map((staff) => (
                        <SelectItem key={staff.id} value={staff.id}>
                          <div className="flex items-center gap-2">
                            <Users className="w-4 h-4 text-muted-foreground" />
                            <span className="font-medium">{staff.fullName}</span>
                            <span className="text-xs text-muted-foreground">
                              ({staff.code})
                            </span>
                          </div>
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>

                {selectedStaff && (
                  <div className="mt-3 p-3 bg-muted/30 rounded-md border">
                    <div className="flex items-center gap-2 text-sm">
                      <ArrowRight className="w-4 h-4 text-primary" />
                      <span className="text-muted-foreground">
                        Chuyển từ:
                      </span>
                      <span className="font-semibold">{shift.staffName}</span>
                      <span className="text-muted-foreground">→</span>
                      <span className="font-semibold text-primary">
                        {selectedStaff.fullName}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* === RIGHT PANEL: SCOPE SELECTION === */}
          <div className="w-full md:w-[340px] bg-muted/10 border-l flex flex-col">
            <div className="p-6 space-y-6">
              <div className="space-y-3">
                <h3 className="text-sm font-semibold text-foreground/80 flex items-center gap-2">
                  <span className="w-1 h-4 bg-blue-500 rounded-full" />
                  Phạm vi chuyển
                </h3>

                <RadioGroup
                  value={transferScope}
                  onValueChange={(value) =>
                    setTransferScope(value as ApplyScope)
                  }
                  className="grid gap-2"
                >
                  {/* Option 1: ThisOnly */}
                  <label
                    htmlFor="scope-this-only"
                    className={cn(
                      "flex items-start gap-3 p-3 border rounded-lg cursor-pointer transition-all hover:bg-background",
                      transferScope === ApplyScope.ThisOnly
                        ? "border-primary bg-primary/5 ring-1 ring-primary"
                        : "bg-background border-border"
                    )}
                  >
                    <RadioGroupItem
                      value={ApplyScope.ThisOnly}
                      id="scope-this-only"
                      className="mt-1"
                    />
                    <div className="space-y-1">
                      <p className="font-medium text-sm flex items-center gap-2">
                        Chỉ ca này
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Chỉ chuyển ca ngày {formattedDate}.
                      </p>
                    </div>
                  </label>

                  {/* Option 2: Forward */}
                  <label
                    htmlFor="scope-forward"
                    className={cn(
                      "flex items-start gap-3 p-3 border rounded-lg cursor-pointer transition-all hover:bg-background",
                      transferScope === ApplyScope.Forward
                        ? "border-primary bg-primary/5 ring-1 ring-primary"
                        : "bg-background border-border"
                    )}
                  >
                    <RadioGroupItem
                      value={ApplyScope.Forward}
                      id="scope-forward"
                      className="mt-1"
                    />
                    <div className="space-y-1">
                      <p className="font-medium text-sm flex items-center gap-2">
                        Từ ca này trở đi
                        <ArrowRight className="w-3.5 h-3.5 text-muted-foreground" />
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Chuyển từ {formattedDate} đến tương lai.
                      </p>
                    </div>
                  </label>

                  {/* Option 3: All */}
                  <label
                    htmlFor="scope-all"
                    className={cn(
                      "flex items-start gap-3 p-3 border rounded-lg cursor-pointer transition-all hover:bg-background",
                      transferScope === ApplyScope.All
                        ? "border-primary bg-primary/5 ring-1 ring-primary"
                        : "bg-background border-border"
                    )}
                  >
                    <RadioGroupItem
                      value={ApplyScope.All}
                      id="scope-all"
                      className="mt-1"
                    />
                    <div className="space-y-1">
                      <p className="font-medium text-sm flex items-center gap-2">
                        Tất cả chuỗi lặp
                        <Repeat className="w-3.5 h-3.5 text-muted-foreground" />
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Chuyển toàn bộ ca quá khứ và tương lai.
                      </p>
                    </div>
                  </label>
                </RadioGroup>
              </div>

              <Separator />

              <div className="flex gap-3 p-3 bg-blue-500/10 text-blue-600 dark:text-blue-500 rounded-md text-xs border border-blue-500/20">
                <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                <p>
                  Ca làm việc sẽ được chuyển sang nhân viên được chọn. Dữ liệu
                  chấm công hiện tại sẽ được giữ nguyên.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* === FOOTER === */}
        <DialogFooter className="px-6 py-4 border-t bg-muted/30 shrink-0">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isTransferring}
          >
            Hủy
          </Button>
          <Button
            onClick={handleTransfer}
            disabled={isTransferring || !targetStaffId}
            className="gap-2"
          >
            {isTransferring ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Đang chuyển...
              </>
            ) : (
              <>
                <UserCog className="w-4 h-4" />
                Chuyển ca
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
