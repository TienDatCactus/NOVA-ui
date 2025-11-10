import { zodResolver } from "@hookform/resolvers/zod";
import { format, parseISO } from "date-fns";
import { vi } from "date-fns/locale";
import { AlertCircle, CreditCard, Loader2, ShoppingCart } from "lucide-react";
import { useEffect, useMemo } from "react";
import { useForm } from "react-hook-form";
import type { z } from "zod";
import { Alert, AlertDescription } from "~/components/ui/alert";
import { Button } from "~/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "~/components/ui/form";
import { Input } from "~/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { Separator } from "~/components/ui/separator";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "~/components/ui/sheet";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "~/components/ui/table";
import { formatMoney } from "~/lib/utils";
import type { POSOrderItemDto } from "~/services/api/orders/dto";
import { OrderSchema } from "~/services/api/orders/order.schema";
import { PAYMENT_METHODS } from "~/services/types/payment.types";
import { usePOSOrderDetailByOrder } from "../container/menu-order/query.hooks";

const { POSOrderPayNowRequestSchema } = OrderSchema;

type PaymentFormData = z.infer<typeof POSOrderPayNowRequestSchema>;

interface PaymentOrderSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  orderId: string;
  onPayNow: (data: PaymentFormData) => void;
  isPaying?: boolean;
}

