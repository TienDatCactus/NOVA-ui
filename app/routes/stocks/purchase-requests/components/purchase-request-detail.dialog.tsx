import { format, parseISO } from "date-fns";
import { vi } from "date-fns/locale";
import {
  CalendarDays,
  CreditCard,
  Download,
  FileText,
  Loader2,
  Package,
  User,
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
import { Separator } from "~/components/ui/separator";
import {
  Table,
  TableBody,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "~/components/ui/table";

import { Button } from "~/components/ui/button";
import { formatMoney } from "~/lib/utils";
import { usePurchaseRequestDetail } from "../container/query.hooks";
import { getStatusBadge } from "./purchase-requests-list/columns";
import { toast } from "sonner";
import { PurchaseRequestsService } from "~/services/api/stocks/purchase-requests";

interface PurchaseRequestDetailDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  purchaseRequestId: string;
}

export default function PurchaseRequestDetailDialog({
  open,
  onOpenChange,
  purchaseRequestId,
}: PurchaseRequestDetailDialogProps) {
  const { data, isPending } = usePurchaseRequestDetail(purchaseRequestId);

  const purchaseRequest = (data as any)?.data || data;

  const totalCost =
    purchaseRequest?.items?.reduce(
      (sum: number, item: any) => sum + item.quantity * item.unitCost,
      0
    ) || 0;

  const handleExport = async () => {
    try {
      const blob = await PurchaseRequestsService.exportPurchaseRequest(
        purchaseRequest.id
      );
      console.log("Blob received:", blob);

      const url = window.URL.createObjectURL(blob as any);
      const a = document.createElement("a");
      a.href = url;
      const filename = `purchase-request-${purchaseRequest.id}.xlsx`;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);

      toast.success("Xuất báo cáo thành công");
    } catch (e) {
      console.error(e);
      toast.error("Xuất báo cáo thất bại");
    }
  };
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl max-h-[90vh]  p-0 gap-0 flex flex-col overflow-y-auto">
        {/* --- Header Section --- */}
        <DialogHeader className="p-6 pb-4 border-b shrink-0 space-y-2">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <DialogTitle className="text-xl flex items-center gap-3">
                Chi tiết phiếu đề nghị
                {purchaseRequest && getStatusBadge(purchaseRequest.status)}
              </DialogTitle>
              <DialogDescription className="font-mono text-sm text-primary font-medium bg-primary/5 w-fit px-2 py-0.5 rounded">
                #{purchaseRequest?.requestNumber}
              </DialogDescription>
            </div>
            {purchaseRequest?.isReceived && (
              <Badge
                variant="outline"
                className="border-green-500 text-green-600 bg-green-50"
              >
                <Package className="w-3 h-3 mr-1" /> Đã nhận hàng
              </Badge>
            )}
          </div>
        </DialogHeader>

        {isPending ? (
          <div className="flex-1 flex items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : purchaseRequest ? (
          <div className="p-6 space-y-8">
            {/* --- 1. General Info Grid (Clean Data Display) --- */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 text-sm">
              <div className="space-y-1.5">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <CalendarDays className="h-4 w-4" />
                  <span className="text-xs font-medium uppercase tracking-wider">
                    Ngày tạo
                  </span>
                </div>
                <p className="font-medium pl-6">
                  {format(
                    parseISO(purchaseRequest.requestedAt),
                    " HH:mm dd/MM/yyyy",
                    { locale: vi }
                  )}
                </p>
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <User className="h-4 w-4" />
                  <span className="text-xs font-medium uppercase tracking-wider">
                    Người duyệt
                  </span>
                </div>
                <p className="font-medium pl-6">
                  {purchaseRequest.approvedByName || "—"}
                </p>
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <CalendarDays className="h-4 w-4" />
                  <span className="text-xs font-medium uppercase tracking-wider">
                    Ngày duyệt
                  </span>
                </div>
                <p className="font-medium pl-6">
                  {purchaseRequest.approvedAt
                    ? format(
                        parseISO(purchaseRequest.approvedAt),
                        " HH:mm dd/MM/yyyy",
                        { locale: vi }
                      )
                    : "—"}
                </p>
              </div>

              {/* Notes spanning standard width */}
              <div className="space-y-1.5 md:col-span-2 lg:col-span-1">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <FileText className="h-4 w-4" />
                  <span className="text-xs font-medium uppercase tracking-wider">
                    Ghi chú phiếu
                  </span>
                </div>
                <p
                  className="pl-6 text-muted-foreground italic truncate"
                  title={purchaseRequest.notes}
                >
                  {purchaseRequest.notes || "Không có ghi chú"}
                </p>
              </div>
            </div>

            <Separator />

            {/* --- 2. Items Table (The UX Upgrade) --- */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <CreditCard className="h-4 w-4 text-muted-foreground" />
                <h3 className="font-semibold text-base">Danh sách hàng hóa</h3>
                <Badge variant="secondary" className="ml-2 rounded-full px-2">
                  {purchaseRequest.items.length}
                </Badge>
              </div>

              <div className="rounded-md border overflow-hidden">
                <Table>
                  <TableHeader className="bg-muted/40">
                    <TableRow>
                      <TableHead className="w-[50px] text-center">
                        STT
                      </TableHead>
                      <TableHead className="min-w-[200px]">
                        Tên hàng hóa
                      </TableHead>
                      <TableHead className="text-right">Số lượng</TableHead>
                      <TableHead className="text-right">Đơn giá</TableHead>
                      <TableHead className="text-right font-semibold text-foreground">
                        Thành tiền
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {purchaseRequest.items.map((item: any, index: number) => (
                      <TableRow key={item.id} className="hover:bg-muted/10">
                        <TableCell className="text-center font-medium text-muted-foreground">
                          {index + 1}
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-col gap-0.5">
                            <span className="font-medium text-sm">
                              {item.freeTextItemName}
                            </span>
                            {(item.itemCode ||
                              item.freeTextItemDescription) && (
                              <div className="text-xs text-muted-foreground flex gap-2">
                                {item.itemCode && (
                                  <span className="font-mono bg-muted px-1 rounded">
                                    {item.itemCode}
                                  </span>
                                )}
                                <span className="truncate max-w-[200px]">
                                  {item.freeTextItemDescription}
                                </span>
                              </div>
                            )}
                            {item.note && (
                              <p className="text-xs text-amber-600/80 italic mt-1">
                                Note: {item.note}
                              </p>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex flex-col items-end">
                            <span className="font-medium">
                              {item.quantity.toLocaleString()}
                            </span>
                            <span className="text-xs text-muted-foreground">
                              {item.freeTextUnitName}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell className="text-right font-mono text-muted-foreground">
                          {formatMoney(item.unitCost).vndFormatted}
                        </TableCell>
                        <TableCell className="text-right font-mono font-medium">
                          {formatMoney(item.quantity * item.unitCost).vndFormatted}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                  <TableFooter className="bg-muted/20">
                    <TableRow>
                      <TableCell
                        colSpan={4}
                        className="text-right font-bold text-muted-foreground uppercase text-xs"
                      >
                        Tổng chi phí ước tính
                      </TableCell>
                      <TableCell className="text-right">
                        <span className="text-lg font-bold text-primary">
                          {formatMoney(totalCost).vndFormatted}
                        </span>
                      </TableCell>
                    </TableRow>
                  </TableFooter>
                </Table>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-center flex-1 text-muted-foreground">
            Không tìm thấy dữ liệu
          </div>
        )}
        <DialogFooter className="p-6 pt-4 border-t shrink-0">
          <Button onClick={handleExport} variant={"success"}>
            <Download className="h-4 w-4 " />
            Xuất phiếu
          </Button>
          <DialogClose>
            <Button variant={"outline"}>Đóng</Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
