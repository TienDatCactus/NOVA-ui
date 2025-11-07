import { type ColumnDef } from "@tanstack/react-table";
import { Button } from "~/components/ui/button";
import { useState } from "react";
import { Dialog, DialogTrigger } from "~/components/ui/dialog";
import InvoiceDetailDialog from "../invoice-detail.dialog";
import { Badge } from "~/components/ui/badge";
import { format, parseISO } from "date-fns";
import { formatMoney } from "~/lib/utils";
import type { InvoiceListItemDto } from "~/services/api/invoices/dto";
import { INVOICE_STATUSES } from "~/services/api/invoices/invoice.types";
import { FileText } from "lucide-react";
import { Link } from "react-router";

export const columns: ColumnDef<InvoiceListItemDto>[] = [
  {
    accessorKey: "index",
    header: "STT",
    cell: ({ row }) => {
      return <span className="font-medium">{row.index + 1}</span>;
    },
  },
  {
    accessorKey: "invoiceNo",
    header: "Mã hóa đơn",
    cell: ({ row }) => {
      const [open, setOpen] = useState(false);
      return (
        <div className="flex items-center gap-2">
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button variant="link" className="p-0 font-mono">
                {row.original.invoiceNo}
              </Button>
            </DialogTrigger>
            <InvoiceDetailDialog invoiceId={row.original.invoiceId} open={open} onOpenChange={setOpen} />
          </Dialog>
        </div>
      );
    },
  },
  {
    accessorKey: "bookingCode",
    header: "Mã booking",
    cell: ({ row }) => {
      return (
        <span className="font-mono text-sm">{row.original.bookingCode}</span>
      );
    },
  },
  {
    accessorKey: "customerName",
    header: "Khách hàng",
    cell: ({ row }) => {
      return (
        <div className="max-w-[200px]">
          <p className="font-medium truncate">{row.original.customerName}</p>
        </div>
      );
    },
  },
  {
    accessorKey: "invoiceType",
    header: "Loại",
    cell: ({ row }) => {
      return (
        <span className="text-sm text-muted-foreground">
          {row.original.invoiceType}
        </span>
      );
    },
  },
  {
    accessorKey: "total",
    header: "Tổng tiền",
    cell: ({ row }) => {
      const { vndFormatted } = formatMoney(row.original.total);
      return <span className="font-semibold">{vndFormatted}</span>;
    },
  },
  {
    accessorKey: "paidAmount",
    header: "Đã thanh toán",
    cell: ({ row }) => {
      const { vndFormatted } = formatMoney(row.original.paidAmount);
      return <span className="text-sm">{vndFormatted}</span>;
    },
  },
  {
    accessorKey: "balance",
    header: "Còn lại",
    cell: ({ row }) => {
      const { vndFormatted } = formatMoney(row.original.balance);
      const isNegative = row.original.balance < 0;
      return (
        <span
          className={`font-medium ${
            isNegative ? "text-destructive" : "text-foreground"
          }`}
        >
          {vndFormatted}
        </span>
      );
    },
  },
  {
    accessorKey: "status",
    header: "Trạng thái",
    cell: ({ row }) => {
      const status = INVOICE_STATUSES.find(
        (s) => s.value === row.original.status
      );
      return (
        <Badge variant={status?.variant as any || "default"}>
          {status?.label || row.original.status}
        </Badge>
      );
    },
  },
  {
    accessorKey: "paymentMethod",
    header: "PT thanh toán",
    cell: ({ row }) => {
      const method = row.original.paymentMethod;
      if (!method || method === "Unknown") {
        return <span className="text-sm text-muted-foreground">—</span>;
      }
      const methodLabels: Record<string, string> = {
        Cash: "Tiền mặt",
        Card: "Thẻ",
        BankTransfer: "Chuyển khoản",
        OTACollect: "OTA thu hộ",
        OTAPrepaid: "OTA trả trước",
        OnAccount: "Ghi nợ",
      };
      return (
        <span className="text-sm">{methodLabels[method] || method}</span>
      );
    },
  },
  {
    accessorKey: "issuedAt",
    header: "Ngày phát hành",
    cell: ({ row }) => {
      try {
        const date = parseISO(row.original.issuedAt);
        return (
          <div className="text-sm">
            <div>{format(date, "dd/MM/yyyy")}</div>
            <div className="text-xs text-muted-foreground">
              {format(date, "HH:mm")}
            </div>
          </div>
        );
      } catch {
        return (
          <span className="text-sm text-muted-foreground">
            {row.original.issuedAt}
          </span>
        );
      }
    },
  },
  {
    accessorKey: "itemCount",
    header: "Số mục",
    cell: ({ row }) => {
      return (
        <div className="flex items-center gap-1">
          <FileText className="h-3 w-3 text-muted-foreground" />
          <span className="text-sm">{row.original.itemCount}</span>
        </div>
      );
    },
  },
];