export default function PaymentOrderSheet({
  open,
  onOpenChange,
  orderId,
  onPayNow,
  isPaying = false,
}: PaymentOrderSheetProps) {
  const { data: orderDetail, isPending } = usePOSOrderDetailByOrder(
    orderId,
    open
  );

  const paymentForm = useForm<PaymentFormData>({
    resolver: zodResolver(POSOrderPayNowRequestSchema),
    defaultValues: {
      paymentMethod: "Cash",
      paidAmount: orderDetail?.totalAmount || 0,
      transactionReference: "",
    },
  });

  const paidAmount = paymentForm.watch("paidAmount");
  const totalAmount = orderDetail?.totalAmount || 0;
  const changeAmount = useMemo(() => {
    return paidAmount > totalAmount ? paidAmount - totalAmount : 0;
  }, [paidAmount, totalAmount]);

  // Check if payment is valid
  const isPaymentValid = paidAmount >= totalAmount;

  // Update form when order detail loads
  useEffect(() => {
    if (orderDetail?.totalAmount) {
      paymentForm.setValue("paidAmount", orderDetail.totalAmount);
    }
  }, [orderDetail?.totalAmount, paymentForm]);

  const handleSubmit = (data: PaymentFormData) => {
    if (!isPaymentValid) {
      paymentForm.setError("paidAmount", {
        message: "Số tiền thanh toán phải lớn hơn hoặc bằng tổng tiền",
      });
      return;
    }
    onPayNow(data);
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="w-full sm:max-w-[90vw] lg:max-w-[1200px] p-0 flex flex-col"
      >
        <SheetHeader className="p-6 pb-4 border-b">
          <SheetTitle>Thanh toán đơn hàng </SheetTitle>
          <SheetDescription>
            Xem chi tiết và thanh toán đơn hàng ngay
          </SheetDescription>
        </SheetHeader>

        {isPending ? (
          <div className="flex items-center justify-center flex-1">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : orderDetail ? (
          <>
            <div className="flex-1">
              <div className="grid grid-cols-1 lg:grid-cols-[1.5fr,1fr] gap-6 p-6">
                {/* Column 1: Order Items Table (Wider) */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <ShoppingCart className="w-5 h-5 text-primary" />
                    <h3 className="font-semibold text-lg">Chi tiết đơn hàng</h3>
                  </div>

                  {/* Order Meta */}
                  <div className="grid grid-cols-2 gap-3 text-sm p-4 rounded-lg bg-muted/30">
                    <div className="space-y-1">
                      <span className="text-muted-foreground text-xs">
                        Mã đơn
                      </span>
                      <p className="font-mono font-medium">
                        {orderDetail.id.slice(0, 8).toUpperCase()}
                      </p>
                    </div>
                    <div className="space-y-1">
                      <span className="text-muted-foreground text-xs">
                        Trạng thái
                      </span>
                      <p
                        className={`font-medium ${
                          orderDetail.status === "Open"
                            ? "text-blue-600"
                            : orderDetail.status === "Completed"
                              ? "text-green-600"
                              : "text-red-600"
                        }`}
                      >
                        {orderDetail.status === "Open"
                          ? "Đang mở"
                          : orderDetail.status === "Completed"
                            ? "Hoàn thành"
                            : "Đã hủy"}
                      </p>
                    </div>
                    <div className="space-y-1">
                      <span className="text-muted-foreground text-xs">
                        Ngày tạo
                      </span>
                      <p className="font-medium">
                        {format(
                          parseISO(orderDetail.createdAt),
                          "dd/MM/yyyy HH:mm",
                          { locale: vi }
                        )}
                      </p>
                    </div>
                    {orderDetail.scheduledAt && (
                      <div className="space-y-1">
                        <span className="text-muted-foreground text-xs">
                          Giờ hẹn
                        </span>
                        <p className="font-medium">
                          {format(
                            parseISO(orderDetail.scheduledAt),
                            "dd/MM/yyyy HH:mm",
                            { locale: vi }
                          )}
                        </p>
                      </div>
                    )}
                  </div>

                  <Separator />

                  {/* Items Table */}
                  <div className="space-y-3">
                    <p className="text-sm font-medium">
                      Danh sách món{" "}
                      <span className="text-muted-foreground">
                        ({orderDetail.items?.length || 0} món)
                      </span>
                    </p>
                    <div className="border rounded-lg">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Tên món</TableHead>
                            <TableHead className="text-right">
                              Đơn giá
                            </TableHead>
                            <TableHead className="text-center">SL</TableHead>
                            <TableHead className="text-right">
                              Thành tiền
                            </TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {orderDetail.items?.length === 0 ? (
                            <TableRow>
                              <TableCell
                                colSpan={4}
                                className="text-center text-muted-foreground py-8"
                              >
                                Chưa có món nào
                              </TableCell>
                            </TableRow>
                          ) : (
                            orderDetail.items?.map((item: POSOrderItemDto) => (
                              <TableRow key={item.id}>
                                <TableCell className="font-medium">
                                  {item.itemName}
                                  {item.customItemName && (
                                    <span className="text-xs text-muted-foreground block">
                                      ({item.customItemName})
                                    </span>
                                  )}
                                </TableCell>
                                <TableCell className="text-right tabular-nums">
                                  {formatMoney(item.unitPrice).vndFormatted}
                                </TableCell>
                                <TableCell className="text-center tabular-nums">
                                  {item.quantity}
                                </TableCell>
                                <TableCell className="text-right font-semibold tabular-nums">
                                  {formatMoney(item.subtotal).vndFormatted}
                                </TableCell>
                              </TableRow>
                            ))
                          )}
                        </TableBody>
                      </Table>
                    </div>
                  </div>

                  {orderDetail.note && (
                    <>
                      <Separator />
                      <div className="space-y-2">
                        <p className="text-sm font-medium text-muted-foreground">
                          Ghi chú
                        </p>
                        <p className="text-sm bg-muted/50 p-3 rounded-lg">
                          {orderDetail.note}
                        </p>
                      </div>
                    </>
                  )}
                </div>

                {/* Column 2: Pricing & Payment Form */}
                <div className="space-y-6">
                  {/* Pricing Summary */}
                  <div className="space-y-4">
                    <div className="flex items-center gap-2">
                      <CreditCard className="w-5 h-5 text-primary" />
                      <h3 className="font-semibold text-lg">Tổng tiền</h3>
                    </div>

                    <div className="space-y-3 p-4 rounded-lg bg-muted/30 border">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Tạm tính:</span>
                        <span className="font-medium tabular-nums">
                          {formatMoney(orderDetail.subtotalAmount).vndFormatted}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">VAT:</span>
                        <span className="font-medium tabular-nums">
                          {formatMoney(orderDetail.vatAmount).vndFormatted}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">
                          Phí dịch vụ:
                        </span>
                        <span className="font-medium tabular-nums">
                          {
                            formatMoney(orderDetail.serviceChargeAmount)
                              .vndFormatted
                          }
                        </span>
                      </div>
                      <Separator />
                      <div className="flex justify-between items-baseline">
                        <span className="font-semibold">Tổng cộng:</span>
                        <span className="text-2xl font-bold text-primary tabular-nums">
                          {formatMoney(orderDetail.totalAmount).vndFormatted}
                        </span>
                      </div>
                    </div>
                  </div>

                  <Separator />

                  {/* Payment Form */}
                  <div className="space-y-4">
                    <h4 className="font-semibold">Thông tin thanh toán</h4>
                    <Form {...paymentForm}>
                      <form className="space-y-4">
                        <FormField
                          control={paymentForm.control}
                          name="paymentMethod"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Phương thức thanh toán</FormLabel>
                              <Select
                                onValueChange={field.onChange}
                                defaultValue={field.value}
                              >
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Chọn phương thức" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  {PAYMENT_METHODS.filter(
                                    (method) => !method.disabled
                                  ).map((method) => (
                                    <SelectItem
                                      key={method.value}
                                      value={method.value}
                                    >
                                      <div className="flex items-center gap-2">
                                        <method.icon className="w-4 h-4" />
                                        {method.label}
                                      </div>
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={paymentForm.control}
                          name="paidAmount"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Số tiền thanh toán</FormLabel>
                              <FormControl>
                                <Input
                                  type="number"
                                  placeholder="Nhập số tiền"
                                  {...field}
                                  onChange={(e) =>
                                    field.onChange(Number(e.target.value))
                                  }
                                  className="tabular-nums"
                                />
                              </FormControl>
                              <FormDescription className="text-xs">
                                Tối thiểu:{" "}
                                {formatMoney(totalAmount).vndFormatted}
                              </FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        {/* Change Amount Display */}
                        {changeAmount > 0 && (
                          <Alert className="bg-green-50 border-green-200">
                            <AlertDescription className="flex justify-between items-center">
                              <span className="text-sm font-medium">
                                Tiền thừa:
                              </span>
                              <span className="text-lg font-bold text-green-600 tabular-nums">
                                {formatMoney(changeAmount).vndFormatted}
                              </span>
                            </AlertDescription>
                          </Alert>
                        )}

                        {/* Validation Warning */}
                        {!isPaymentValid && paidAmount > 0 && (
                          <Alert variant="destructive">
                            <AlertCircle className="h-4 w-4" />
                            <AlertDescription className="text-sm">
                              Số tiền thanh toán phải lớn hơn hoặc bằng tổng
                              tiền đơn hàng
                            </AlertDescription>
                          </Alert>
                        )}

                        <FormField
                          control={paymentForm.control}
                          name="transactionReference"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>
                                Mã giao dịch{" "}
                                <span className="text-muted-foreground text-xs">
                                  (tùy chọn)
                                </span>
                              </FormLabel>
                              <FormControl>
                                <Input
                                  {...field}
                                  placeholder="Nhập mã giao dịch nếu có"
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </form>
                    </Form>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer Actions */}
            <div className="p-6 pt-4 border-t bg-background">
              <div className="flex justify-between items-center">
                <div className="text-sm text-muted-foreground">
                  {!isPaymentValid && paidAmount > 0 && (
                    <span className="text-destructive font-medium">
                      ⚠️ Vui lòng kiểm tra lại số tiền thanh toán
                    </span>
                  )}
                </div>
                <div className="flex gap-3">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => onOpenChange(false)}
                    disabled={isPaying}
                  >
                    Hủy
                  </Button>
                  <Button
                    type="button"
                    onClick={paymentForm.handleSubmit(handleSubmit)}
                    disabled={isPaying || !isPaymentValid}
                  >
                    {isPaying ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Đang xử lý...
                      </>
                    ) : (
                      <>
                        <CreditCard className="w-4 h-4 mr-2" />
                        Xác nhận thanh toán
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </div>
          </>
        ) : (
          <div className="flex items-center justify-center flex-1">
            <p className="text-muted-foreground">
              Không tìm thấy thông tin đơn hàng
            </p>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}
