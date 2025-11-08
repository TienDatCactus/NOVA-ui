import { format, parseISO } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Badge } from "~/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "~/components/ui/table";
import { Separator } from "~/components/ui/separator";
import { Skeleton } from "~/components/ui/skeleton";
import { useInvoiceDetail } from "~/routes/invoices/container/invoices/query.hooks";
import { formatMoney } from "~/lib/utils";
import { INVOICE_STATUSES } from "~/services/api/invoices/invoice.types";
import { FileText, Calendar, CreditCard } from "lucide-react";

interface InvoiceDetailTabProps {
  invoiceId: string;
}

export default function InvoiceDetailTab({ invoiceId }: InvoiceDetailTabProps) {
  const { data: invoice, isPending } = useInvoiceDetail(invoiceId);

  if (isPending) return <Skeleton className="h-48 w-full" />;

  if (!invoice) return <div>Không tìm thấy hóa đơn</div>;

  const status = INVOICE_STATUSES.find((s) => s.value === invoice.status);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Thông tin hóa đơn</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground flex items-center gap-2">
                <FileText className="h-4 w-4" />
                Mã hóa đơn
              </p>
              <p className="font-semibold font-mono">{invoice.invoiceNo}</p>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Ngày phát hành
              </p>
              <p className="font-semibold">
                {invoice.issuedAt ? format(parseISO(invoice.issuedAt), "dd/MM/yyyy HH:mm") : "-"}
              </p>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground flex items-center gap-2">
                <CreditCard className="h-4 w-4" />
                Trạng thái
              </p>
              <Badge variant={(status?.variant as any) || "default"}>{status?.label || invoice.status}</Badge>
            </div>
          </div>

        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Chi tiết các mục</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>STT</TableHead>
                <TableHead>Loại</TableHead>
                <TableHead>Mô tả</TableHead>
                <TableHead className="text-center">Số lượng</TableHead>
                <TableHead className="text-right">Đơn giá</TableHead>
                <TableHead className="text-right">Thành tiền</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {invoice.items.map((item, idx) => (
                <TableRow key={item.id}>
                  <TableCell>{idx + 1}</TableCell>
                  <TableCell>{item.itemType}</TableCell>
                  <TableCell>
                    <div className="max-w-md">
                      <p className="font-medium">{item.description}</p>
                      {item.itemId && <p className="text-xs text-muted-foreground font-mono">ID: {item.itemId}</p>}
                    </div>
                  </TableCell>
                  <TableCell className="text-center">{item.quantity}</TableCell>
                  <TableCell className="text-right">{formatMoney(item.unitPrice).vndFormatted}</TableCell>
                  <TableCell className="text-right font-semibold">{formatMoney(item.subtotal).vndFormatted}</TableCell>
                </TableRow>
              ))}
              <TableRow className="bg-muted/50">
                <TableCell colSpan={5} className="text-right font-semibold">Tổng cộng</TableCell>
                <TableCell className="text-right font-bold text-lg">{formatMoney(invoice.total).vndFormatted}</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
