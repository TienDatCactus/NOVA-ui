import { zodResolver } from "@hookform/resolvers/zod";
import { format, parseISO } from "date-fns";
import { vi } from "date-fns/locale";
import { AlertCircle, ChevronDown, CreditCard, Loader2 } from "lucide-react";
import { useEffect, useMemo } from "react";
import { useForm } from "react-hook-form";
import type { z } from "zod";
import { Alert, AlertDescription } from "~/components/ui/alert";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "~/components/ui/collapsible";
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
  SheetFooter,
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
import { usePOSOrderDetailByOrder } from "../container/pos-orders/query.hooks";
import { useServiceOrderDetail } from "../container/service-order/query.hooks";

const { OrderPayNowRequestSchema } = OrderSchema;

type PaymentFormData = z.infer<typeof OrderPayNowRequestSchema>;

type OrderType = "menu" | "service";

interface PaymentOrderSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  orderId: string;
  onPayNow: (data: PaymentFormData) => void;
  isPaying?: boolean;
  orderType: OrderType;
}

export default function PaymentOrderSheet({
  open,
  onOpenChange,
  orderId,
  onPayNow,
  isPaying = false,
  orderType,
}: PaymentOrderSheetProps) {
  // Conditional data fetching based on orderType
  const { data: posOrderDetail, isPending: isPendingPOS } =
    usePOSOrderDetailByOrder(orderId, orderType === "menu" && open);
  const { data: serviceOrderDetail, isPending: isPendingService } =
    useServiceOrderDetail(orderId, {
      enabled: orderType === "service" && open,
    });

  const isPending = orderType === "menu" ? isPendingPOS : isPendingService;

  // Calculate total amount based on order type
  const totalAmount =
    orderType === "menu"
      ? posOrderDetail?.totalAmount || 0
      : serviceOrderDetail?.total || 0;

  const paymentForm = useForm<PaymentFormData>({
    resolver: zodResolver(OrderPayNowRequestSchema),
    mode: "onChange",
    defaultValues: {
      paymentMethod: "Cash",
      paidAmount: totalAmount,
      transactionReference: "",
    },
  });

  const paidAmount = paymentForm.watch("paidAmount");
  const changeAmount = useMemo(() => {
    return paidAmount > totalAmount ? paidAmount - totalAmount : 0;
  }, [paidAmount, totalAmount]);

  const isPaymentValid = paidAmount >= totalAmount;

  useEffect(() => {
    if (totalAmount > 0) {
      paymentForm.setValue("paidAmount", totalAmount);
    }
  }, [totalAmount, paymentForm]);

  const handleSubmit = (data: PaymentFormData) => {
    if (!isPaymentValid) {
      paymentForm.setError("paidAmount", {
        message: "Số tiền thanh toán phải lớn hơn hoặc bằng tổng tiền",
      });
      return;
    }
    onPayNow(data);
  };

  // Status configuration for service orders
  const serviceStatusConfig = {
    Scheduled: { label: "Đã lên lịch", color: "text-blue-600" },
    Completed: { label: "Hoàn thành", color: "text-green-600" },
    Cancelled: { label: "Đã hủy", color: "text-red-600" },
    NoShow: { label: "Không đến", color: "text-orange-600" },
  };

  // Get order ID for display
  const displayOrderId =
    orderType === "menu"
      ? posOrderDetail?.id.slice(0, 8).toUpperCase()
      : serviceOrderDetail?.id.slice(0, 8).toUpperCase();

  // Sheet titles and descriptions
  const sheetTitle =
    orderType === "menu"
      ? `Thanh toán đơn hàng #${displayOrderId}`
      : `Thanh toán dịch vụ #${displayOrderId}`;

  const sheetDescription =
    orderType === "menu"
      ? "Xem chi tiết và thanh toán đơn hàng ngay"
      : "Xem chi tiết và thanh toán dịch vụ ngay";

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="w-full sm:max-w-[90vw] lg:max-w-[1200px] p-0 flex flex-col"
      >
        <SheetHeader className="p-6 pb-4 border-b">
          <SheetTitle className="text-xl">{sheetTitle}</SheetTitle>
          <SheetDescription>{sheetDescription}</SheetDescription>
        </SheetHeader>

        {isPending ? (
          <div className="flex items-center justify-center flex-1">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : posOrderDetail || serviceOrderDetail ? (
          <>
            <div className="flex-1 overflow-y-auto">
              {orderType === "menu" && posOrderDetail ? (
                // MENU ORDER DISPLAY
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 px-6 pb-6">
                  <div className="space-y-4 col-span-2 border-r lg:pr-6">
                    <div className="space-y-3">
                      <p className="text-sm font-medium">
                        Danh sách món{" "}
                        <span className="text-muted-foreground">
                          ({posOrderDetail.items?.length || 0} món)
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
                            {posOrderDetail.items?.length === 0 ? (
                              <TableRow>
                                <TableCell
                                  colSpan={4}
                                  className="text-center text-muted-foreground py-8"
                                >
                                  Chưa có món nào
                                </TableCell>
                              </TableRow>
                            ) : (
                              posOrderDetail.items?.map(
                                (item: POSOrderItemDto) => (
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
                                )
                              )
                            )}
                          </TableBody>
                        </Table>
                      </div>
                    </div>

                    {posOrderDetail.note && (
                      <>
                        <Separator />
                        <div className="space-y-2">
                          <p className="text-sm font-medium text-muted-foreground">
                            Ghi chú
                          </p>
                          <p className="text-sm bg-muted/50 p-3 rounded-lg">
                            {posOrderDetail.note}
                          </p>
                        </div>
                      </>
                    )}
                  </div>

                  <div className="space-y-6 col-span-1">
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div className="space-y-1">
                        <span className="text-muted-foreground text-xs">
                          Trạng thái
                        </span>
                        <p
                          className={`font-medium ${
                            posOrderDetail.status === "Open"
                              ? "text-blue-600"
                              : posOrderDetail.status === "Completed"
                                ? "text-green-600"
                                : "text-red-600"
                          }`}
                        >
                          {posOrderDetail.status === "Open"
                            ? "Đang mở"
                            : posOrderDetail.status === "Completed"
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
                            parseISO(posOrderDetail.createdAt),
                            "dd/MM/yyyy HH:mm",
                            { locale: vi }
                          )}
                        </p>
                      </div>
                      {posOrderDetail.scheduledAt && (
                        <div className="space-y-1">
                          <span className="text-muted-foreground text-xs">
                            Giờ hẹn
                          </span>
                          <p className="font-medium">
                            {format(
                              parseISO(posOrderDetail.scheduledAt),
                              "dd/MM/yyyy HH:mm",
                              { locale: vi }
                            )}
                          </p>
                        </div>
                      )}
                    </div>

                    <div className="space-y-4">
                      <div className="flex items-center gap-2">
                        <CreditCard className="w-5 h-5 text-primary" />
                        <h3 className="font-semibold text-lg">Tổng tiền</h3>
                      </div>

                      <div className="space-y-3 p-4 rounded-lg bg-muted/30 border">
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">
                            Tạm tính:
                          </span>
                          <span className="font-medium tabular-nums">
                            {
                              formatMoney(posOrderDetail.subtotalAmount)
                                .vndFormatted
                            }
                          </span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">VAT:</span>
                          <span className="font-medium tabular-nums">
                            {formatMoney(posOrderDetail.vatAmount).vndFormatted}
                          </span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">
                            Phí dịch vụ:
                          </span>
                          <span className="font-medium tabular-nums">
                            {
                              formatMoney(posOrderDetail.serviceChargeAmount)
                                .vndFormatted
                            }
                          </span>
                        </div>
                        <Separator />
                        <div className="flex justify-between items-baseline">
                          <span className="font-semibold">Tổng cộng:</span>
                          <span className="text-2xl font-bold text-primary tabular-nums">
                            {
                              formatMoney(posOrderDetail.totalAmount)
                                .vndFormatted
                            }
                          </span>
                        </div>
                      </div>
                    </div>

                    <Separator />

                    {/* Payment Form */}
                    <div className="space-y-4">
                      <Collapsible defaultOpen={true}>
                        <CollapsibleTrigger className="flex items-center justify-between w-full">
                          <h4 className="font-semibold">
                            Thông tin thanh toán
                          </h4>
                          <ChevronDown className="w-4 h-4" />
                        </CollapsibleTrigger>
                        <CollapsibleContent>
                          <Form {...paymentForm}>
                            <form className="space-y-4 mt-4">
                              <FormField
                                control={paymentForm.control}
                                name="paymentMethod"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>
                                      Phương thức thanh toán
                                    </FormLabel>
                                    <Select
                                      onValueChange={field.onChange}
                                      defaultValue={field.value}
                                    >
                                      <FormControl>
                                        <SelectTrigger className="w-full">
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
                                    Số tiền thanh toán phải lớn hơn hoặc bằng
                                    tổng tiền đơn hàng
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
                                        value={field.value || ""}
                                        placeholder="Nhập mã giao dịch nếu có"
                                      />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                            </form>
                          </Form>
                        </CollapsibleContent>
                      </Collapsible>
                    </div>
                  </div>
                </div>
              ) : (
                serviceOrderDetail && (
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 px-6 pb-6 ">
                    <div className="space-y-4 col-span-2 border-r lg:pr-6">
                      <h3 className="font-semibold text-lg">
                        Chi tiết dịch vụ
                      </h3>

                      <div className="rounded-lg border p-4 space-y-3">
                        <div className="flex justify-between items-start">
                          <div className="space-y-1">
                            <p className="font-semibold text-lg">
                              {serviceOrderDetail.serviceItemName ||
                                serviceOrderDetail.customServiceName}
                            </p>
                            {serviceOrderDetail.serviceItemCode && (
                              <Badge
                                variant="outline"
                                className="font-mono text-xs"
                              >
                                {serviceOrderDetail.serviceItemCode}
                              </Badge>
                            )}
                          </div>
                          <div className="text-right">
                            <p className="text-sm text-muted-foreground">
                              Trạng thái
                            </p>
                            <p
                              className={`font-medium ${
                                serviceStatusConfig[serviceOrderDetail.status]
                                  ?.color
                              }`}
                            >
                              {
                                serviceStatusConfig[serviceOrderDetail.status]
                                  ?.label
                              }
                            </p>
                          </div>
                        </div>

                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Thuộc tính</TableHead>
                              <TableHead>Giá trị</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            <TableRow>
                              <TableCell className="text-muted-foreground">
                                Đơn giá
                              </TableCell>
                              <TableCell className="font-medium tabular-nums">
                                {
                                  formatMoney(serviceOrderDetail.unitPrice)
                                    .vndFormatted
                                }
                              </TableCell>
                            </TableRow>
                            <TableRow>
                              <TableCell className="text-muted-foreground">
                                Số lượng
                              </TableCell>
                              <TableCell className="font-medium">
                                {serviceOrderDetail.quantity}x
                              </TableCell>
                            </TableRow>
                            {serviceOrderDetail.scheduledAt && (
                              <TableRow>
                                <TableCell className="text-muted-foreground">
                                  Lịch hẹn
                                </TableCell>
                                <TableCell className="font-medium">
                                  {format(
                                    parseISO(serviceOrderDetail.scheduledAt),
                                    "HH:mm - dd/MM/yyyy",
                                    {
                                      locale: vi,
                                    }
                                  )}
                                </TableCell>
                              </TableRow>
                            )}
                            {serviceOrderDetail.performedAt && (
                              <TableRow>
                                <TableCell className="text-muted-foreground">
                                  Thực hiện
                                </TableCell>
                                <TableCell className="font-medium">
                                  {format(
                                    parseISO(serviceOrderDetail.performedAt),
                                    "HH:mm - dd/MM/yyyy",
                                    {
                                      locale: vi,
                                    }
                                  )}
                                </TableCell>
                              </TableRow>
                            )}
                          </TableBody>
                        </Table>

                        {serviceOrderDetail.note && (
                          <>
                            <Separator />
                            <div>
                              <p className="text-sm text-muted-foreground mb-1">
                                Ghi chú
                              </p>
                              <p className="text-sm bg-muted/50 p-2 rounded">
                                {serviceOrderDetail.note}
                              </p>
                            </div>
                          </>
                        )}
                      </div>
                    </div>

                    {/* Total Amount */}
                    <div className=" col-span-1">
                      <div className="space-y-4">
                        <h3 className="font-semibold text-lg flex items-center gap-2">
                          <CreditCard className="w-5 h-5 text-primary" />
                          Tổng tiền
                        </h3>
                        <div className="space-y-3 p-4 rounded-lg bg-muted/30 border">
                          <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">
                              Tạm tính:
                            </span>
                            <span className="font-medium tabular-nums">
                              {
                                formatMoney(
                                  serviceOrderDetail.quantity *
                                    serviceOrderDetail.unitPrice
                                ).vndFormatted
                              }
                            </span>
                          </div>
                          {serviceOrderDetail.discountAmount > 0 && (
                            <div className="flex justify-between text-sm text-destructive">
                              <span>Giảm giá:</span>
                              <span className="font-medium tabular-nums">
                                -
                                {
                                  formatMoney(serviceOrderDetail.discountAmount)
                                    .vndFormatted
                                }
                              </span>
                            </div>
                          )}
                          <Separator />
                          <div className="flex justify-between items-baseline">
                            <span className="font-semibold">Tổng cộng:</span>
                            <span className="text-2xl font-bold text-primary tabular-nums">
                              {
                                formatMoney(serviceOrderDetail.total)
                                  .vndFormatted
                              }
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-4">
                        <h3 className="font-semibold text-lg">
                          Thông tin thanh toán
                        </h3>
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
                                      <SelectTrigger className="w-full">
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
                                  tiền dịch vụ
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
                                      value={field.value || ""}
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
                )
              )}
            </div>

            {/* Footer Actions */}
            <SheetFooter className="p-6 border-t">
              <div className="flex justify-between items-center w-full">
                <div className="text-sm text-muted-foreground">
                  {!isPaymentValid && paidAmount > 0 && (
                    <span className="text-destructive">
                      Vui lòng kiểm tra lại số tiền thanh toán
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
            </SheetFooter>
          </>
        ) : (
          <div className="flex items-center justify-center flex-1">
            <p className="text-muted-foreground">
              Không tìm thấy thông tin{" "}
              {orderType === "menu" ? "đơn hàng" : "dịch vụ"}
            </p>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}
