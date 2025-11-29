import { useState } from "react";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import {
  FileDown,
  Download,
  FileSpreadsheet,
  FileText,
  CheckCircle2,
  CalendarRange,
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
import { DateRangePicker } from "~/components/ui/date-range-picker";
import { toast } from "sonner";
import { useExportAuditLogs } from "../container/query.hooks";
import { cn } from "~/lib/utils";
import { Separator } from "~/components/ui/separator";

interface ExportAuditDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function ExportAuditDialog({
  open,
  onOpenChange,
}: ExportAuditDialogProps) {
  const [fileFormat, setFileFormat] = useState<"Excel" | "CSV">("Excel");
  const [dateRange, setDateRange] = useState<{ from?: Date; to?: Date }>({});

  const exportMutation = useExportAuditLogs();

  const handleExport = async () => {
    try {
      const blob = await exportMutation.mutateAsync({
        fromDate: dateRange?.from
          ? format(dateRange.from, "yyyy-MM-dd")
          : undefined,
        toDate: dateRange?.to ? format(dateRange.to, "yyyy-MM-dd") : undefined,
      });

      // Create download link
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      const extension = fileFormat === "Excel" ? "xlsx" : "csv";
      a.download = `audit-logs-${format(new Date(), "yyyyMMdd-HHmm")}.${extension}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      toast.success("Xuất dữ liệu thành công");
      onOpenChange(false);
    } catch (error) {
      console.error("Export error:", error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg p-0 gap-0 overflow-hidden">
        {/* === HEADER === */}
        <DialogHeader className="px-6 py-4 border-b bg-muted/5">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-500/10 rounded-lg text-green-600">
              <FileDown className="h-5 w-5" />
            </div>
            <div>
              <DialogTitle>Xuất dữ liệu</DialogTitle>
              <DialogDescription className="mt-0.5">
                Tải xuống bản ghi nhật ký hoạt động để lưu trữ hoặc báo cáo.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="p-6 space-y-6">
          {/* 1. FORMAT SELECTION (Cards) */}
          <div className="space-y-3">
            <Label className="text-sm font-semibold text-foreground">
              1. Chọn định dạng file
            </Label>
            <div className="grid grid-cols-2 gap-4">
              {/* Option: Excel */}
              <div
                onClick={() => setFileFormat("Excel")}
                className={cn(
                  "relative flex flex-col items-center gap-2 p-4 rounded-xl border-2 cursor-pointer transition-all hover:bg-muted/50",
                  fileFormat === "Excel"
                    ? "border-green-500 bg-green-50/50"
                    : "border-muted bg-background"
                )}
              >
                {fileFormat === "Excel" && (
                  <div className="absolute top-2 right-2 text-green-600">
                    <CheckCircle2 className="w-4 h-4" />
                  </div>
                )}
                <div className="p-2 bg-green-100 text-green-700 rounded-full">
                  <FileSpreadsheet className="w-6 h-6" />
                </div>
                <div className="text-center space-y-0.5">
                  <p className="font-semibold text-sm">Microsoft Excel</p>
                  <p className="text-[11px] text-muted-foreground">
                    Phù hợp làm báo cáo
                  </p>
                </div>
              </div>

              {/* Option: CSV */}
              <div
                onClick={() => setFileFormat("CSV")}
                className={cn(
                  "relative flex flex-col items-center gap-2 p-4 rounded-xl border-2 cursor-pointer transition-all hover:bg-muted/50",
                  fileFormat === "CSV"
                    ? "border-blue-500 bg-blue-50/50"
                    : "border-muted bg-background"
                )}
              >
                {fileFormat === "CSV" && (
                  <div className="absolute top-2 right-2 text-blue-600">
                    <CheckCircle2 className="w-4 h-4" />
                  </div>
                )}
                <div className="p-2 bg-blue-100 text-blue-700 rounded-full">
                  <FileText className="w-6 h-6" />
                </div>
                <div className="text-center space-y-0.5">
                  <p className="font-semibold text-sm">CSV File</p>
                  <p className="text-[11px] text-muted-foreground">
                    Dữ liệu thô / Import
                  </p>
                </div>
              </div>
            </div>
          </div>

          <Separator />

          {/* 2. DATE RANGE */}
          <div className="space-y-3">
            <Label className="text-sm font-semibold text-foreground">
              2. Phạm vi dữ liệu
            </Label>
            <div className="space-y-2">
              <DateRangePicker
                from={dateRange?.from}
                to={dateRange?.to}
                onRangeChange={(range) =>
                  setDateRange({ from: range.from, to: range.to })
                }
                className="w-full"
                placeholder="Chọn khoảng thời gian cần xuất"
              />
              <div className="flex items-center gap-2 text-xs text-muted-foreground ml-1">
                <CalendarRange className="w-3 h-3" />
                {dateRange.from ? (
                  <span>
                    Dữ liệu từ{" "}
                    <span className="font-medium text-foreground">
                      {format(dateRange.from, "dd/MM/yyyy")}
                    </span>
                    {dateRange.to ? (
                      <>
                        {" "}
                        đến{" "}
                        <span className="font-medium text-foreground">
                          {format(dateRange.to, "dd/MM/yyyy")}
                        </span>
                      </>
                    ) : (
                      " trở đi"
                    )}
                  </span>
                ) : (
                  <span>
                    Xuất{" "}
                    <span className="font-medium text-foreground">Toàn bộ</span>{" "}
                    dữ liệu từ trước đến nay
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* === FOOTER === */}
        <DialogFooter className="px-6 py-4 border-t bg-background">
          <Button
            variant="ghost"
            onClick={() => onOpenChange(false)}
            disabled={exportMutation.isPending}
          >
            Hủy bỏ
          </Button>
          <Button
            onClick={handleExport}
            disabled={exportMutation.isPending}
            className={cn(
              "min-w-[140px]",
              fileFormat === "Excel"
                ? "bg-green-600 hover:bg-green-700"
                : "bg-primary"
            )}
          >
            {exportMutation.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Đang xử lý...
              </>
            ) : (
              <>
                <Download className="mr-2 h-4 w-4" /> Xuất {fileFormat}
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
