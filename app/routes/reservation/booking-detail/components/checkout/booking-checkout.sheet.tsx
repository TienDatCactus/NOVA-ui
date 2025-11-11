import { zodResolver } from "@hookform/resolvers/zod";
import { format, parseISO } from "date-fns";
import {
  AlertCircle,
  CheckCircle2,
  ChevronDown,
  CreditCard,
  FileText,
  Loader2,
  Receipt,
} from "lucide-react";
import { useState } from "react";
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
import { Table, TableBody, TableCell, TableRow } from "~/components/ui/table";
import { Textarea } from "~/components/ui/textarea";
import { formatMoney } from "~/lib/utils";
import { BookingSchema } from "~/services/api/booking/booking.schema";
import type { BookingDetailResponseDto } from "~/services/api/booking/dto";
import type { InvoicePreviewResponseDto } from "~/services/api/invoices/dto";
import { PAYMENT_METHODS } from "~/services/types/payment.types";
import { useBookingCheckout } from "../../container/checkout.hooks";
import { useQueryClient } from "@tanstack/react-query";

const { StaffCheckoutRequestSchema } = BookingSchema;

type CheckoutFormData = z.infer<typeof StaffCheckoutRequestSchema>;

interface BookingCheckoutSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  bookingDetail: BookingDetailResponseDto;
}

