import { zodResolver } from "@hookform/resolvers/zod";
import { format, parseISO } from "date-fns";
import { vi } from "date-fns/locale";
import {
  Banknote,
  CalendarClock,
  CheckCircle2,
  CreditCard,
  FileText,
  Hash,
  Loader2,
  Receipt,
  XCircle,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import type { z } from "zod";

import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "~/components/ui/form";
import { Input } from "~/components/ui/input";
import { ScrollArea } from "~/components/ui/scroll-area";
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
import { Switch } from "~/components/ui/switch";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "~/components/ui/table";
import { cn, formatMoney } from "~/lib/utils";

import { useCalculateInvoiceFees } from "~/routes/reservation/booking-detail/container/use-booking-checkout.hooks";
import type { POSOrderItemDto } from "~/services/api/orders/dto";
import { OrderSchema } from "~/services/api/orders/order.schema";
import { PAYMENT_METHODS } from "~/services/types/payment.types";
import { usePOSOrderDetailByOrder } from "../container/pos-orders/query.hooks";
import { useServiceOrderDetail } from "../container/service-order/query.hooks";
import { hasAnyRole } from "~/lib/auth/bouncer";
import { AuthLoader, UserRole } from "~/lib/auth/auth.loader";

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

  const [applyVat, setApplyVat] = useState(true);
  const [applyServiceCharge, setApplyServiceCharge] = useState(true);

  const orderDetail =
    orderType === "menu" ? posOrderDetail : serviceOrderDetail;

  const subTotal =
    orderType === "menu"
      ? posOrderDetail?.totalAmount || 0
      : (serviceOrderDetail?.unitPrice || 0) *
        (serviceOrderDetail?.quantity || 0);

  const { data: calculatedFees, isPending: isCalculatingFees } =
    useCalculateInvoiceFees(
      {
        subtotalAmount: subTotal,
        applyVat,
        applyServiceCharge,
      },
      open
    );
  const displayVatAmount = calculatedFees?.vatAmount ?? 0;
  const displayServiceChargeAmount = calculatedFees?.serviceChargeAmount ?? 0;
  const displayTotalAmount = calculatedFees?.totalAmount ?? subTotal;

  const paymentForm = useForm<PaymentFormData>({
    resolver: zodResolver(OrderPayNowRequestSchema),
    mode: "onChange",
    defaultValues: {
      paymentMethod: "Cash",
      paidAmount: displayTotalAmount,
      transactionReference: "",
    },
  });

  const paidAmount = paymentForm.watch("paidAmount");

  // Real-time Change Calculation
  const changeAmount = useMemo(() => {
    return paidAmount > displayTotalAmount
      ? paidAmount - displayTotalAmount
      : 0;
  }, [paidAmount, displayTotalAmount]);

  const isPaymentValid = paidAmount >= displayTotalAmount;

  // Auto-fill amount when total changes
  useEffect(() => {
    if (displayTotalAmount > 0 && open) {
      paymentForm.setValue("paidAmount", displayTotalAmount);
    }
  }, [displayTotalAmount, paymentForm, open]);

  const handleSubmit = (data: PaymentFormData) => {
    if (!isPaymentValid) {
      paymentForm.setError("paidAmount", {
        message: "Số tiền thanh toán không đủ",
      });
      return;
    }
    onPayNow(data);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "Completed":
        return (
          <Badge className="bg-green-600 hover:bg-green-700 h-6">
            <CheckCircle2 className="w-3 h-3 mr-1" /> Hoàn thành
          </Badge>
        );
      case "Cancelled":
        return (
          <Badge variant="destructive" className="h-6">
            <XCircle className="w-3 h-3 mr-1" /> Đã hủy
          </Badge>
        );
      case "Open":
      case "Scheduled":
        return (
          <Badge
            variant="secondary"
            className="bg-blue-100 text-blue-700 hover:bg-blue-200 h-6"
          >
            <CalendarClock className="w-3 h-3 mr-1" /> Đang xử lý
          </Badge>
        );
      default:
        return (
          <Badge variant="outline" className="h-6">
            {status}
          </Badge>
        );
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="w-full sm:max-w-[95vw] lg:max-w-[1200px] p-0 flex flex-col bg-background border-l shadow-2xl"
      >
        {/* === HEADER === */}
        <SheetHeader className="px-8 py-5 border-b shrink-0 flex flex-row items-center justify-between space-y-0 bg-background z-10">
          <div>
            <SheetTitle className="text-xl font-bold tracking-tight">
              Thanh toán {orderType === "menu" ? "Đơn hàng F&B" : "Dịch vụ"}
            </SheetTitle>
            <SheetDescription className="flex items-center gap-2 text-xs">
              <span className="font-mono font-medium text-foreground bg-muted px-1.5 py-0.5 rounded">
                #{orderId.slice(0, 8).toUpperCase()}
              </span>
              <span className="text-muted-foreground">•</span>
              <span>{format(new Date(), "HH:mm dd/MM/yyyy")}</span>
            </SheetDescription>
          </div>
          {orderDetail && getStatusBadge(orderDetail.status)}
        </SheetHeader>

        {/* === BODY: SPLIT VIEW === */}
        {isPending ? (
          <div className="flex-1 flex flex-col items-center justify-center gap-2">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
            <p className="text-sm text-muted-foreground">
              Đang tải thông tin đơn hàng...
            </p>
          </div>
        ) : orderDetail ? (
          <div className="flex-1 overflow-hidden flex flex-col lg:flex-row bg-muted/5">
            {/* LEFT PANE: ORDER DETAILS (READ ONLY) */}
            <ScrollArea className="flex-1 lg:border-r border-b lg:border-b-0 bg-background">
              <div className="p-8 space-y-8 max-w-3xl mx-auto lg:mx-0">
                {/* 1. Meta Info Cards */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 rounded-xl border bg-card flex flex-col gap-1">
                    <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider flex items-center gap-1.5">
                      <CalendarClock className="w-3 h-3" /> Thời gian tạo
                    </span>
                    <span className="font-medium text-sm">
                      {orderDetail.createdAt
                        ? format(
                            parseISO(orderDetail.createdAt),
                            "HH:mm - dd/MM/yyyy",
                            { locale: vi }
                          )
                        : "N/A"}
                    </span>
                  </div>
                  {orderDetail.scheduledAt && (
                    <div
                      className="p-4 rounded-xl border bg-amber-50 dark:bg-amber-900/30
                     border-amber-100 dark:border-amber-700 flex flex-col gap-1"
                    >
                      <span className="text-[10px] uppercase font-bold text-amber-700 dark:text-amber-300 tracking-wider flex items-center gap-1.5">
                        <CalendarClock className="w-3 h-3" /> Lịch hẹn
                      </span>
                      <span className="font-medium text-sm text-amber-900 dark:text-amber-200">
                        {format(
                          parseISO(orderDetail.scheduledAt),
                          "HH:mm - dd/MM/yyyy",
                          { locale: vi }
                        )}
                      </span>
                    </div>
                  )}
                </div>

                <Separator />

                {/* 2. Items List */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-bold flex items-center gap-2 text-foreground">
                      <FileText className="w-4 h-4 text-muted-foreground" />
                      Chi tiết hạng mục
                    </h3>
                    <Badge variant="outline" className="font-mono text-xs">
                      {orderType === "menu" ? posOrderDetail?.items?.length : 1}{" "}
                      món
                    </Badge>
                  </div>

                  <div className="rounded-md overflow-hidden">
                    <Table>
                      <TableHeader className="bg-muted/30">
                        <TableRow className="hover:bg-transparent">
                          <TableHead className="h-9 text-[11px] font-bold uppercase w-[50%]">
                            Hạng mục
                          </TableHead>
                          <TableHead className="h-9 text-[11px] font-bold uppercase text-right">
                            Đơn giá
                          </TableHead>
                          <TableHead className="h-9 text-[11px] font-bold uppercase text-center">
                            SL
                          </TableHead>
                          <TableHead className="h-9 text-[11px] font-bold uppercase text-right">
                            Thành tiền
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
                              <TableCell className="py-3 font-medium text-sm">
                                {item.itemName}
                                {item.customItemName && (
                                  <span className="block text-xs text-muted-foreground italic mt-0.5">
                                    ({item.customItemName})
                                  </span>
                                )}
                              </TableCell>
                              <TableCell className="py-3 text-right font-mono text-xs text-muted-foreground">
                                {formatMoney(item.unitPrice).vndFormatted}
                              </TableCell>
                              <TableCell className="py-3 text-center text-xs font-medium bg-muted/10">
                                x{item.quantity}
                              </TableCell>
                              <TableCell className="py-3 text-right font-mono text-sm font-semibold">
                                {formatMoney(item.subtotal).vndFormatted}
                              </TableCell>
                            </TableRow>
                          ))
                        ) : serviceOrderDetail ? (
                          <TableRow className="border-b hover:bg-muted/5">
                            <TableCell className="py-3 font-medium text-sm">
                              {serviceOrderDetail.serviceItemName ||
                                serviceOrderDetail.customServiceName}
                              <span className="block text-xs text-muted-foreground font-mono mt-0.5 opacity-70">
                                Code: {serviceOrderDetail.serviceItemCode}
                              </span>
                            </TableCell>
                            <TableCell className="py-3 text-right font-mono text-xs text-muted-foreground">
                              {
                                formatMoney(serviceOrderDetail.unitPrice)
                                  .vndFormatted
                              }
                            </TableCell>
                            <TableCell className="py-3 text-center text-xs font-medium bg-muted/10">
                              x{serviceOrderDetail.quantity}
                            </TableCell>
                            <TableCell className="py-3 text-right font-mono text-sm font-semibold">
                              {formatMoney(subTotal).vndFormatted}
                            </TableCell>
                          </TableRow>
                        ) : (
                          <TableRow>
                            <TableCell
                              colSpan={4}
                              className="text-center py-8 text-muted-foreground text-sm"
                            >
                              Không có dữ liệu
                            </TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </div>
                </div>

                {/* 3. Note */}
                {orderDetail.note && (
                  <div className="bg-yellow-50/50 border border-yellow-100 rounded-lg p-4 text-sm text-yellow-900">
                    <span className="font-bold text-xs uppercase tracking-wide text-yellow-700 block mb-1">
                      Ghi chú
                    </span>
                    {orderDetail.note}
                  </div>
                )}
              </div>
            </ScrollArea>

            {/* RIGHT PANE: PAYMENT ACTIONS (FIXED WIDTH) */}
            <div className="w-full lg:w-[480px] bg-background flex flex-col h-full shadow-[0_0_15px_rgba(0,0,0,0.05)] z-20">
              {/* Financial Summary */}
              <div className="p-6 pb-2 space-y-6 flex-1 overflow-y-auto">
                <div className="space-y-4">
                  <h3 className="text-sm font-bold flex items-center gap-2 text-foreground">
                    <Receipt className="w-4 h-4 text-muted-foreground" />
                    Tóm tắt thanh toán
                  </h3>

                  <div className="space-y-3 p-4 bg-muted/30 rounded-xl border border-dashed">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Tạm tính</span>
                      <span className="font-mono font-medium">
                        {formatMoney(subTotal).vndFormatted}
                      </span>
                    </div>

                    {/* FEE SWITCHES */}
                    <div className="space-y-3 pt-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <Switch
                            id="apply-vat"
                            checked={applyVat}
                            onCheckedChange={setApplyVat}
                          />
                          <label
                            htmlFor="apply-vat"
                            className="text-sm font-medium cursor-pointer select-none"
                          >
                            VAT
                          </label>
                        </div>
                        <span
                          className={cn(
                            "font-mono text-sm",
                            !applyVat &&
                              "text-muted-foreground line-through opacity-50"
                          )}
                        >
                          {isCalculatingFees ? (
                            <Loader2 className="w-3 h-3 animate-spin" />
                          ) : (
                            formatMoney(displayVatAmount).vndFormatted
                          )}
                        </span>
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <Switch
                            id="apply-service"
                            checked={applyServiceCharge}
                            onCheckedChange={setApplyServiceCharge}
                          />
                          <label
                            htmlFor="apply-service"
                            className="text-sm font-medium cursor-pointer select-none"
                          >
                            Phí dịch vụ
                          </label>
                        </div>
                        <span
                          className={cn(
                            "font-mono text-sm",
                            !applyServiceCharge &&
                              "text-muted-foreground line-through opacity-50"
                          )}
                        >
                          {isCalculatingFees ? (
                            <Loader2 className="w-3 h-3 animate-spin" />
                          ) : (
                            formatMoney(displayServiceChargeAmount).vndFormatted
                          )}
                        </span>
                      </div>
                    </div>

                    <Separator className="bg-border/50" />

                    <div className="flex justify-between items-end pt-1">
                      <span className="text-base font-bold">
                        Tổng thanh toán
                      </span>
                      <span className="font-mono text-2xl font-bold text-primary tracking-tighter">
                        {isCalculatingFees ? (
                          <Loader2 className="w-5 h-5 animate-spin" />
                        ) : (
                          formatMoney(displayTotalAmount).vndFormatted
                        )}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Payment Form */}
                <div className="pt-2 animate-in fade-in slide-in-from-bottom-4 duration-500">
                  <Form {...paymentForm}>
                    <form className="space-y-5">
                      {/* Amount Input */}
                      <FormField
                        control={paymentForm.control}
                        name="paidAmount"
                        render={({ field }) => (
                          <FormItem>
                            <Input
                              startAddon={<Banknote className="h-6 w-6" />}
                              endAddon={
                                <span className=" text-sm font-bold text-muted-foreground pointer-events-none">
                                  VND
                                </span>
                              }
                              type="number"
                              className={cn(
                                "h-12 text-2xl font-bold font-mono ",
                                !isPaymentValid &&
                                  "border-destructive focus-visible:ring-destructive/20 bg-destructive/5"
                              )}
                              {...field}
                              onChange={(e) =>
                                field.onChange(Number(e.target.value))
                              }
                            />

                            {/* Quick Actions */}
                            <div className="flex gap-2 justify-end mt-1.5">
                              <Button
                                variant="link"
                                size="sm"
                                type="button"
                                onClick={() =>
                                  paymentForm.setValue(
                                    "paidAmount",
                                    displayTotalAmount
                                  )
                                }
                                className="text-[10px] font-bold uppercase tracking-wide text-primary hover:underline"
                              >
                                Thanh toán đủ
                              </Button>
                            </div>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      {/* Method & Ref */}
                      <div className="flex items-center gap-4">
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
                                  <SelectTrigger className="h-11">
                                    <div className="flex items-center gap-2">
                                      <CreditCard className="w-4 h-4 text-muted-foreground" />
                                      <SelectValue placeholder="Phương thức" />
                                    </div>
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  {PAYMENT_METHODS.filter(
                                    (pm) => !pm.disabled
                                  ).map((pm) => (
                                    <SelectItem key={pm.value} value={pm.value}>
                                      {pm.label}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={paymentForm.control}
                          name="transactionReference"
                          render={({ field }) => (
                            <FormItem className="flex-1">
                              <FormControl>
                                <div className="relative">
                                  <Input
                                    startAddon={
                                      <Hash className="h-4 w-4 text-muted-foreground" />
                                    }
                                    placeholder="Mã giao dịch (Optional)"
                                    {...field}
                                    value={field.value || ""}
                                  />
                                </div>
                              </FormControl>
                            </FormItem>
                          )}
                        />
                      </div>

                      {/* Change Display */}
                      <div
                        className={cn(
                          "rounded-xl border p-4 transition-all duration-300",
                          changeAmount > 0
                            ? "bg-emerald-50 border-emerald-200 opacity-100 translate-y-0"
                            : "opacity-0 -translate-y-4 pointer-events-none absolute"
                        )}
                      >
                        <div className="flex justify-between items-center text-emerald-800">
                          <span className="font-semibold text-sm">
                            Tiền thừa trả khách
                          </span>
                          <span className="font-mono font-bold text-xl">
                            {formatMoney(changeAmount).vndFormatted}
                          </span>
                        </div>
                      </div>
                    </form>
                  </Form>
                </div>
              </div>

              {/* Action Footer */}
              <div className="p-6 border-t bg-background">
                {hasAnyRole(AuthLoader.getUser(), [UserRole.Receptionist]) && (
                  <Button
                    size="lg"
                    className="w-full h-12 text-base font-semibold shadow-lg hover:shadow-xl transition-all hover:-translate-y-0.5"
                    onClick={paymentForm.handleSubmit(handleSubmit)}
                    disabled={isPaying || !isPaymentValid}
                  >
                    {isPaying ? (
                      <Loader2 className="w-5 h-5 animate-spin mr-2" />
                    ) : (
                      <CheckCircle2 className="w-5 h-5 mr-2" />
                    )}
                    {isPaying ? "Đang xử lý..." : "Xác nhận thanh toán"}
                  </Button>
                )}
              </div>
            </div>
          </div>
        ) : (
          <div className="flex-1 flex items-center justify-center text-muted-foreground bg-muted/5">
            Không tìm thấy thông tin đơn hàng
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}
