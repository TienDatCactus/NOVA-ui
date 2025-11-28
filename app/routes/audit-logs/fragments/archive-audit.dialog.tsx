import { useState, useMemo } from "react";
import { subMonths, format } from "date-fns";
import { vi } from "date-fns/locale";
import {
  Archive,
  CalendarClock,
  HardDriveDownload,
  Info,
  Loader2,
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
import { useArchiveAuditLogs } from "../container/query.hooks";
import { toast } from "sonner";
import { cn } from "~/lib/utils";
import { Separator } from "~/components/ui/separator";

interface ArchiveAuditDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function ArchiveAuditDialog({
  open,
  onOpenChange,
}: ArchiveAuditDialogProps) {
  const [olderThanMonths, setOlderThanMonths] = useState<number>(6);
  const archiveMutation = useArchiveAuditLogs();

  // Tính toán ngày cắt dựa trên số tháng
  const cutoffDate = useMemo(() => {
    return subMonths(new Date(), olderThanMonths);
  }, [olderThanMonths]);

  const handleArchive = async () => {
    if (olderThanMonths < 1) {
      toast.error("Số tháng phải lớn hơn 0");
      return;
    }

    try {
      const result = await archiveMutation.mutateAsync({
        olderThanMonths: olderThanMonths,
      });

      toast.success(result.message || `Đã lưu trữ thành công các logs cũ`);
      onOpenChange(false);
    } catch (error) {
      console.error("Archive error:", error);
      toast.error("Lỗi khi thực hiện lưu trữ");
    }
  };

  const presets = [3, 6, 12, 24];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg p-0 gap-0 overflow-hidden">
        {/* === HEADER === */}
        <DialogHeader className="px-6 py-4 border-b bg-muted/5">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-orange-500/10 rounded-lg text-orange-600">
              <Archive className="h-5 w-5" />
            </div>
            <div>
              <DialogTitle>Lưu trữ dữ liệu</DialogTitle>
              <DialogDescription className="mt-0.5">
                Di chuyển dữ liệu cũ sang kho lưu trữ để tối ưu hiệu suất hệ
                thống.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="p-6 space-y-8">
          {/* 1. CONFIGURATION AREA */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label className="text-sm font-semibold text-foreground">
                Thời gian lưu trữ
              </Label>
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground">Cũ hơn</span>
                <div className="relative">
                  <Input
                    type="number"
                    min={1}
                    max={60}
                    value={olderThanMonths}
                    onChange={(e) => setOlderThanMonths(Number(e.target.value))}
                    className="w-16 h-8 text-center pr-1"
                  />
                </div>
                <span className="text-xs text-muted-foreground">tháng</span>
              </div>
            </div>

            <Slider
              value={[olderThanMonths]}
              min={1}
              max={36}
              step={1}
              onValueChange={(vals) => setOlderThanMonths(vals[0])}
              className="py-2"
            />

            <div className="flex gap-2">
              {presets.map((months) => (
                <Button
                  key={months}
                  variant={olderThanMonths === months ? "default" : "outline"}
                  size="sm"
                  onClick={() => setOlderThanMonths(months)}
                  className={cn(
                    "h-7 text-xs",
                    olderThanMonths === months
                      ? "bg-orange-600 hover:bg-orange-700 text-white"
                      : "text-muted-foreground"
                  )}
                >
                  {months} Tháng
                </Button>
              ))}
            </div>
          </div>

          {/* 2. IMPACT PREVIEW CARD */}
          <div className="bg-orange-50 border border-orange-100 rounded-xl p-4 flex flex-col gap-3">
            <div className="flex items-start gap-3">
              <div className="p-2 bg-white rounded-full shadow-sm text-orange-600">
                <CalendarClock className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <p className="text-xs font-semibold text-orange-800 uppercase tracking-wide">
                  Phạm vi ảnh hưởng
                </p>
                <p className="text-sm text-orange-900 leading-snug">
                  Toàn bộ nhật ký hoạt động trước ngày <br />
                  <span className="text-lg font-bold font-mono">
                    {format(cutoffDate, "dd/MM/yyyy", { locale: vi })}
                  </span>
                </p>
              </div>
            </div>

            <Separator className="bg-orange-200/50" />

            <div className="flex items-center gap-2 text-xs text-orange-800/80">
              <HardDriveDownload className="w-3.5 h-3.5" />
              <span>
                Dữ liệu sẽ được chuyển sang trạng thái "Đã lưu trữ" (Archived)
              </span>
            </div>
          </div>

          {/* 3. INFO NOTE */}
          <div className="flex gap-3 px-3 py-2 rounded-lg bg-muted/30 border border-dashed">
            <Info className="w-4 h-4 text-muted-foreground mt-0.5 shrink-0" />
            <p className="text-xs text-muted-foreground leading-relaxed">
              Dữ liệu đã lưu trữ <strong>không bị xóa</strong>. Bạn vẫn có thể
              tra cứu lại bằng cách bật bộ lọc{" "}
              <span className="inline-flex items-center px-1 py-0.5 rounded border bg-background text-[10px] font-medium">
                Lưu trữ
              </span>{" "}
              trong trang danh sách.
            </p>
          </div>
        </div>

        {/* === FOOTER === */}
        <DialogFooter className="px-6 py-4 border-t bg-background">
          <Button
            variant="ghost"
            onClick={() => onOpenChange(false)}
            disabled={archiveMutation.isPending}
          >
            Hủy bỏ
          </Button>
          <Button
            onClick={handleArchive}
            disabled={archiveMutation.isPending}
            className="bg-orange-600 hover:bg-orange-700 text-white min-w-[120px]"
          >
            {archiveMutation.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Đang xử lý...
              </>
            ) : (
              <>
                <Archive className="mr-2 h-4 w-4" /> Xác nhận lưu trữ
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
