import { type ColumnDef } from "@tanstack/react-table";
import { ExternalLink } from "lucide-react";
import { format } from "date-fns";
import { Badge } from "~/components/ui/badge";
import { DataTableColumnHeader } from "~/components/table/table-header";
import { formatMoney } from "~/lib/utils";
import { FE_URL } from "~/lib/fe-url";
import type { StockTransactionsItemDto } from "~/services/api/stocks/items/dto";

// Transaction type badge configuration
const TRANSACTION_TYPE_CONFIG: Record<
  string,
  {
    variant: "default" | "success" | "destructive" | "warning";
    label: string;
  }
> = {
  OpeningBalance: { variant: "default", label: "Tồn đầu kỳ" },
  PurchaseIn: { variant: "success", label: "Nhập hàng" },
  ConsumptionOut: { variant: "warning", label: "Xuất tiêu thụ" },
  AdjustmentIn: { variant: "success", label: "Điều chỉnh +" },
  AdjustmentOut: { variant: "destructive", label: "Điều chỉnh -" },
};

// Source type badge configuration
const SOURCE_TYPE_CONFIG: Record<
  string,
  { variant: "default" | "secondary"; label: string }
> = {
  Manual: { variant: "secondary", label: "Thủ công" },
  PosOrder: { variant: "default", label: "Đơn hàng POS" },
  PurchaseRequest: { variant: "default", label: "Yêu cầu mua hàng" },
  StockAdjustment: { variant: "default", label: "Điều chỉnh kho" },
};

export const transactionColumns: ColumnDef<StockTransactionsItemDto>[] = [
  {
    accessorKey: "transactionDate",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Ngày giao dịch" />
    ),
    cell: ({ row }) => {
      const date = new Date(row.original.transactionDate);
      return (
        <div className="whitespace-nowrap">
          <div className="text-sm font-medium">
            {format(date, "dd/MM/yyyy")}
          </div>
          <div className="text-xs text-muted-foreground">
            {format(date, "HH:mm:ss")}
          </div>
        </div>
      );
    },
    sortingFn: "datetime",
  },
  {
    accessorKey: "transactionType",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Loại giao dịch" />
    ),
    cell: ({ row }) => {
      const config = TRANSACTION_TYPE_CONFIG[row.original.transactionType] || {
        variant: "default" as const,
        label: row.original.transactionType,
      };
      return <Badge variant={config.variant}>{config.label}</Badge>;
    },
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id));
    },
  },
  {
    accessorKey: "sourceType",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Nguồn" />
    ),
    cell: ({ row }) => {
      const config = SOURCE_TYPE_CONFIG[row.original.sourceType] || {
        variant: "default" as const,
        label: row.original.sourceType,
      };
      return <Badge variant={config.variant}>{config.label}</Badge>;
    },
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id));
    },
  },
  {
    accessorKey: "quantity",
    header: ({ column }) => (
      <DataTableColumnHeader
        column={column}
        title="Số lượng"
        className="justify-end"
      />
    ),
    cell: ({ row }) => {
      const isOut =
        row.original.transactionType === "ConsumptionOut" ||
        row.original.transactionType === "AdjustmentOut";
      return (
        <div className="text-right">
          <span
            className={`font-mono font-semibold ${
              isOut ? "text-red-600" : "text-green-600"
            }`}
          >
            {isOut ? "-" : "+"}
            {row.original.quantity}
          </span>
        </div>
      );
    },
  },
  {
    accessorKey: "costPrice",
    header: ({ column }) => (
      <DataTableColumnHeader
        column={column}
        title="Giá"
        className="justify-end"
      />
    ),
    cell: ({ row }) => {
      return (
        <div className="text-right font-mono text-sm">
          {formatMoney(row.original.costPrice).vndFormatted}
        </div>
      );
    },
  },
  {
    accessorKey: "reference",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Mã tham chiếu" />
    ),
    cell: ({ row }) => {
      const { sourceType, sourceId, reference } = row.original;

      if (!sourceId) {
        return (
          <span className="text-muted-foreground font-mono text-sm">
            {reference}
          </span>
        );
      }

      const baseUrls: Record<string, string> = {
        PurchaseRequest: FE_URL.dashboard.stocks.purchaseRequests,
        StockAdjustment: FE_URL.dashboard.stocks.adjustments,
        PosOrder: "/dashboard/orders",
      };

      const url = baseUrls[sourceType];

      return url ? (
        <a
          href={url}
          className="inline-flex items-center gap-1 text-primary hover:underline font-mono text-sm"
          target="_blank"
          rel="noopener noreferrer"
        >
          {reference}
          <ExternalLink className="h-3 w-3" />
        </a>
      ) : (
        <span className="text-muted-foreground font-mono text-sm">
          {reference}
        </span>
      );
    },
    enableSorting: false,
  },
  {
    accessorKey: "note",
    header: "Ghi chú",
    cell: ({ row }) => {
      return (
        <div className="max-w-xs truncate text-sm text-muted-foreground">
          {row.original.note || "—"}
        </div>
      );
    },
    enableSorting: false,
  },
];
