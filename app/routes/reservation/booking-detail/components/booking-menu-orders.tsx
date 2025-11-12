import {
  Beef,
  ChevronDown,
  ChevronRight,
  Ellipsis,
  MoreHorizontal,
  Plus,
  ShoppingCart,
  Trash2,
  Utensils,
} from "lucide-react";
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

type POSOrderFromBookingDetail = z.infer<
  typeof OrderSchema.POSOrderListByBookingResponseSchema
>;

interface BookingMenuOrdersProps {
  isCreatingOrder: boolean;
  ordersList?: POSOrderFromBookingDetail;
  isLoadingOrder: boolean;
  onOpenCreateDialog: () => void;
  onAddMenuItem: (orderId: string) => void;
  onRemoveItem: (orderId: string, itemId: string) => void;
  onAddCompletedCharges?: () => void;
  onCancelOrder: (orderId: string) => void;
  onCompleteOrder: (orderId: string) => void;
}

export default function BookingMenuOrders({
  isCreatingOrder,
  ordersList = [],
  isLoadingOrder,
  onOpenCreateDialog,
  onAddMenuItem,
  onRemoveItem,
  onAddCompletedCharges,
  onCancelOrder,
  onCompleteOrder,
}: BookingMenuOrdersProps) {
  const [expandedOrders, setExpandedOrders] = useState<Set<string>>(new Set());

  const toggleExpand = (orderId: string) => {
    setExpandedOrders((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(orderId)) {
        newSet.delete(orderId);
      } else {
        newSet.add(orderId);
      }
      return newSet;
    });
  };

  // If no order exists, show create button
  if (ordersList.length === 0) {
    return (
      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ShoppingCart className="h-5 w-5" />
            Đơn bán hàng tại quầy (POS)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <ShoppingCart className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-sm text-muted-foreground mb-4">
              Chưa có đơn hàng POS nào cho booking này
            </p>
            <Button
              type="button"
              onClick={onOpenCreateDialog}
              disabled={isCreatingOrder}
            >
              {isCreatingOrder ? "Đang tạo..." : "Tạo đơn hàng"}
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Calculate grand total from all orders
  const grandTotal = ordersList.reduce(
    (sum, order) => sum + (order.totalAmount || 0),
    0
  );

  return (
    <Card className="shadow-md">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Beef className="h-5 w-5" />
            Đơn bán hàng tại quầy (POS)
            <Badge variant="secondary" className="ml-2">
              {ordersList.length} đơn
            </Badge>
          </CardTitle>
          <div className="flex items-center gap-3">
            <div className="text-sm">
              <span className="text-muted-foreground">Tổng cộng: </span>
              <span className="font-semibold text-lg text-primary">
                {formatMoney(grandTotal).vndFormatted}
              </span>
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant={"ghost"}>
                  <Ellipsis />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem onClick={onAddCompletedCharges}>
                  <Plus className="h-4 w-4" />
                  Thêm sản phẩm
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>{" "}
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
                <TableHead className="w-12"></TableHead>
                <TableHead>Mã đơn</TableHead>
                <TableHead>Trạng thái</TableHead>
                <TableHead>Số món</TableHead>
                <TableHead>Tổng tiền</TableHead>
                <TableHead className="text-right">Thao tác</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {ordersList.map((order) => {
                const isExpanded = expandedOrders.has(order.id || "");
                return (
                  <>
                    <TableRow key={order.id} className="hover:bg-muted/50">
                      <TableCell>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => toggleExpand(order.id || "")}
                          className="h-8 w-8 p-0"
                        >
                          {isExpanded ? (
                            <ChevronDown className="h-4 w-4" />
                          ) : (
                            <ChevronRight className="h-4 w-4" />
                          )}
                        </Button>
                      </TableCell>
                      <TableCell className="font-mono text-sm">
                        #{order.id?.slice(0, 8)}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            order.status === "Completed"
                              ? "default"
                              : order.status === "Cancelled"
                                ? "destructive"
                                : "success"
                          }
                        >
                          {order.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Utensils className="h-3 w-3 text-muted-foreground" />
                          <span>{order.items?.length || 0}</span>
                        </div>
                      </TableCell>
                      <TableCell className="font-semibold">
                        {formatMoney(order.totalAmount || 0).vndFormatted}
                      </TableCell>

                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="outline" size="icon">
                              <MoreHorizontal />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent>
                            <DropdownMenuItem
                              onClick={() => onAddMenuItem(order.id || "")}
                              disabled={order.status !== "Open"}
                            >
                              Thêm món
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => onCompleteOrder(order.id || "")}
                            >
                              Hoàn thành
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              variant="destructive"
                              onClick={() => onCancelOrder(order.id || "")}
                            >
                              Hủy
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>

                    {isExpanded && (
                      <TableRow>
                        <TableCell colSpan={7} className="bg-muted/20 p-0">
                          <div className="p-4">
                            <h4 className="text-sm font-semibold mb-3 flex items-center gap-2">
                              <Utensils className="h-4 w-4" />
                              Chi tiết món ăn
                            </h4>
                            {order.items?.length === 0 ? (
                              <div className="text-sm text-muted-foreground text-center py-4 border-2 border-dashed rounded-md">
                                Chưa có món nào
                              </div>
                            ) : (
                              <Table>
                                <TableHeader>
                                  <TableRow>
                                    <TableHead>Tên món</TableHead>
                                    <TableHead>Số lượng</TableHead>
                                    <TableHead>Đơn giá</TableHead>
                                    <TableHead>Thành tiền</TableHead>
                                    <TableHead>Phục vụ lúc</TableHead>
                                    <TableHead className="text-right">
                                      Xóa
                                    </TableHead>
                                  </TableRow>
                                </TableHeader>
                                <TableBody>
                                  {order.items?.map((item) => (
                                    <TableRow key={item.id}>
                                      <TableCell className="font-medium">
                                        {item.menuItemName}
                                      </TableCell>
                                      <TableCell>{item.quantity}</TableCell>
                                      <TableCell>
                                        {
                                          formatMoney(item.unitPrice ?? 0)
                                            .vndFormatted
                                        }
                                      </TableCell>
                                      <TableCell className="font-semibold">
                                        {
                                          formatMoney(item.subtotal ?? 0)
                                            .vndFormatted
                                        }
                                      </TableCell>
                                      <TableCell className="text-sm text-muted-foreground">
                                        {item.servedAt || "—"}
                                      </TableCell>
                                      <TableCell className="text-right">
                                        <Button
                                          type="button"
                                          variant="ghost"
                                          size="sm"
                                          onClick={() =>
                                            onRemoveItem(
                                              order.id || "",
                                              item.id
                                            )
                                          }
                                          disabled={order.status !== "Open"}
                                        >
                                          <Trash2 className="h-4 w-4 text-destructive" />
                                        </Button>
                                      </TableCell>
                                    </TableRow>
                                  ))}
                                </TableBody>
                              </Table>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    )}
                  </>
                );
              })}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}
