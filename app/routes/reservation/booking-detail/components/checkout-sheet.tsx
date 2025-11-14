import { useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { format, parseISO } from "date-fns";
import { vi } from "date-fns/locale";
import {
  AlertCircle,
  CreditCard,
  Info,
  Loader2,
  PlusCircle,
} from "lucide-react";
import { z } from "zod";
import { Alert, AlertDescription } from "~/components/ui/alert";
import { Button } from "~/components/ui/button";
// Removed collapsible – showing direct tables per clarified requirements
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
import { Badge } from "~/components/ui/badge";
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
import { BookingSchema } from "~/services/api/booking/booking.schema";
import type {
  StaffCheckoutPaymentRequestDto,
  StaffCheckoutRequestDto,
  StaffCreateCheckoutInvoiceResponseDto,
} from "~/services/api/booking/dto";
import { PAYMENT_METHODS } from "~/services/types/payment.types";
import {
  useBookingPendingCharges,
  useCheckout,
  useCheckoutPayment,
  useCreateCheckoutInvoice,
} from "../container/use-booking-checkout.hooks";
import { InvoicesService } from "~/services/api/invoices";
import { BookingService } from "~/services/api/booking";

const { StaffCheckoutPaymentRequestSchema } = BookingSchema;

// Badge variants mapping for invoice statuses
const INVOICE_STATUS_BADGE: Record<
  string,
  { variant: any; className?: string }
> = {
  Unpaid: { variant: "destructive" },
  Paid: { variant: "success" },
  PartiallyPaid: { variant: "warning" },
  Overpaid: { variant: "info" },
  Voided: { variant: "outline", className: "line-through opacity-70" },
};

type CheckoutPaymentFormData = z.infer<
  typeof BookingSchema.StaffCheckoutPaymentRequestSchema
>;

interface CheckoutSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  bookingId: string;
  bookingCode: string;
}

