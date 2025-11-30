import { zodResolver } from "@hookform/resolvers/zod";
import { format, parseISO } from "date-fns";
import { vi } from "date-fns/locale";
import {
  AlertCircle,
  Banknote,
  CalendarClock,
  CheckCircle2,
  CreditCard,
  FileText,
  Hash,
  Loader2,
  Utensils,
  Sparkles,
  XCircle,
  ArrowRight,
} from "lucide-react";
import { useEffect, useMemo } from "react";
import { useForm } from "react-hook-form";
import type { z } from "zod";

import { Alert, AlertDescription } from "~/components/ui/alert";
import { Badge } from "~/components/ui/badge";
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
import { ScrollArea } from "~/components/ui/scroll-area";
import { cn, formatMoney } from "~/lib/utils";

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
  // --- Queries ---
  const { data: posOrderDetail, isPending: isPendingPOS } =
    usePOSOrderDetailByOrder(orderId, orderType === "menu" && open);

  const { data: serviceOrderDetail, isPending: isPendingService } =
    useServiceOrderDetail(orderId, {
      enabled: orderType === "service" && open,
    });

  const isPending = orderType === "menu" ? isPendingPOS : isPendingService;

  // --- Data Normalization ---
  const orderDetail =
    orderType === "menu" ? posOrderDetail : serviceOrderDetail;

  const totalAmount =
    orderType === "menu"
      ? posOrderDetail?.totalAmount || 0
      : serviceOrderDetail?.total || 0;

  const subTotal =
    orderType === "menu"
      ? posOrderDetail?.subtotalAmount || 0
      : (serviceOrderDetail?.unitPrice || 0) *
        (serviceOrderDetail?.quantity || 0);

  // --- Form Setup ---
  const paymentForm = useForm<PaymentFormData>({
    resolver: zodResolver(OrderPayNowRequestSchema),
    mode: "onChange",
    defaultValues: {
      paymentMethod: "Cash",
      paidAmount: totalAmount,
      transactionReference: "",
    },
  });

  // --- Effects & Logic ---
  const paidAmount = paymentForm.watch("paidAmount");
  const changeAmount = useMemo(() => {
    return paidAmount > totalAmount ? paidAmount - totalAmount : 0;
  }, [paidAmount, totalAmount]);

  const isPaymentValid = paidAmount >= totalAmount;

  useEffect(() => {
    if (totalAmount > 0 && open) {
      paymentForm.setValue("paidAmount", totalAmount);
    }
  }, [totalAmount, paymentForm, open]);

  const handleSubmit = (data: PaymentFormData) => {
    if (!isPaymentValid) {
      paymentForm.setError("paidAmount", {
        message: "Số tiền thanh toán không đủ",
      });
      return;
    }
    onPayNow(data);
  };

  // --- Render Helpers ---
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "Completed":
        return (
          <Badge className="bg-green-600 hover:bg-green-700">
            <CheckCircle2 className="w-3 h-3 mr-1" /> Hoàn thành
          </Badge>
        );
      case "Cancelled":
        return (
          <Badge variant="destructive">
            <XCircle className="w-3 h-3 mr-1" /> Đã hủy
          </Badge>
        );
      case "Open":
      case "Scheduled":
        return (
          <Badge
            variant="secondary"
            className="bg-blue-100 text-blue-700 hover:bg-blue-200"
          >
            <CalendarClock className="w-3 h-3 mr-1" /> Đang xử lý
          </Badge>
        );
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="w-full sm:max-w-[90vw] lg:max-w-[1100px] p-0 flex flex-col bg-background"
      >
        {/* === HEADER === */}
        <SheetHeader className="px-8 py-6 border-b shrink-0 flex flex-row items-center justify-between space-y-0">
          <div className="space-y-1">
            <SheetTitle className="text-2xl font-light flex items-center gap-3">
              {orderType === "menu" ? (
                <Utensils className="w-6 h-6 stroke-[1.5]" />
              ) : (
                <Sparkles className="w-6 h-6 stroke-[1.5]" />
              )}
              Thanh toán {orderType === "menu" ? "Đơn hàng" : "Dịch vụ"}
            </SheetTitle>
            <SheetDescription className="flex items-center gap-2 text-xs uppercase tracking-wide font-medium">
              <span className="font-mono bg-muted px-1.5 rounded border">
                #{orderId.slice(0, 8).toUpperCase()}
              </span>
              <span>•</span>
              <span>{format(new Date(), " HH:mm dd/MM/yyyy")}</span>
            </SheetDescription>
          </div>
          {orderDetail && getStatusBadge(orderDetail.status)}
        </SheetHeader>

        {/* === BODY === */}
        {isPending ? (
          <div className="flex-1 flex items-center justify-center">
            <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
          </div>
        ) : orderDetail ? (
          <div className="flex-1 overflow-hidden flex flex-col lg:flex-row">
            {/* LEFT: DETAILS (READ ONLY) */}
            <ScrollArea className="flex-1 border-r">
              <div className="p-8 space-y-8">
                {/* Order Info Grid */}
                <div className="grid grid-cols-2 gap-6 text-sm">
                  <div className="space-y-1">
                    <span className="text-xs text-muted-foreground font-semibold uppercase flex items-center gap-1.5">
                      <CalendarClock className="w-3.5 h-3.5" /> Thời gian
                    </span>
                    <p className="font-medium pl-5">
                      {orderDetail.createdAt
                        ? format(
                            parseISO(orderDetail.createdAt),
                            "HH:mm - dd/MM/yyyy",
                            { locale: vi }
                          )
                        : "N/A"}
                    </p>
                  </div>
                  {orderDetail.scheduledAt && (
                    <div className="space-y-1">
                      <span className="text-xs text-muted-foreground font-semibold uppercase flex items-center gap-1.5">
                        <CalendarClock className="w-3.5 h-3.5" /> Lịch hẹn
                      </span>
                      <p className="font-medium pl-5">
                        {format(
                          parseISO(orderDetail.scheduledAt),
                          "HH:mm - dd/MM/yyyy",
                          { locale: vi }
                        )}
                      </p>
                    </div>
                  )}
                </div>

                <Separator />

                {/* Items Table */}
                <div className="space-y-4">
                  <h3 className="text-sm font-semibold flex items-center gap-2">
                    <FileText className="w-4 h-4 text-muted-foreground" />
                    Chi tiết đơn hàng
                  </h3>

                  <div className="border rounded-lg overflow-hidden">
                    <Table>
                      <TableHeader>
                        <TableRow className="hover:bg-transparent bg-muted/5">
                          <TableHead className="h-10 text-xs font-bold uppercase w-[50%]">
                            Hạng mục
                          </TableHead>
                          <TableHead className="h-10 text-xs font-bold uppercase text-right">
                            Đơn giá
                          </TableHead>
                          <TableHead className="h-10 text-xs font-bold uppercase text-center">
                            SL
                          </TableHead>
                          <TableHead className="h-10 text-xs font-bold uppercase text-right">
                            Tổng
                          </TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {orderType === "menu" && posOrderDetail?.items ? (
                          posOrderDetail.items.map((item: POSOrderItemDto) => (
                            <TableRow
                              key={item.id}
                              className="border-b hover:bg-muted/5"
                            >
                              <TableCell className="py-3 font-medium">
                                {item.itemName}
                                {item.customItemName && (
                                  <span className="block text-xs text-muted-foreground">
                                    ({item.customItemName})
                                  </span>
                                )}
                              </TableCell>
                              <TableCell className="py-3 text-right font-mono text-xs text-muted-foreground">
                                {formatMoney(item.unitPrice).vndFormatted}
                              </TableCell>
                              <TableCell className="py-3 text-center text-xs font-medium">
                                {item.quantity}
                              </TableCell>
                              <TableCell className="py-3 text-right font-mono text-sm font-semibold">
                                {formatMoney(item.subtotal).vndFormatted}
                              </TableCell>
                            </TableRow>
                          ))
                        ) : serviceOrderDetail ? (
                          <TableRow className="border-b hover:bg-muted/5">
                            <TableCell className="py-3 font-medium">
                              {serviceOrderDetail.serviceItemName ||
                                serviceOrderDetail.customServiceName}
                              <span className="block text-xs text-muted-foreground font-mono">
                                {serviceOrderDetail.serviceItemCode}
                              </span>
                            </TableCell>
                            <TableCell className="py-3 text-right font-mono text-xs text-muted-foreground">
                              {
                                formatMoney(serviceOrderDetail.unitPrice)
                                  .vndFormatted
                              }
                            </TableCell>
                            <TableCell className="py-3 text-center text-xs font-medium">
                              {serviceOrderDetail.quantity}
                            </TableCell>
                            <TableCell className="py-3 text-right font-mono text-sm font-semibold">
                              {formatMoney(subTotal).vndFormatted}
                            </TableCell>
                          </TableRow>
                        ) : (
                          <TableRow>
                            <TableCell
                              colSpan={4}
                              className="text-center py-8 text-muted-foreground"
                            >
                              Không có dữ liệu
                            </TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </div>
                </div>

                {/* Note */}
                {orderDetail.note && (
                  <div className="bg-amber-50 border border-amber-100 rounded-lg p-3 text-sm text-amber-900">
                    <span className="font-bold mr-2">Ghi chú:</span>{" "}
                    {orderDetail.note}
                  </div>
                )}
              </div>
            </ScrollArea>

            {/* RIGHT: PAYMENT (ACTIONABLE) */}
            <div className="w-full lg:w-[420px] bg-muted/5 border-l flex flex-col h-full">
              <div className="p-8 flex-1 overflow-y-auto">
                {/* 1. Financial Summary */}
                <div className="space-y-3 mb-8">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Tạm tính</span>
                    <span className="font-mono">
                      {formatMoney(subTotal).vndFormatted}
                    </span>
                  </div>

                  {/* Fees (Conditional Render) */}
                  {(orderDetail.vatAmount > 0 ||
                    orderDetail.serviceChargeAmount > 0) && (
                    <>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">VAT</span>
                        <span className="font-mono">
                          {formatMoney(orderDetail.vatAmount || 0).vndFormatted}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">
                          Phí dịch vụ
                        </span>
                        <span className="font-mono">
                          {
                            formatMoney(orderDetail.serviceChargeAmount || 0)
                              .vndFormatted
                          }
                        </span>
                      </div>
                    </>
                  )}

                  <Separator />

                  <div className="flex justify-between items-center pt-2">
                    <span className="font-semibold text-lg">
                      Tổng thanh toán
                    </span>
                    <span className="font-mono text-2xl font-bold text-primary tracking-tight">
                      {formatMoney(totalAmount).vndFormatted}
                    </span>
                  </div>
                </div>

                {/* 2. Payment Form */}
                <div className="space-y-6 animate-in slide-in-from-bottom-2 fade-in duration-500">
                  <div className="bg-background border rounded-lg p-5 shadow-sm">
                    <h4 className="text-xs font-bold uppercase text-muted-foreground mb-4">
                      Nhập thanh toán
                    </h4>

                    <Form {...paymentForm}>
                      <form className="space-y-5">
                        <FormField
                          control={paymentForm.control}
                          name="paidAmount"
                          render={({ field }) => (
                            <FormItem>
                              <FormControl>
                                <div className="relative">
                                  <Banknote className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-primary" />
                                  <Input
                                    type="number"
                                    className="pl-10 pr-12 h-12 text-lg font-bold font-mono text-right"
                                    {...field}
                                    onChange={(e) =>
                                      field.onChange(Number(e.target.value))
                                    }
                                  />
                                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-muted-foreground">
                                    VND
                                  </span>
                                </div>
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <div className="grid grid-cols-2 gap-3">
                          <FormField
                            control={paymentForm.control}
                            name="paymentMethod"
                            render={({ field }) => (
                              <FormItem>
                                <Select
                                  onValueChange={field.onChange}
                                  defaultValue={field.value}
                                >
                                  <FormControl>
                                    <SelectTrigger className="pl-9 w-40 relative">
                                      <CreditCard className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                                      <SelectValue placeholder="Phương thức" />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent>
                                    {PAYMENT_METHODS.filter(
                                      (pm) => !pm.disabled
                                    ).map((pm) => (
                                      <SelectItem
                                        key={pm.value}
                                        value={pm.value}
                                      >
                                        {pm.label}
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
                            name="transactionReference"
                            render={({ field }) => (
                              <FormItem>
                                <FormControl>
                                  <div className="relative">
                                    <Hash className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                                    <Input
                                      placeholder="Mã GD"
                                      className="pl-9"
                                      {...field}
                                      value={field.value || ""}
                                    />
                                  </div>
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>

                        {/* Feedback: Change Amount */}
                        {changeAmount > 0 && (
                          <div className="flex justify-between items-center p-3 bg-green-50 text-green-700 rounded-md border border-green-100">
                            <span className="text-sm font-medium">
                              Tiền thừa trả khách:
                            </span>
                            <span className="font-mono font-bold text-lg">
                              {formatMoney(changeAmount).vndFormatted}
                            </span>
                          </div>
                        )}

                        {/* Feedback: Error */}
                        {!isPaymentValid && paidAmount > 0 && (
                          <div className="flex items-center gap-2 text-xs text-destructive bg-destructive/10 p-2 rounded">
                            <AlertCircle className="w-4 h-4" /> Số tiền chưa đủ
                          </div>
                        )}
                      </form>
                    </Form>
                  </div>
                </div>
              </div>

              {/* 3. Footer Action */}
              <div className="p-6 border-t bg-background">
                <Button
                  className="w-full h-12 text-base font-semibold shadow-md transition-all hover:scale-[1.01]"
                  onClick={paymentForm.handleSubmit(handleSubmit)}
                  disabled={isPaying || !isPaymentValid}
                >
                  {isPaying ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <>
                      Xác nhận thanh toán{" "}
                      <ArrowRight className="w-5 h-5 ml-2" />
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex-1 flex items-center justify-center text-muted-foreground">
            Không tìm thấy thông tin đơn hàng
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}