export default function BookingCheckoutSheet({
  open,
  onOpenChange,
  bookingDetail,
}: BookingCheckoutSheetProps) {
  const queryClient = useQueryClient();
  const [expandedSections, setExpandedSections] = useState({
    charges: true,
    invoice: false,
    payment: false,
  });
  const [checkoutSuccess, setCheckoutSuccess] = useState(false);

  const {
    pendingCharges,
    loadingCharges,
    createInvoice,
    invoicePreview,
    isCreatingInvoice,
    processPayment,
    isProcessingPayment,
    completeCheckout,
    isCompletingCheckout,
    invoiceCreated,
    paymentProcessed,
  } = useBookingCheckout(bookingDetail.id, open);

  const form = useForm<CheckoutFormData>({
    resolver: zodResolver(StaffCheckoutRequestSchema),
    defaultValues: {
      actualCheckoutTime: new Date(),
      notes: "",
      payments: {
        roomPayment: undefined,
        checkoutPayment: undefined,
      },
    },
  });

  const isOTAPrepaid =
    bookingDetail.source === "OTA" || bookingDetail.source === "OTACollect";

  // Calculate totals
  const roomBalance = pendingCharges?.summary.roomBalance || 0;
  const pendingChargesTotal = pendingCharges?.summary.pendingCharges || 0;
  const grandTotal = pendingCharges?.summary.totalDue || 0;

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections((prev) => ({ ...prev, [section]: !prev[section] }));
  };

  const handleCreateInvoice = () => {
    if (!pendingCharges) return;

    const posOrderIds = pendingCharges.pendingOrders.posOrders.map((o) => o.id);
    const serviceOrderIds = pendingCharges.pendingOrders.serviceOrders.map(
      (o) => o.id
    );

    createInvoice(
      { posOrderIds, serviceOrderIds },
      {
        onSuccess: () => {
          toggleSection("invoice");
          toggleSection("payment");
        },
      }
    );
  };

  const handlePayment = (data: CheckoutFormData) => {
    if (!invoicePreview) return;

    processPayment(data, {
      onSuccess: () => {
        form.reset({
          ...data,
          payments: {
            roomPayment: data.payments?.roomPayment,
            checkoutPayment: data.payments?.checkoutPayment,
          },
        });
      },
    });
  };

  const handleCompleteCheckout = () => {
    const formData = form.getValues();
    completeCheckout(formData, {
      onSuccess: () => {
        setCheckoutSuccess(true);
        setTimeout(() => {
          queryClient.invalidateQueries({
            queryKey: ["booking-detail", bookingDetail.id],
          });
          onOpenChange(false);
        }, 2000);
      },
    });
  };

  // Validation states
  const canCreateInvoice = !!pendingCharges && !invoiceCreated;
  const canProcessPayment = invoiceCreated && !paymentProcessed;
  const canCompleteCheckout = paymentProcessed;

  if (checkoutSuccess) {
    return (
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent
          side="right"
          className="w-full sm:max-w-[90vw] lg:max-w-[800px] p-0 flex flex-col"
        >
          <div className="flex items-center justify-center flex-1 p-6">
            <div className="text-center space-y-4">
              <CheckCircle2 className="w-16 h-16 text-green-600 mx-auto" />
              <h2 className="text-2xl font-bold">Checkout thành công!</h2>
              <p className="text-muted-foreground">
                Booking #{bookingDetail.bookingCode} đã được checkout
              </p>
              <p className="text-sm text-muted-foreground">
                Đang chuyển hướng...
              </p>
            </div>
          </div>
        </SheetContent>
      </Sheet>
    );
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="w-full sm:max-w-[90vw] lg:max-w-[1000px] p-0 flex flex-col"
      >
        <SheetHeader className="p-6 pb-4 border-b">
          <SheetTitle className="text-xl">
            Checkout - {bookingDetail.bookingCode}
          </SheetTitle>
          <SheetDescription>
            {bookingDetail.customer.fullName} • Room{" "}
            {bookingDetail.rooms.map((r) => r.roomName).join(", ")} •{" "}
            {format(parseISO(bookingDetail.checkinDate), "dd/MM/yyyy")} →{" "}
            {format(parseISO(bookingDetail.checkoutDate), "dd/MM/yyyy")}
          </SheetDescription>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {/* Step 1: Review Charges */}
          <Collapsible
            open={expandedSections.charges}
            onOpenChange={() => toggleSection("charges")}
          >
            <div className="border rounded-lg">
              <CollapsibleTrigger className="flex items-center justify-between w-full p-4 hover:bg-muted/50">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                    <span className="text-sm font-semibold text-primary">
                      1
                    </span>
                  </div>
                  <div className="text-left">
                    <h3 className="font-semibold">Tổng quan chi phí</h3>
                    <p className="text-sm text-muted-foreground">
                      Xem lại tất cả các khoản phí
                    </p>
                  </div>
                </div>
                <ChevronDown
                  className={`w-5 h-5 transition-transform ${expandedSections.charges ? "rotate-180" : ""}`}
                />
              </CollapsibleTrigger>

              <CollapsibleContent>
                <div className="p-4 pt-0 space-y-4">
                  {loadingCharges ? (
                    <div className="flex items-center justify-center py-8">
                      <Loader2 className="w-6 h-6 animate-spin text-primary" />
                    </div>
                  ) : pendingCharges ? (
                    <>
                      {/* Room Charges */}
                      <div className="space-y-2">
                        <h4 className="font-semibold text-sm flex items-center gap-2">
                          🏨 Room Charges
                        </h4>
                        <div className="bg-muted/30 p-3 rounded-lg">
                          <div className="flex justify-between">
                            <span className="text-sm">
                              Invoice #{pendingCharges.roomInvoice?.invoiceNo}
                            </span>
                            <span className="font-semibold tabular-nums">
                              {formatMoney(roomBalance).vndFormatted}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* F&B Orders */}
                      {pendingCharges.pendingOrders.posOrders.length > 0 && (
                        <ChargesCategorySection
                          title="🍽️ F&B Orders"
                          orders={pendingCharges.pendingOrders.posOrders}
                          type="pos"
                        />
                      )}

                      {/* Service Orders */}
                      {pendingCharges.pendingOrders.serviceOrders.length >
                        0 && (
                        <ChargesCategorySection
                          title="💆 Service Orders"
                          orders={pendingCharges.pendingOrders.serviceOrders}
                          type="service"
                        />
                      )}

                      <Separator />

                      {/* Total */}
                      <div className="flex justify-between items-center">
                        <span className="font-bold">TOTAL PENDING:</span>
                        <span className="text-2xl font-bold text-primary tabular-nums">
                          {formatMoney(grandTotal).vndFormatted}
                        </span>
                      </div>
                    </>
                  ) : (
                    <Alert variant="destructive">
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>
                        Không thể tải thông tin chi phí
                      </AlertDescription>
                    </Alert>
                  )}
                </div>
              </CollapsibleContent>
            </div>
          </Collapsible>

          {/* Step 2: Create Invoice */}
          <Collapsible
            open={expandedSections.invoice}
            onOpenChange={() => toggleSection("invoice")}
            disabled={!canCreateInvoice && !invoiceCreated}
          >
            <div
              className={`border rounded-lg ${!canCreateInvoice && !invoiceCreated ? "opacity-50" : ""}`}
            >
              <CollapsibleTrigger
                className="flex items-center justify-between w-full p-4 hover:bg-muted/50"
                disabled={!canCreateInvoice && !invoiceCreated}
              >
                <div className="flex items-center gap-2">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      invoiceCreated ? "bg-green-100" : "bg-primary/10"
                    }`}
                  >
                    {invoiceCreated ? (
                      <CheckCircle2 className="w-5 h-5 text-green-600" />
                    ) : (
                      <span className="text-sm font-semibold text-primary">
                        2
                      </span>
                    )}
                  </div>
                  <div className="text-left">
                    <h3 className="font-semibold">Tạo hóa đơn</h3>
                    <p className="text-sm text-muted-foreground">
                      {invoiceCreated
                        ? "Hóa đơn đã được tạo"
                        : "Tổng hợp tất cả chi phí"}
                    </p>
                  </div>
                </div>
                <ChevronDown
                  className={`w-5 h-5 transition-transform ${expandedSections.invoice ? "rotate-180" : ""}`}
                />
              </CollapsibleTrigger>

              <CollapsibleContent>
                <div className="p-4 pt-0 space-y-4">
                  {!invoiceCreated ? (
                    <Button
                      onClick={handleCreateInvoice}
                      disabled={isCreatingInvoice || !canCreateInvoice}
                      className="w-full"
                    >
                      {isCreatingInvoice ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Đang tạo hóa đơn...
                        </>
                      ) : (
                        <>
                          <FileText className="w-4 h-4 mr-2" />
                          Tạo hóa đơn
                        </>
                      )}
                    </Button>
                  ) : invoicePreview ? (
                    <InvoicePreviewSection invoice={invoicePreview} />
                  ) : null}
                </div>
              </CollapsibleContent>
            </div>
          </Collapsible>

          {/* Step 3: Payment */}
          <Collapsible
            open={expandedSections.payment}
            onOpenChange={() => toggleSection("payment")}
            disabled={!canProcessPayment && !paymentProcessed}
          >
            <div
              className={`border rounded-lg ${!canProcessPayment && !paymentProcessed ? "opacity-50" : ""}`}
            >
              <CollapsibleTrigger
                className="flex items-center justify-between w-full p-4 hover:bg-muted/50"
                disabled={!canProcessPayment && !paymentProcessed}
              >
                <div className="flex items-center gap-2">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      paymentProcessed ? "bg-green-100" : "bg-primary/10"
                    }`}
                  >
                    {paymentProcessed ? (
                      <CheckCircle2 className="w-5 h-5 text-green-600" />
                    ) : (
                      <span className="text-sm font-semibold text-primary">
                        3
                      </span>
                    )}
                  </div>
                  <div className="text-left">
                    <h3 className="font-semibold">Thanh toán</h3>
                    <p className="text-sm text-muted-foreground">
                      {paymentProcessed ? "Đã thanh toán" : "Xử lý thanh toán"}
                    </p>
                  </div>
                </div>
                <ChevronDown
                  className={`w-5 h-5 transition-transform ${expandedSections.payment ? "rotate-180" : ""}`}
                />
              </CollapsibleTrigger>

              <CollapsibleContent>
                <div className="p-4 pt-0">
                  <Form {...form}>
                    <form className="space-y-6">
                      {isOTAPrepaid && (
                        <Alert className="bg-blue-50 border-blue-200">
                          <AlertDescription>
                            Booking này đã được thanh toán qua OTA. Vui lòng xác
                            nhận để hoàn tất checkout.
                          </AlertDescription>
                        </Alert>
                      )}

                      <PaymentSection
                        title="Room Payment"
                        fieldPrefix="payments.roomPayment"
                        amount={roomBalance}
                        form={form}
                        isOTAPrepaid={isOTAPrepaid}
                      />

                      {pendingChargesTotal > 0 && (
                        <PaymentSection
                          title="Checkout Payment (Pending Charges)"
                          fieldPrefix="payments.checkoutPayment"
                          amount={pendingChargesTotal}
                          form={form}
                          isOTAPrepaid={false}
                        />
                      )}

                      <FormField
                        control={form.control}
                        name="notes"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>
                              Ghi chú checkout{" "}
                              <span className="text-muted-foreground text-xs">
                                (tùy chọn)
                              </span>
                            </FormLabel>
                            <FormControl>
                              <Textarea
                                {...field}
                                value={field.value || ""}
                                placeholder="Thêm ghi chú nếu cần..."
                                rows={3}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <Button
                        type="button"
                        onClick={form.handleSubmit(handlePayment)}
                        disabled={
                          isProcessingPayment ||
                          !canProcessPayment ||
                          paymentProcessed
                        }
                        className="w-full"
                      >
                        {isProcessingPayment ? (
                          <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            Đang xử lý thanh toán...
                          </>
                        ) : paymentProcessed ? (
                          <>
                            <CheckCircle2 className="w-4 h-4 mr-2" />
                            Đã thanh toán
                          </>
                        ) : (
                          <>
                            <CreditCard className="w-4 h-4 mr-2" />
                            Xử lý thanh toán
                          </>
                        )}
                      </Button>
                    </form>
                  </Form>
                </div>
              </CollapsibleContent>
            </div>
          </Collapsible>
        </div>

        <SheetFooter className="p-6 border-t">
          <div className="flex justify-between items-center w-full">
            <div className="text-sm text-muted-foreground">
              {!canCompleteCheckout && (
                <span className="text-destructive">
                  Vui lòng hoàn tất thanh toán trước khi checkout
                </span>
              )}
            </div>
            <div className="flex gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isCompletingCheckout}
              >
                Hủy
              </Button>
              <Button
                type="button"
                onClick={handleCompleteCheckout}
                disabled={isCompletingCheckout || !canCompleteCheckout}
              >
                {isCompletingCheckout ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Đang xử lý...
                  </>
                ) : (
                  <>
                    <Receipt className="w-4 h-4 mr-2" />
                    Hoàn tất Checkout
                  </>
                )}
              </Button>
            </div>
          </div>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}

