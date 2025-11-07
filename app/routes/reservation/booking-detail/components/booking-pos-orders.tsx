import {
  Beef,
  Building2,
  ChevronDown,
  ChevronRight,
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
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
import type { POSOrderDetailDto } from "~/services/api/orders/dto";
import type { RoomSchema } from "~/services/api/rooms/room.schema";

interface BookingOrdersProps {
  hasOrder: boolean;
  isCreatingOrder: boolean;
  ordersList?: POSOrderDetailDto[];
  isLoadingOrder: boolean;
  onOpenCreateDialog: () => void;
  onAddMenuItem: (orderId: string) => void;
  onRemoveItem: (orderId: string, itemId: string) => void;
  selectedRoomId?: string | null;
  onRoomChange?: (roomId: string | null) => void;
  rooms?: z.infer<typeof RoomSchema.BookingDetailRoomItemSchema>[];
}

export default function BookingPosOrders({
  hasOrder,
  isCreatingOrder,
  ordersList = [],
  isLoadingOrder,
  onOpenCreateDialog,
  onAddMenuItem,
  onRemoveItem,
  selectedRoomId,
  onRoomChange,
  rooms = [],
}: BookingOrdersProps) {
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
  const selectedRoom = rooms.find((r) => r.roomId === selectedRoomId);

  // If no order exists, show create button
  if (!hasOrder || ordersList.length === 0) {
    return (
      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ShoppingCart className="h-5 w-5" />
            Đơn bán hàng tại quầy (POS)
          </CardTitle>
        </CardHeader>
        <CardContent>
          {/* Room Filter */}
          {rooms.length > 0 && onRoomChange && (
            <div className="flex items-center gap-2 mb-4">
              <Select
                value={selectedRoomId || "all"}
                onValueChange={(value) =>
                  onRoomChange(value === "all" ? null : value)
                }
              >
                <SelectTrigger className="w-[280px]">
                  <SelectValue placeholder="Chọn phòng" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">
                    <div className="flex items-center gap-2">
                      <Building2 className="h-4 w-4" />
                      <span>Theo đơn đặt phòng</span>
                    </div>
                  </SelectItem>
                  {rooms.map((room) => (
                    <SelectItem key={room.roomId} value={room.roomId}>
                      <div className="flex items-center gap-2">
                        <Utensils className="h-4 w-4" />
                        <span>{room.roomName}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {selectedRoomId && (
                <Badge variant="secondary" className="gap-1">
                  Đơn của phòng: {selectedRoom?.roomName}
                </Badge>
              )}
            </div>
          )}

          <div className="flex flex-col items-center justify-center py-8 text-center">
            <ShoppingCart className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-sm text-muted-foreground mb-4">
              {selectedRoomId
                ? `Chưa có đơn hàng POS nào cho phòng ${selectedRoom?.roomName}`
                : "Chưa có đơn hàng POS nào cho booking này"}
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
    (sum, order) => sum + order.totalAmount,
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
          <div className="text-sm">
            <span className="text-muted-foreground">Tổng cộng: </span>
            <span className="font-semibold text-lg text-primary">
              {formatMoney(grandTotal).vndFormatted}
            </span>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {/* Room Filter Select */}
        {rooms.length > 0 && onRoomChange && (
          <div className="flex items-center gap-3 mb-4 p-3 bg-muted/30 rounded-lg border">
            <div className="flex items-center gap-2 flex-1">
              <label className="text-sm font-medium text-muted-foreground whitespace-nowrap">
                Lọc đơn hàng:
              </label>
              <Select
                value={selectedRoomId || "all"}
                onValueChange={(value) =>
                  onRoomChange(value === "all" ? null : value)
                }
              >
                <SelectTrigger className="w-[280px] bg-background">
                  <SelectValue placeholder="Chọn phòng hoặc xem tất cả" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">
                    <div className="flex items-center gap-2">
                      <Building2 className="h-4 w-4" />
                      <span className="font-medium">Theo đơn đặt phòng</span>
                    </div>
                  </SelectItem>
                  {rooms.map((room) => (
                    <SelectItem key={room.roomId} value={room.roomId}>
                      <div className="flex items-center gap-2">
                        <Utensils className="h-4 w-4" />
                        <span>{room.roomName}</span>
                        <span className="text-xs text-muted-foreground">
                          ({room.roomTypeName})
                        </span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {selectedRoomId && (
              <Badge variant="default" className="gap-1 px-3 py-1">
                <Utensils className="h-3 w-3" />
                Phòng: {selectedRoom?.roomName}
              </Badge>
            )}
          </div>
        )}
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
                const isExpanded = expandedOrders.has(order.id);
                return (
                  <>
                    <TableRow key={order.id} className="hover:bg-muted/50">
                      <TableCell>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => toggleExpand(order.id)}
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
                        #{order.id.slice(0, 8)}
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
                          <span>{order.items.length}</span>
                        </div>
                      </TableCell>
                      <TableCell className="font-semibold">
                        {formatMoney(order.totalAmount).vndFormatted}
                      </TableCell>

                      <TableCell className="text-right">
                        <Button
                          type="button"
                          size="sm"
                          variant="outline"
                          onClick={() => onAddMenuItem(order.id)}
                          disabled={order.status !== "Open"}
                        >
                          <Plus className="h-3 w-3 mr-1" />
                          Thêm món
                        </Button>
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
                            {order.items.length === 0 ? (
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
                                  {order.items.map((item) => (
                                    <TableRow key={item.id}>
                                      <TableCell className="font-medium">
                                        {item.itemName}
                                      </TableCell>
                                      <TableCell>{item.quantity}</TableCell>
                                      <TableCell>
                                        {
                                          formatMoney(item.unitPrice)
                                            .vndFormatted
                                        }
                                      </TableCell>
                                      <TableCell className="font-semibold">
                                        {
                                          formatMoney(item.subtotal)
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
                                            onRemoveItem(order.id, item.id)
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
