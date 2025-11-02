import { type ColumnDef } from "@tanstack/react-table";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import {
  MoreHorizontal,
  Eye,
  Printer,
  XCircle,
  CheckCircle,
} from "lucide-react";
import type { POSOrderListItemDto } from "~/services/api/order/dto";
import { formatMoney } from "~/lib/utils";
import POSOrderDetailSheet from "../pos-order-detail.sheet";

// Status badge variant mapping
const getStatusVariant = (
  status: string
): "default" | "secondary" | "destructive" | "outline" => {
  const statusMap: Record<
    string,
    "default" | "secondary" | "destructive" | "outline"
  > = {
    pending: "secondary",
    completed: "default",
    cancelled: "destructive",
  };
  return statusMap[status.toLowerCase()] || "outline";
};

// Status display text mapping
const getStatusText = (status: string): string => {
  const statusTextMap: Record<string, string> = {
    pending: "Đang chờ",
    completed: "Hoàn thành",
    cancelled: "Đã hủy",
  };
  return statusTextMap[status.toLowerCase()] || status;
};

export const columns: ColumnDef<POSOrderListItemDto>[] = [
  {
    accessorKey: "index",
    header: "STT",
    cell: ({ row }) => {
      return <div className="w-12">{row.index + 1}</div>;
    },
  },
  {
    accessorKey: "id",
    header: "Mã đơn hàng",
    cell: ({ row }) => {
      return (
        <div className="font-mono text-sm">
          {row.original.id.slice(0, 8)}...
        </div>
      );
    },
  },
  {
    accessorKey: "invoiceId",
    header: "Mã hóa đơn",
    cell: ({ row }) => {
      return (
        <div className="font-mono text-sm text-muted-foreground">
          {row.original.invoiceId.slice(0, 8)}...
        </div>
      );
    },
  },
  {
    accessorKey: "customerId",
    header: "Khách hàng",
    cell: ({ row }) => {
      return (
        <div className="font-mono text-sm text-muted-foreground">
          {row.original.customerId.slice(0, 8)}...
        </div>
      );
    },
  },
  {
    accessorKey: "items",
    header: "Số món",
    cell: ({ row }) => {
      const itemCount = row.original.items?.length || 0;
      return (
        <div className="text-center">
          <Badge variant="outline">{itemCount}</Badge>
        </div>
      );
    },
  },
  {
    accessorKey: "totalAmount",
    header: "Tổng tiền",
    cell: ({ row }) => {
      const { vndFormatted } = formatMoney(row.original.totalAmount);
      return <div className="font-semibold text-primary">{vndFormatted}</div>;
    },
  },
  {
    accessorKey: "createdAt",
    header: "Ngày tạo",
    cell: ({ row }) => {
      return (
        <span className="text-sm">
          {format(new Date(row.original.createdAt), "dd/MM/yyyy HH:mm", {
            locale: vi,
          })}
        </span>
      );
    },
  },
  {
    accessorKey: "status",
    header: "Trạng thái",
    cell: ({ row }) => {
      const status = row.original.status;
      return (
        <Badge variant={getStatusVariant(status)}>
          {getStatusText(status)}
        </Badge>
      );
    },
  },
  {
    id: "actions",
    header: () => null,
    cell: ({ row }) => {
      const order = row.original;

      return (
        <div className="flex items-center gap-2">
          <POSOrderDetailSheet
            orderId={order.id}
            trigger={
              <Button variant="ghost" size="sm">
                <Eye className="h-4 w-4" />
              </Button>
            }
          />
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">Mở menu</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Hành động</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <Printer className="mr-2 h-4 w-4" />
                In đơn hàng
              </DropdownMenuItem>
              {order.status.toLowerCase() === "pending" && (
                <>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem>
                    <CheckCircle className="mr-2 h-4 w-4" />
                    Hoàn thành
                  </DropdownMenuItem>
                  <DropdownMenuItem className="text-destructive">
                    <XCircle className="mr-2 h-4 w-4" />
                    Hủy đơn
                  </DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      );
    },
  },
];
