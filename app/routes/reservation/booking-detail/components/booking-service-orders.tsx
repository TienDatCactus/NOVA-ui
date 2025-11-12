import { CableCar, MoreHorizontal, Plus } from "lucide-react";
import { useState } from "react";
import type z from "zod";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import { Skeleton } from "~/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "~/components/ui/table";
import { formatMoney } from "~/lib/utils";
import { OrderSchema } from "~/services/api/orders/order.schema";

type ServiceOrderFromBookingDetail = z.infer<
  typeof OrderSchema.ServiceOrderListByBookingDetailSchema
>;

interface BookingServiceOrdersProps {
  isCreatingOrder?: boolean;
  ordersList?: ServiceOrderFromBookingDetail;
  isLoadingOrder?: boolean;
  onOpenCreateDialog: () => void;
  onCancelOrder?: (orderId: string) => void;
  onCompleteOrder?: (orderId: string) => void;
}

export default function BookingServiceOrders({
  isCreatingOrder = false,
  ordersList = [],
  isLoadingOrder = false,
  onOpenCreateDialog,
  onCancelOrder,
  onCompleteOrder,
}: BookingServiceOrdersProps) {
  const getStatusBadge = (status?: string) => {
    switch (status) {
      case "Completed":
        return <Badge variant="success">Hoàn thành</Badge>;
      case "Cancelled":
        return <Badge variant="destructive">Đã hủy</Badge>;
      case "NoShow":
        return <Badge variant="warning">Không đến</Badge>;
      case "Scheduled":
      default:
        return <Badge variant="secondary">Đã đặt</Badge>;
    }
  };

  // If no order exists, show create button
  if (ordersList.length === 0) {
    return (
      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CableCar className="h-5 w-5" />
            Đơn dịch vụ tại quầy
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <CableCar className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-sm text-muted-foreground mb-4">
              Chưa có đơn dịch vụ nào cho booking này
            </p>
            <Button
              type="button"
              onClick={onOpenCreateDialog}
              disabled={isCreatingOrder}
            >
              {isCreatingOrder ? "Đang tạo..." : "Tạo đơn dịch vụ"}
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Calculate grand total from all orders
  const grandTotal = ordersList.reduce(
    (sum, order) => sum + (order.total || 0),
    0
  );

  return (
    <Card className="shadow-md">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <CableCar className="h-5 w-5" />
            Đơn dịch vụ tại quầy
            <Badge variant="secondary" className="ml-2">
              {ordersList.length} dịch vụ
            </Badge>
          </CardTitle>
          <div className="flex items-center gap-3">
            <div className="text-sm">
              <span className="text-muted-foreground">Tổng cộng: </span>
              <span className="font-semibold text-lg text-primary">
                {formatMoney(grandTotal).vndFormatted}
              </span>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {isLoadingOrder ? (
          <div className="space-y-2">
            {[...Array(3)].map((_, i) => (
              <Skeleton key={i} className="h-16 w-full" />
            ))}
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Dịch vụ</TableHead>
                <TableHead>Số lượng</TableHead>
                <TableHead>Tổng tiền</TableHead>
                <TableHead>Trạng thái</TableHead>
                <TableHead className="text-right">Thao tác</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {ordersList.map((order) => {
                return (
                  <TableRow key={order.id} className="hover:bg-muted/50">
                    <TableCell className="font-medium">
                      {order.serviceItemName}
                    </TableCell>

                    <TableCell>{order.quantity || 0}</TableCell>
                    <TableCell className="font-semibold">
                      {formatMoney(order.total || 0).vndFormatted}
                    </TableCell>
                    <TableCell>{getStatusBadge(order.status)}</TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="outline" size="icon">
                            <MoreHorizontal />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent>
                          {onCompleteOrder && (
                            <DropdownMenuItem
                              onClick={() => onCompleteOrder(order.id || "")}
                            >
                              Hoàn thành
                            </DropdownMenuItem>
                          )}
                          {onCancelOrder && (
                            <DropdownMenuItem
                              variant="destructive"
                              onClick={() => onCancelOrder(order.id || "")}
                            >
                              Hủy
                            </DropdownMenuItem>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                      <div className="flex justify-end gap-2">
                        {order.status === "Scheduled" && <></>}
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}
