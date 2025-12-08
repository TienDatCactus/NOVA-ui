import { format, parseISO } from "date-fns";
import { vi } from "date-fns/locale";
import {
  ArrowDown,
  ArrowUp,
  CalendarDays,
  ClipboardList,
  FileText,
  Loader2,
  PackageSearch,
} from "lucide-react";

import { Badge } from "~/components/ui/badge";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog";
import { ScrollArea } from "~/components/ui/scroll-area";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "~/components/ui/table";
import { cn } from "~/lib/utils";
import { useStockAdjustmentDetail } from "../container/query.hooks";
import { Button } from "~/components/ui/button";

interface StockAdjustmentDetailDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  adjustmentId: string;
}

export default function StockAdjustmentDetailDialog({
  open,
  onOpenChange,
  adjustmentId,
}: StockAdjustmentDetailDialogProps) {
  // 1. Fetch Data
  const { data, isPending } = useStockAdjustmentDetail(adjustmentId);
  const adjustment = (data as any)?.data || data; // Handle API wrapper if exists

  const getDiffStyle = (diff: number) => {
    if (diff > 0)
      return {
        color: "text-green-600",
        bg: "bg-green-50",
        icon: <ArrowUp className="w-3 h-3 mr-1" />,
        prefix: "+",
      };
    if (diff < 0)
      return {
        color: "text-red-600",
        bg: "bg-red-50",
        icon: <ArrowDown className="w-3 h-3 mr-1" />,
        prefix: "", // Negative number already has "-"
      };
    return {
      color: "text-muted-foreground",
      bg: "bg-muted",
      icon: null,
      prefix: "",
    };
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[85vh] p-0 flex flex-col overflow-y-auto gap-0">
        {/* --- Header Section --- */}
        <DialogHeader className="p-6 pb-4 border-b shrink-0 bg-background/95  z-10">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1.5">
              <DialogTitle className="text-xl flex items-center gap-2">
                Phiếu kiểm kê / Điều chỉnh
              </DialogTitle>
              <DialogDescription className="flex items-center gap-2 text-sm">
                <span className="font-mono font-semibold text-foreground bg-muted px-1.5 py-0.5 rounded text-xs">
                  {adjustment?.reference || "..."}
                </span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <CalendarDays className="w-3.5 h-3.5" />
                  {adjustment?.adjustmentDate
                    ? format(
                        parseISO(adjustment.adjustmentDate),
                        "dd/MM/yyyy",
                        {
                          locale: vi,
                        }
                      )
                    : "..."}
                </span>
              </DialogDescription>
            </div>

            {/* Status Badge */}
            {adjustment && (
              <Badge
                variant={adjustment.isApplied ? "default" : "secondary"}
                className={cn(
                  "w-fit px-3 py-1 text-sm font-medium",
                  adjustment.isApplied
                    ? "bg-green-600 hover:bg-green-700" // Applied = Success/Done
                    : "bg-orange-100 text-orange-700 hover:bg-orange-200 border-orange-200" // Not Applied = Pending/Draft
                )}
              >
                {adjustment.isApplied
                  ? "Đã cân bằng kho"
                  : "Nháp / Chưa áp dụng"}
              </Badge>
            )}
          </div>
        </DialogHeader>

        {isPending ? (
          <div className="flex-1 flex items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : adjustment ? (
          <div className="p-6 space-y-8">
            {/* --- 1. Context Block (Reason) --- */}
            <div className="bg-muted/30 border rounded-lg p-4 flex gap-4 items-start">
              <div className="p-2 bg-background rounded-md border shadow-sm shrink-0">
                <ClipboardList className="w-5 h-5 text-muted-foreground" />
              </div>
              <div className="space-y-1">
                <h4 className="text-sm font-semibold text-foreground">
                  Lý do điều chỉnh
                </h4>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {adjustment.reason || "Không có lý do cụ thể."}
                </p>
              </div>
            </div>

            {/* --- 2. Items Table --- */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <PackageSearch className="h-4 w-4 text-muted-foreground" />
                  <h3 className="font-semibold text-base">
                    Chi tiết chênh lệch
                  </h3>
                  <Badge variant="outline" className="ml-2">
                    {adjustment.items.length} mã hàng
                  </Badge>
                </div>
              </div>

              <div className="border rounded-md overflow-hidden shadow-sm">
                <Table>
                  <TableHeader className="bg-muted/50">
                    <TableRow>
                      <TableHead className="w-[50px] text-center">
                        STT
                      </TableHead>
                      <TableHead className="min-w-[200px]">Hàng hóa</TableHead>
                      <TableHead className="hidden md:table-cell">
                        Ghi chú (Line Item)
                      </TableHead>

                      <TableHead className="text-right w-[180px]">
                        Đơn vị
                      </TableHead>
                      <TableHead className="text-right w-[180px]">
                        Chênh lệch
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {adjustment.items.map((item: any, index: number) => {
                      const style = getDiffStyle(item.quantityDiff);
                      return (
                        <TableRow key={item.id || index} className="group">
                          <TableCell className="text-center font-medium text-muted-foreground text-xs">
                            {index + 1}
                          </TableCell>
                          <TableCell>
                            <div className="flex flex-col gap-0.5">
                              <span className="font-medium text-sm">
                                {item.itemName}
                              </span>
                              <span className="font-mono text-xs text-muted-foreground bg-muted/50 w-fit px-1 rounded">
                                {item.itemCode}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell className="hidden md:table-cell">
                            {item.note ? (
                              <div className="flex items-start gap-1.5 text-sm text-muted-foreground">
                                <FileText className="w-3 h-3 mt-0.5 opacity-70" />
                                <span className="italic">{item.note}</span>
                              </div>
                            ) : (
                              <span className="text-muted-foreground/30 text-xs">
                                —
                              </span>
                            )}
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="grid gap-2">
                              <span className="font-semibold">
                                {item.unitName}
                              </span>
                              <span className="text-xs text-muted-foreground font-mono">
                                {item.unitCode}
                              </span>{" "}
                            </div>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end">
                              <div
                                className={cn(
                                  "flex items-center px-2 py-1 rounded font-bold font-mono text-sm border",
                                  style.bg,
                                  style.color,
                                  item.quantityDiff === 0
                                    ? "border-transparent"
                                    : "border-current/20"
                                )}
                              >
                                {style.icon}
                                {style.prefix}
                                {item.quantityDiff}
                              </div>
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            </div>

            {/* Optional Footer Metadata */}
            <div className="flex justify-end text-xs text-muted-foreground">
              UUID: {adjustment.id}
            </div>
          </div>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center gap-3 text-muted-foreground">
            <PackageSearch className="h-10 w-10 opacity-20" />
            <p>Không tìm thấy thông tin phiếu.</p>
          </div>
        )}
        <DialogFooter className="px-6 py-4 ">
          <DialogClose>
            <Button>Đóng</Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