export default function CheckoutSheet({
  open,
  onOpenChange,
  bookingId,
  bookingCode,
}: CheckoutSheetProps) {
  const [checkoutInvoice, setCheckoutInvoice] =
    useState<StaffCreateCheckoutInvoiceResponseDto | null>(null);

  const {
    data: pendingCharges,
    isPending: isLoadingCharges,
    error: chargesError,
    refetch: refetchPendingCharges,
  } = useBookingPendingCharges(bookingId, open);

  // Manual invoice creation mutation (POST)
  const {
    mutate: createInvoice,
    isPending: isCreatingInvoice,
    data: invoiceData,
  } = useCreateCheckoutInvoice(bookingId);
  const { mutate: processPayment, isPending: isProcessingPayment } =
    useCheckoutPayment(bookingId);
  const { mutate: finalizeCheckout, isPending: isCheckingOut } =
    useCheckout(bookingId);

  const isProcessing =
    isCreatingInvoice || isProcessingPayment || isCheckingOut;

  // Payment form
  const paymentForm = useForm<CheckoutPaymentFormData>({
    resolver: zodResolver(StaffCheckoutPaymentRequestSchema),
    defaultValues: {
      method: "Cash",
      amount: 0,
      transactionReference: "",
    },
  });

  const method = paymentForm.watch("method");
  const amount = paymentForm.watch("amount");

  // Calculate totals
  const totalDue = pendingCharges?.summary?.totalDue || 0;
  // Derived values not needed as standalone variables after refactor

  const changeAmount = useMemo(() => {
    const referenceBalance = checkoutInvoice?.balance ?? totalDue;
    return amount > referenceBalance ? amount - referenceBalance : 0;
  }, [amount, totalDue, checkoutInvoice]);

  // When invoice is present use its balance as threshold; otherwise totalDue
  const requiredAmount = checkoutInvoice?.balance ?? totalDue;
  const isPaymentValid = requiredAmount === 0 || amount >= requiredAmount;

  // Update form amount when pending charges load
  // Prefill payment amount once invoice is available
  useEffect(() => {
    if (checkoutInvoice && checkoutInvoice.balance > 0) {
      paymentForm.setValue("amount", checkoutInvoice.balance);
    } else if (!checkoutInvoice && totalDue > 0) {
      // fallback before invoice creation
      paymentForm.setValue("amount", totalDue);
    }
  }, [checkoutInvoice, totalDue, paymentForm]);

  // Handle error - close sheet and show toast
  useEffect(() => {
    if (chargesError) {
      onOpenChange(false);
    }
  }, [chargesError, onOpenChange]);

  // Reset state when sheet closes
  useEffect(() => {
    if (!open) {
      setCheckoutInvoice(null);
      paymentForm.reset();
    }
  }, [open, paymentForm]);

  // Fetch existing booking invoices (GET list) – identify if a checkout invoice already exists.
  const { data: bookingInvoices } = useQuery({
    queryKey: ["invoices", "booking", bookingId, open],
    enabled: open,
    queryFn: () => InvoicesService.getInvoicesByBooking(bookingId),
  });

  useEffect(() => {
    let ignore = false;
    async function loadExistingInvoice() {
      if (
        open &&
        !checkoutInvoice &&
        bookingInvoices &&
        bookingInvoices.length > 0 &&
        totalDue > 0
      ) {
        try {
          const existing = await BookingService.staffCreateInvoice(bookingId);
          if (!ignore) setCheckoutInvoice(existing);
        } catch (err) {
          console.error("Không thể tải hóa đơn sẵn có", err);
        }
      }
    }
    loadExistingInvoice();
    return () => {
      ignore = true;
    };
  }, [bookingInvoices, open, checkoutInvoice, bookingId, totalDue]);

  useEffect(() => {
    if (invoiceData) {
      setCheckoutInvoice(invoiceData);
    }
  }, [invoiceData]);

  // Step 2: Process payment
  const handlePayment = (data: CheckoutPaymentFormData) => {
    if (!isPaymentValid) {
      paymentForm.setError("amount", {
        message: "Số tiền thanh toán phải lớn hơn hoặc bằng tổng tiền",
      });
      return;
    }

    const paymentData: StaffCheckoutPaymentRequestDto = {
      method: data.method,
      amount: data.amount,
      transactionReference: data.transactionReference || undefined,
    };

    // Payment retry handling: keep invoice state; auto finalize on full payment
    processPayment(paymentData, {
      onSuccess: () => {
        // If invoice exists and now should be zero balance, finalize
        if (checkoutInvoice) {
          // Optimistically finalize; backend enforces full payment rule
          handleFinalCheckout();
        } else if (!checkoutInvoice && totalDue === 0) {
          handleFinalCheckout();
        }
      },
      onError: () => {
        // Allow retry; form stays as-is
      },
    });
  };

  // Step 3: Finalize checkout
  const handleFinalCheckout = () => {
    const checkoutData: StaffCheckoutRequestDto = {
      actualCheckoutTime: new Date().toISOString(),
      notes: undefined,
    };

    finalizeCheckout(checkoutData, {
      onSuccess: () => {
        onOpenChange(false);
      },
    });
  };

  const canProceedToPayment =
    checkoutInvoice != null && checkoutInvoice.balance >= 0;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="w-full sm:max-w-[90vw] lg:max-w-[1000px] p-0 flex flex-col"
      >
        <SheetHeader className="p-6 pb-4 border-b">
          <SheetTitle className="text-xl">
            Checkout đơn đặt phòng #{bookingCode}
          </SheetTitle>
          <SheetDescription>
            Xem tổng quan chi phí và hoàn tất checkout
          </SheetDescription>
        </SheetHeader>

        {isLoadingCharges ? (
          <div className="flex items-center justify-center flex-1">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : pendingCharges ? (
          <>
            <div className="flex-1 overflow-y-auto">
              <div className="px-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-6">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <h4 className="font-semibold text-sm">Đồ ăn/Đồ uống</h4>
                        <span className="text-xs text-muted-foreground">
                          {pendingCharges.pendingOrders.posOrders.length} đơn
                        </span>
                      </div>
                      <div className="border rounded-lg overflow-hidden">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Tên món</TableHead>
                              <TableHead className="text-right">SL</TableHead>
                              <TableHead className="text-right">
                                Đơn giá
                              </TableHead>
                              <TableHead className="text-right">
                                Thành tiền
                              </TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {pendingCharges.pendingOrders.posOrders.length ===
                              0 && (
                              <TableRow>
                                <TableCell
                                  colSpan={4}
                                  className="text-center text-xs text-muted-foreground"
                                >
                                  Không có món chưa thanh toán
                                </TableCell>
                              </TableRow>
                            )}
                            {pendingCharges.pendingOrders.posOrders.map(
                              (order) =>
                                order.items.map((item) => (
                                  <TableRow key={item.id}>
                                    <TableCell className="font-medium truncate max-w-[160px]">
                                      {item.itemName}
                                    </TableCell>
                                    <TableCell className="text-right tabular-nums text-xs">
                                      {item.quantity}
                                    </TableCell>
                                    <TableCell className="text-right tabular-nums text-xs">
                                      {formatMoney(item.unitPrice).vndFormatted}
                                    </TableCell>
                                    <TableCell className="text-right tabular-nums font-semibold text-xs">
                                      {formatMoney(item.subtotal).vndFormatted}
                                    </TableCell>
                                  </TableRow>
                                ))
                            )}
                          </TableBody>
                        </Table>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <h4 className="font-semibold text-sm">Dịch vụ</h4>
                        <span className="text-xs text-muted-foreground">
                          {pendingCharges.pendingOrders.serviceOrders.length}{" "}
                          đơn
                        </span>
                      </div>
                      <div className="border rounded-lg overflow-hidden">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Tên dịch vụ</TableHead>
                              <TableHead className="text-right">SL</TableHead>
                              <TableHead className="text-right">
                                Đơn giá
                              </TableHead>
                              <TableHead className="text-right">
                                Lên lịch
                              </TableHead>
                              <TableHead className="text-right">
                                Thành tiền
                              </TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {pendingCharges.pendingOrders.serviceOrders
                              .length === 0 && (
                              <TableRow>
                                <TableCell
                                  colSpan={5}
                                  className="text-center text-xs text-muted-foreground"
                                >
                                  Không có dịch vụ chưa thanh toán
                                </TableCell>
                              </TableRow>
                            )}
                            {pendingCharges.pendingOrders.serviceOrders.map(
                              (service) => (
                                <TableRow key={service.id}>
                                  <TableCell className="font-medium truncate max-w-[160px]">
                                    {service.serviceName}
                                  </TableCell>
                                  <TableCell className="text-right tabular-nums text-xs">
                                    {service.quantity}
                                  </TableCell>
                                  <TableCell className="text-right tabular-nums text-xs">
                                    {
                                      formatMoney(service.unitPrice)
                                        .vndFormatted
                                    }
                                  </TableCell>
                                  <TableCell className="text-right text-[10px] text-muted-foreground">
                                    {format(
                                      parseISO(service.scheduledAt),
                                      "dd/MM/yyyy HH:mm",
                                      { locale: vi }
                                    )}
                                  </TableCell>
                                  <TableCell className="text-right tabular-nums font-semibold text-xs">
                                    {formatMoney(service.subtotal).vndFormatted}
                                  </TableCell>
                                </TableRow>
                              )
                            )}
                          </TableBody>
                        </Table>
                      </div>
                    </div>
                    <div className="space-y-3 p-4 rounded-lg bg-muted/30 border">
                      <h4 className="font-semibold text-sm">Chi phí phòng</h4>
                      {pendingCharges.roomInvoice ? (
                        <>
                          <div className="flex justify-between text-xs">
                            <span className="text-muted-foreground">Tổng</span>
                            <span className="font-medium tabular-nums">
                              {
                                formatMoney(pendingCharges.roomInvoice.total)
                                  .vndFormatted
                              }
                            </span>
                          </div>
                          <div className="flex justify-between text-xs">
                            <span className="text-muted-foreground">
                              Đã thanh toán
                            </span>
                            <span className="font-medium tabular-nums text-green-600">
                              -
                              {
                                formatMoney(pendingCharges.roomInvoice.paid)
                                  .vndFormatted
                              }
                            </span>
                          </div>
                          <div className="flex justify-between text-xs font-semibold">
                            <span>Còn lại</span>
                            <span className="tabular-nums">
                              {
                                formatMoney(pendingCharges.roomInvoice.balance)
                                  .vndFormatted
                              }
                            </span>
                          </div>
                        </>
                      ) : (
                        <p className="text-xs text-muted-foreground">
                          Không có chi phí phòng chưa thanh toán
                        </p>
                      )}
                    </div>
                  </div>

                  {/* RIGHT COLUMN: Invoice + Payment */}
                  <div className="space-y-6">
                    {/* Invoice Card */}
                    <div className="space-y-3 p-4 rounded-lg bg-card border shadow-sm">
                      <h4 className="font-semibold text-sm flex items-center justify-between">
                        <span>Hóa đơn Checkout</span>
                        {isCreatingInvoice && !checkoutInvoice && (
                          <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
                        )}
                      </h4>
                      {checkoutInvoice ? (
                        <>
                          <div className="grid grid-cols-2 gap-2 text-xs">
                            <div className="space-y-1">
                              <p className="text-muted-foreground">
                                Số hóa đơn
                              </p>
                              <p
                                className="font-medium truncate"
                                title={checkoutInvoice.invoiceNo}
                              >
                                {checkoutInvoice.invoiceNo}
                              </p>
                            </div>
                            <div className="space-y-1 flex flex-col">
                              <p className="text-muted-foreground flex items-center justify-between">
                                <span>Trạng thái</span>
                                {checkoutInvoice.balance > 0 && (
                                  <Button
                                    type="button"
                                    size="sm"
                                    variant="outline"
                                    className="h-5 px-2 text-[10px]"
                                    onClick={() => refetchPendingCharges()}
                                    disabled={isLoadingCharges}
                                  >
                                    {isLoadingCharges ? "Đang tải" : "Làm mới"}
                                  </Button>
                                )}
                              </p>
                              <Badge
                                variant={
                                  INVOICE_STATUS_BADGE[checkoutInvoice.status]
                                    ?.variant || "secondary"
                                }
                                className={
                                  INVOICE_STATUS_BADGE[checkoutInvoice.status]
                                    ?.className
                                }
                              >
                                {checkoutInvoice.status}
                              </Badge>
                            </div>
                            <div className="space-y-1">
                              <p className="text-muted-foreground">Ngày tạo</p>
                              <p className="font-medium">
                                {format(
                                  checkoutInvoice.issuedAt,
                                  "dd/MM/yyyy HH:mm",
                                  { locale: vi }
                                )}
                              </p>
                            </div>
                            <div className="space-y-1">
                              <p className="text-muted-foreground">
                                Phương thức
                              </p>
                              <p className="font-medium">
                                {checkoutInvoice.paymentMethod === "Unknown"
                                  ? "Chưa xác định"
                                  : checkoutInvoice.paymentMethod}
                              </p>
                            </div>
                          </div>

                          <Separator />
                          <div className="space-y-1 text-xs">
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">
                                Tạm tính
                              </span>
                              <span className="font-medium tabular-nums">
                                {
                                  formatMoney(checkoutInvoice.subTotal)
                                    .vndFormatted
                                }
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">
                                Tổng cộng
                              </span>
                              <span className="font-semibold tabular-nums text-primary">
                                {
                                  formatMoney(checkoutInvoice.total)
                                    .vndFormatted
                                }
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">
                                Đã thanh toán
                              </span>
                              <span className="font-medium tabular-nums text-green-600">
                                -
                                {
                                  formatMoney(checkoutInvoice.paidAmount)
                                    .vndFormatted
                                }
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">
                                Còn lại
                              </span>
                              <span className="font-semibold tabular-nums">
                                {
                                  formatMoney(checkoutInvoice.balance)
                                    .vndFormatted
                                }
                              </span>
                            </div>
                          </div>
                        </>
                      ) : totalDue === 0 ? (
                        <p className="text-xs text-muted-foreground">
                          Đã thanh toán đủ – không cần tạo hóa đơn
                        </p>
                      ) : (
                        <div className="flex flex-col gap-2 text-xs">
                          <p className="text-muted-foreground">
                            Chưa có hóa đơn checkout
                          </p>
                          <Button
                            type="button"
                            size="sm"
                            variant="outline"
                            onClick={() => createInvoice()}
                            disabled={isCreatingInvoice || isProcessing}
                          >
                            {isCreatingInvoice ? (
                              <>
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                Đang tạo...
                              </>
                            ) : (
                              <>
                                <PlusCircle className="w-4 h-4 mr-2" />
                                Tạo hóa đơn checkout
                              </>
                            )}
                          </Button>
                        </div>
                      )}
                    </div>

                    {/* Payment Form */}
                    <div className="space-y-4">
                      <h4 className="font-semibold text-sm">Thanh toán</h4>
                      {totalDue === 0 && (
                        <Alert>
                          <Info className="h-4 w-4" />
                          <AlertDescription>
                            Đã thanh toán đủ – không cần thanh toán thêm
                          </AlertDescription>
                        </Alert>
                      )}
                      {/* No auto-create alert anymore per manual trigger design */}
                      {canProceedToPayment &&
                        checkoutInvoice &&
                        checkoutInvoice.balance > 0 && (
                          <Form {...paymentForm}>
                            <form className="space-y-4">
                              <FormField
                                control={paymentForm.control}
                                name="method"
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
                                        <SelectTrigger>
                                          <SelectValue placeholder="Chọn phương thức" />
                                        </SelectTrigger>
                                      </FormControl>
                                      <SelectContent>
                                        {PAYMENT_METHODS.filter(
                                          (m) => !m.disabled
                                        ).map((m) => {
                                          const Icon = m.icon;
                                          return (
                                            <SelectItem
                                              key={m.value}
                                              value={m.value}
                                            >
                                              <div className="flex items-center gap-2">
                                                <Icon className="w-4 h-4" />
                                                {m.label}
                                              </div>
                                            </SelectItem>
                                          );
                                        })}
                                      </SelectContent>
                                    </Select>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                              <FormField
                                control={paymentForm.control}
                                name="amount"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>Số tiền thanh toán</FormLabel>
                                    <FormControl>
                                      <Input
                                        type="number"
                                        placeholder="0"
                                        {...field}
                                        onChange={(e) =>
                                          field.onChange(Number(e.target.value))
                                        }
                                      />
                                    </FormControl>
                                    <FormDescription>
                                      Cần thanh toán:{" "}
                                      {
                                        formatMoney(checkoutInvoice.balance)
                                          .vndFormatted
                                      }
                                    </FormDescription>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                              {changeAmount > 0 && (
                                <Alert>
                                  <Info className="h-4 w-4" />
                                  <AlertDescription>
                                    Tiền thừa trả khách:{" "}
                                    <span className="font-bold">
                                      {formatMoney(changeAmount).vndFormatted}
                                    </span>
                                  </AlertDescription>
                                </Alert>
                              )}
                              {!isPaymentValid && amount > 0 && (
                                <Alert variant="destructive">
                                  <AlertCircle className="h-4 w-4" />
                                  <AlertDescription>
                                    Số tiền thanh toán phải &ge; số tiền cần
                                    thanh toán
                                  </AlertDescription>
                                </Alert>
                              )}
                              {paymentForm.watch("method") !== "Cash" && (
                                <FormField
                                  control={paymentForm.control}
                                  name="transactionReference"
                                  render={({ field }) => (
                                    <FormItem>
                                      <FormLabel>
                                        Mã giao dịch
                                        {paymentForm.watch("method") ===
                                          "BankTransfer" && (
                                          <span className="text-destructive ml-1">
                                            *
                                          </span>
                                        )}
                                      </FormLabel>
                                      <FormControl>
                                        <Input
                                          placeholder="Nhập mã giao dịch"
                                          {...field}
                                          value={field.value ?? ""}
                                        />
                                      </FormControl>
                                      <FormDescription>
                                        {paymentForm.watch("method") ===
                                        "BankTransfer"
                                          ? "Bắt buộc cho chuyển khoản"
                                          : "Tùy chọn"}
                                      </FormDescription>
                                      <FormMessage />
                                    </FormItem>
                                  )}
                                />
                              )}
                            </form>
                          </Form>
                        )}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer Actions */}
            <SheetFooter className="p-6 border-t flex-col gap-3">
              {checkoutInvoice &&
                isPaymentValid &&
                checkoutInvoice.balance > 0 && (
                  <Alert className="w-full">
                    <Info className="h-4 w-4" />
                    <AlertDescription>
                      Thanh toán đủ sẽ tự động hoàn tất checkout
                    </AlertDescription>
                  </Alert>
                )}
              <div className="flex justify-end items-center w-full gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => onOpenChange(false)}
                  disabled={isProcessing}
                >
                  Đóng
                </Button>
                {checkoutInvoice && checkoutInvoice.balance > 0 && (
                  <Button
                    type="button"
                    onClick={paymentForm.handleSubmit(handlePayment)}
                    disabled={isProcessingPayment || !isPaymentValid}
                  >
                    {isProcessingPayment ? (
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
                )}
                {(checkoutInvoice && checkoutInvoice.balance === 0) ||
                (!checkoutInvoice && totalDue === 0) ? (
                  <Button
                    type="button"
                    onClick={handleFinalCheckout}
                    disabled={isCheckingOut}
                  >
                    {isCheckingOut ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Đang checkout...
                      </>
                    ) : (
                      "Hoàn tất Checkout"
                    )}
                  </Button>
                ) : null}
              </div>
            </SheetFooter>
          </>
        ) : (
          <div className="flex items-center justify-center flex-1">
            <p className="text-muted-foreground">
              Không tìm thấy thông tin checkout
            </p>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}
