import { useState, useMemo } from "react";
import { subMonths, format } from "date-fns";
import { vi } from "date-fns/locale";
import {
  Trash2,
  AlertTriangle,
  CalendarX2,
  Database,
  Loader2,
  Eraser,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog";
import { Button } from "~/components/ui/button";
import { Label } from "~/components/ui/label";
import { Input } from "~/components/ui/input";
import { Slider } from "~/components/ui/slider";
import { Alert, AlertDescription, AlertTitle } from "~/components/ui/alert";
import { useCleanupAuditLogs, useCleanupCount } from "../container/query.hooks";
import { toast } from "sonner";
import { cn } from "~/lib/utils";
import { Separator } from "~/components/ui/separator";

interface CleanupAuditDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function CleanupAuditDialog({
  open,
  onOpenChange,
}: CleanupAuditDialogProps) {
  const [olderThanMonths, setOlderThanMonths] = useState<number>(12);
  const [confirmText, setConfirmText] = useState("");

  const { data: countData, isLoading: isCounting } = useCleanupCount();
  const cleanupMutation = useCleanupAuditLogs();

  const cutoffDate = useMemo(() => {
    return subMonths(new Date(), olderThanMonths);
  }, [olderThanMonths]);

  const CONFIRM_KEYWORD = "DELETE";

  const handleCleanup = async () => {
    if (confirmText !== CONFIRM_KEYWORD) {
      toast.error(`Vui lòng nhập đúng từ khóa "${CONFIRM_KEYWORD}"`);
      return;
    }

    try {
      const result = await cleanupMutation.mutateAsync({
        olderThanMonths: olderThanMonths,
        confirmationText: CONFIRM_KEYWORD,
        mustArchiveFirst: true,
      });

      toast.success(result.message || `Đã dọn dẹp ${result.deletedCount} logs`);
      onOpenChange(false);
      setConfirmText("");
    } catch (error) {
      console.error("Cleanup error:", error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg p-0 gap-0 overflow-hidden border-destructive/20">
        {/* === HEADER (Danger Theme) === */}
        <DialogHeader className="px-6 py-4 border-b ">
          <DialogTitle>Dọn dẹp dữ liệu</DialogTitle>
          <DialogDescription>
            Xóa vĩnh viễn Audit Logs cũ khỏi hệ thống.
          </DialogDescription>
        </DialogHeader>

        <div className="p-6 space-y-6">
          {/* 1. WARNING ALERT */}
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle className="ml-2 font-bold">
              Cảnh báo mất dữ liệu
            </AlertTitle>
            <AlertDescription className="ml-2 mt-1 text-xs opacity-90">
              Hành động này{" "}
              <span>
                <b>không thể hoàn tác (Irreversible).</b>
              </span>{" "}
              Dữ liệu đã xóa sẽ không thể khôi phục lại dưới bất kỳ hình thức
              nào.
            </AlertDescription>
          </Alert>

          {/* 2. CONFIGURATION */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label className="text-sm font-semibold">Phạm vi xóa</Label>
              <span className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded-md font-mono">
                &lt; {format(cutoffDate, "dd/MM/yyyy", { locale: vi })}
              </span>
            </div>

            <div className="flex items-center gap-4">
              <Slider
                value={[olderThanMonths]}
                min={3}
                max={60}
                step={1}
                onValueChange={(vals) => setOlderThanMonths(vals[0])}
                className="flex-1 "
              />
              <div className="flex items-center gap-2 min-w-[5rem]">
                <Input
                  type="number"
                  value={olderThanMonths}
                  onChange={(e) => setOlderThanMonths(Number(e.target.value))}
                  className="h-8 text-center"
                />
                <span className="text-xs text-muted-foreground">tháng</span>
              </div>
            </div>
          </div>

          <Separator />

          {/* 3. IMPACT ANALYSIS */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-muted/30 p-3 rounded-lg border border-dashed flex items-center gap-3">
              <CalendarX2 className="w-8 h-8 text-muted-foreground/50" />
              <div>
                <p className="text-xs text-muted-foreground font-medium uppercase">
                  Ngày tính mốc
                </p>
                <p className="text-sm font-bold font-mono text-foreground">
                  {format(cutoffDate, "dd/MM/yyyy")}
                </p>
              </div>
            </div>
            <div className="bg-destructive/5 p-3 rounded-lg border border-destructive/20 flex items-center gap-3">
              {isCounting ? (
                <Loader2 className="w-8 h-8 text-destructive animate-spin opacity-50" />
              ) : (
                <Database className="w-8 h-8 text-destructive opacity-50" />
              )}
              <div>
                <p className="text-xs text-destructive font-medium uppercase">
                  Số lượng sẽ xóa
                </p>
                <p className="text-sm font-bold font-mono text-destructive">
                  {isCounting ? "..." : <p>{countData || ""}</p>}
                </p>
              </div>
            </div>
          </div>

          {/* 4. CONFIRMATION INPUT */}
          <div className="space-y-3 pt-2">
            <Label htmlFor="confirm" className="text-sm">
              Để xác nhận, vui lòng nhập chữ{" "}
              <span className="font-bold font-mono text-destructive select-all">
                "{CONFIRM_KEYWORD}"
              </span>{" "}
              vào ô bên dưới
            </Label>
            <Input
              id="confirm"
              value={confirmText}
              onChange={(e) => setConfirmText(e.target.value)}
              placeholder={CONFIRM_KEYWORD}
              className="font-mono uppercase placeholder:text-muted-foreground/50 border-destructive/30 focus-visible:ring-destructive/30"
            />
          </div>
        </div>

        {/* === FOOTER === */}
        <DialogFooter className="px-6 py-4 border-t bg-background">
          <Button
            variant="ghost"
            onClick={() => onOpenChange(false)}
            disabled={cleanupMutation.isPending}
          >
            Hủy bỏ
          </Button>
          <Button
            variant="destructive"
            onClick={handleCleanup}
            disabled={
              confirmText !== CONFIRM_KEYWORD || cleanupMutation.isPending
            }
            className="min-w-[140px] font-semibold"
          >
            {cleanupMutation.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Đang xóa...
              </>
            ) : (
              <>
                <Eraser className="mr-2 h-4 w-4" /> Xóa vĩnh viễn
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
