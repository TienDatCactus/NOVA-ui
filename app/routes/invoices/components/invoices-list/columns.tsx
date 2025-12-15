import { type ColumnDef } from "@tanstack/react-table";
import { format, parseISO } from "date-fns";
import { ChevronDown } from "lucide-react";
import { useState } from "react";
import { DataTableColumnHeader } from "~/components/table/table-header";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import { cn, formatMoney } from "~/lib/utils";
import type { InvoiceListItemDto } from "~/services/api/invoices/dto";
import { INVOICE_STATUSES } from "~/services/api/invoices/invoice.types";
import { InvoiceDetailDialog } from "../invoice-detail/invoice-detail.dialog";

export const columns: ColumnDef<InvoiceListItemDto>[] = [
  {
    accessorKey: "invoiceNo",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Mã hóa đơn" />
    ),
    cell: ({ row }) => {
      const [open, setOpen] = useState(false);
      return (
        <div className="flex items-center gap-2">
          <Button variant="link" onClick={() => setOpen(true)}>
            {row.original.invoiceNo}
          </Button>
          {row.getCanExpand() && (
            <Button
              variant="ghost"
              size="icon"
              className="flex-shrink-0"
              onClick={() => row.toggleExpanded()}
            >
              <ChevronDown
                className={cn(
                  "h-4 w-4 transition-transform duration-200",
                  row.getIsExpanded() && "rotate-180"
                )}
              />
            </Button>
          )}
          <InvoiceDetailDialog
            open={open}
            onClose={() => setOpen(false)}
            invoiceId={row.original.invoiceId || ""}
          />
        </div>
      );
    },
  },
  {
    accessorKey: "issuedAt",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Ngày phát hành" />
    ),
    cell: ({ row }) => {
      try {
        const date = parseISO(row.original.issuedAt || "");
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
    accessorKey: "bookingCode",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Mã booking" />
    ),
    cell: ({ row }) => {
      return <p>{row.original.bookingCode}</p>;
    },
  },

  {
    accessorKey: "status",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Trạng thái" />
    ),
    cell: ({ row }) => {
      const status = INVOICE_STATUSES.find(
        (s) => s.value === row.original.status
      );
      return (
        <Badge variant={(status?.variant as any) || "default"}>
          {status?.label || row.original.status}
        </Badge>
      );
    },
  },
  {
    accessorKey: "total",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Tổng tiền" />
    ),
    cell: ({ row }) => {
      const { vndFormatted } = formatMoney(row.original.total ?? 0);
      return <span className="font-semibold">{vndFormatted}</span>;
    },
  },
];
