import { format } from "date-fns";
import { Download } from "lucide-react";
import { toast } from "sonner";
import { Button } from "~/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "~/components/ui/table";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "~/components/ui/tooltip";
import { InvoicesService } from "~/services/api/invoices";
import type { InvoiceDetailItemDto } from "~/services/api/invoices/dto";
import { INVOICE_STATUSES } from "~/services/api/invoices/invoice.types";
import { PAYMENT_METHODS } from "~/services/types/payment.types";
import { useInvoiceDetail } from "../../container/invoices/query.hooks";
import { formatMoney } from "~/lib/utils";
import { AxiosError } from "axios";
import type { error } from "console";
import { useExportInvoice } from "../../container/invoices/mutation.hooks";

type InvoiceDetailDialogProps = {
  open: boolean;
  onClose: () => void;
  invoiceId: string;
};

export function InvoiceDetailDialog({
  open,
  onClose,
  invoiceId,
}: InvoiceDetailDialogProps) {
  const { data: invoice } = useInvoiceDetail(invoiceId, {
    enabled: open,
  });
  const { mutateAsync } = useExportInvoice(invoiceId);
  if (!invoice) return null;

  const handleExport = async () => {
    try {
      const blob = await mutateAsync();
      console.log("Blob received:", blob);

      const url = window.URL.createObjectURL(blob as any);
      const a = document.createElement("a");
      a.href = url;
      const filename = `invoice-${invoiceId}.xlsx`;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      toast.success("Xuất hóa đơn thành công");
    } catch (error) {
      toast.error("Lỗi khi xuất báo cáo");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="bg-card shadow-sm rounded-2xl p-6 max-w-3xl w-full overflow-y-auto max-h-[90vh] ">
        <DialogHeader>
          <DialogTitle className="text-lg font-bold text-foreground flex items-center gap-4">
            Hóa đơn #{invoice.invoiceNo}
            <span className="text-xs px-2 py-1 rounded bg-muted text-muted-foreground font-normal ml-2">
              {
                INVOICE_STATUSES.find(
                  (status) => status.value === invoice.status
                )?.label
              }
            </span>
          </DialogTitle>
          <div className="text-sm text-muted-foreground mt-1">
            Ngày phát hành:{" "}
            {invoice.issuedAt
              ? format(new Date(invoice.issuedAt), " HH:mm dd/MM/yyyy")
              : "-"}
          </div>
        </DialogHeader>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
          <div className="space-y-2">
            <div className="text-xs text-muted-foreground">
              Mã phòng/BookingRoomId
            </div>
            <div className="font-medium text-foreground">
              {invoice.bookingRoomId || "-"}
            </div>
            <div className="text-xs text-muted-foreground mt-2">
              Phương thức thanh toán
            </div>
            <div className="font-medium text-foreground">
              {PAYMENT_METHODS.find(
                (method) => method.value === invoice.paymentMethod
              )?.label || "-"}
            </div>
          </div>
          <div className="space-y-2">
            <div className="text-xs text-muted-foreground">Tạm tính</div>
            <div className="font-medium text-foreground">
              {formatMoney(invoice.subTotal ?? 0).vndFormatted || 0}
            </div>
            <div className="text-xs text-muted-foreground mt-2">VAT</div>
            <div className="font-medium text-foreground">
              {formatMoney(invoice.vatAmount ?? 0).vndFormatted || 0}
            </div>
            <div className="text-xs text-muted-foreground mt-2">
              Phí dịch vụ
            </div>
            <div className="font-medium text-foreground">
              {formatMoney(invoice.serviceChargeAmount ?? 0).vndFormatted || 0}
            </div>
            <div className="text-xs text-muted-foreground mt-2">Tổng cộng</div>
            <div className="font-bold text-primary text-lg">
              {formatMoney(invoice.total ?? 0).vndFormatted || 0}
            </div>
          </div>
        </div>
        <div className="mt-8">
          <div className="font-semibold text-foreground mb-2">
            Chi tiết các mục
          </div>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>STT</TableHead>
                <TableHead>Loại</TableHead>
                <TableHead>Mô tả</TableHead>
                <TableHead>Số lượng</TableHead>
                <TableHead>Đơn giá</TableHead>
                <TableHead>Tạm tính</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {invoice.items && invoice.items.length > 0 ? (
                invoice.items.map(
                  (item: InvoiceDetailItemDto, index: number) => (
                    <TableRow key={item.id || Math.random()}>
                      <TableCell className="text-xs text-muted-foreground">
                        {index + 1}
                      </TableCell>
                      <TableCell>{item.itemType || "-"}</TableCell>
                      <TableCell className="max-w-[180px] truncate">
                        <Tooltip>
                          <TooltipTrigger className=" cursor-help truncate line-clamp-1 max-w-30">
                            {item.description || "-"}
                          </TooltipTrigger>
                          <TooltipContent>{item.description}</TooltipContent>
                        </Tooltip>
                      </TableCell>
                      <TableCell>{item.quantity ?? "-"}</TableCell>
                      <TableCell>{item.unitPrice ?? "-"}</TableCell>
                      <TableCell>{item.subtotal ?? "-"}</TableCell>
                    </TableRow>
                  )
                )
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={8}
                    className="text-center text-muted-foreground"
                  >
                    Không có mục nào trong hóa đơn này.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
        <DialogFooter className="flex items-center gap-2">
          <Button variant="success" size="sm" onClick={handleExport}>
            <Download className="h-4 w-4" />
            Xuất hóa đơn
          </Button>
          <Button variant="outline" onClick={onClose}>
            Đóng
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