// Helper Components
function ChargesCategorySection({
  title,
  orders,
  type,
}: {
  title: string;
  orders: any[];
  type: "pos" | "service";
}) {
  const [expanded, setExpanded] = useState(false);
  const total = orders.reduce(
    (sum, o) => sum + (o.totalAmount || o.subtotal),
    0
  );

  return (
    <div className="space-y-2">
      <Collapsible open={expanded} onOpenChange={setExpanded}>
        <CollapsibleTrigger className="flex items-center justify-between w-full">
          <h4 className="font-semibold text-sm">{title}</h4>
          <div className="flex items-center gap-2">
            <span className="text-sm tabular-nums">
              {formatMoney(total).vndFormatted}
            </span>
            <ChevronDown
              className={`w-4 h-4 transition-transform ${expanded ? "rotate-180" : ""}`}
            />
          </div>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <div className="mt-2 space-y-2">
            {orders.map((order) => (
              <div
                key={order.id}
                className="bg-muted/30 p-3 rounded-lg space-y-2"
              >
                <div className="flex justify-between text-sm">
                  <span>Order #{order.id.slice(0, 8).toUpperCase()}</span>
                  <Badge variant="outline">{order.status}</Badge>
                </div>
                {type === "pos" && order.items && (
                  <Table>
                    <TableBody>
                      {order.items.map((item: any) => (
                        <TableRow key={item.id}>
                          <TableCell className="text-xs">
                            {item.itemName}
                          </TableCell>
                          <TableCell className="text-xs text-right">
                            {item.quantity}×
                          </TableCell>
                          <TableCell className="text-xs text-right tabular-nums">
                            {formatMoney(item.subtotal).vndFormatted}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
                <div className="flex justify-between font-semibold text-sm">
                  <span>Total:</span>
                  <span className="tabular-nums">
                    {
                      formatMoney(order.totalAmount || order.subtotal)
                        .vndFormatted
                    }
                  </span>
                </div>
              </div>
            ))}
          </div>
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
}

function InvoicePreviewSection({
  invoice,
}: {
  invoice: InvoicePreviewResponseDto;
}) {
  return (
    <div className="space-y-3 p-4 rounded-lg bg-muted/30 border">
      <div className="flex justify-between text-sm">
        <span className="text-muted-foreground">Subtotal:</span>
        <span className="font-medium tabular-nums">
          {formatMoney(invoice.subTotal).vndFormatted}
        </span>
      </div>
      <div className="flex justify-between text-sm">
        <span className="text-muted-foreground">VAT:</span>
        <span className="font-medium tabular-nums">
          {formatMoney(invoice.vatAmount).vndFormatted}
        </span>
      </div>
      <div className="flex justify-between text-sm">
        <span className="text-muted-foreground">Service Charge:</span>
        <span className="font-medium tabular-nums">
          {formatMoney(invoice.serviceChargeAmount).vndFormatted}
        </span>
      </div>
      <Separator />
      <div className="flex justify-between items-baseline">
        <span className="font-semibold">GRAND TOTAL:</span>
        <span className="text-2xl font-bold text-primary tabular-nums">
          {formatMoney(invoice.totalAmount).vndFormatted}
        </span>
      </div>
      <div className="text-xs text-muted-foreground">
        {invoice.totalItemCount} items
      </div>
    </div>
  );
}

function PaymentSection({
  title,
  fieldPrefix,
  amount,
  form,
  isOTAPrepaid,
}: {
  title: string;
  fieldPrefix: string;
  amount: number;
  form: any;
  isOTAPrepaid: boolean;
}) {
  const paidAmount = form.watch(`${fieldPrefix}.amount`) || 0;
  const changeAmount = Math.max(0, paidAmount - amount);

  return (
    <div className="space-y-4 p-4 border rounded-lg">
      <h4 className="font-semibold">{title}</h4>
      <div className="text-2xl font-bold text-primary tabular-nums">
        {formatMoney(amount).vndFormatted}
      </div>

      {isOTAPrepaid ? (
        <Alert className="bg-blue-50 border-blue-200">
          <AlertDescription>Đã thanh toán qua OTA</AlertDescription>
        </Alert>
      ) : (
        <>
          <FormField
            control={form.control}
            name={`${fieldPrefix}.method`}
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
                    {PAYMENT_METHODS.filter((m) => !m.disabled).map(
                      (method) => (
                        <SelectItem key={method.value} value={method.value}>
                          <div className="flex items-center gap-2">
                            <method.icon className="w-4 h-4" />
                            {method.label}
                          </div>
                        </SelectItem>
                      )
                    )}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name={`${fieldPrefix}.amount`}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Số tiền thanh toán</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    {...field}
                    onChange={(e) => field.onChange(Number(e.target.value))}
                    className="tabular-nums"
                  />
                </FormControl>
                <FormDescription className="text-xs">
                  Tối thiểu: {formatMoney(amount).vndFormatted}
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          {changeAmount > 0 && (
            <Alert className="bg-green-50 border-green-200">
              <AlertDescription className="flex justify-between items-center">
                <span className="text-sm font-medium">Tiền thừa:</span>
                <span className="text-lg font-bold text-green-600 tabular-nums">
                  {formatMoney(changeAmount).vndFormatted}
                </span>
              </AlertDescription>
            </Alert>
          )}

          <FormField
            control={form.control}
            name={`${fieldPrefix}.transactionReference`}
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
        </>
      )}
    </div>
  );
}
