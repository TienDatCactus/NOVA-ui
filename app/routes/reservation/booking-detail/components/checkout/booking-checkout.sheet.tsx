import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import type { z } from "zod";
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
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "~/components/ui/sheet";
import { Textarea } from "~/components/ui/textarea";
import { BookingSchema } from "~/services/api/booking/booking.schema";
import { useBookingCheckout } from "../../container/checkout.hooks";
import { ChargesTable } from "./charges-table";

const { StaffCheckoutPaymentRequestSchema, StaffCheckoutRequestSchema } =
  BookingSchema;

const PAYMENT_METHODS = [
  { value: "Cash", label: "Tiền mặt" },
  { value: "Card", label: "Thẻ" },
  { value: "BankTransfer", label: "Chuyển khoản" },
  { value: "OTACollect", label: "OTA Thu hộ" },
  { value: "OTAPrepaid", label: "OTA Trả trước" },
] as const;

interface BookingCheckoutSheetProps {
  bookingId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

type CheckoutFormData = z.infer<typeof StaffCheckoutRequestSchema>;

export function BookingCheckoutSheet({
  bookingId,
  open,
  onOpenChange,
}: BookingCheckoutSheetProps) {
  const {
    pendingCharges,
    invoicePreview,
    checkoutInvoiceData,
    totalPendingAmount,
    roomBalance,
    pendingChargesAmount,
    hasPendingCharges,
    isLoading,
    createCheckoutInvoice,
    isCreatingInvoice,
    processPayment,
    isProcessingPayment,
    completeCheckout,
    isCheckingOut,
  } = useBookingCheckout(bookingId, open);

  const [invoiceCreated, setInvoiceCreated] = useState(false);
  const [paymentProcessed, setPaymentProcessed] = useState(false);

  // Payment form - Uses StaffCheckoutPaymentRequestSchema
  const paymentForm = useForm<
    z.infer<typeof StaffCheckoutPaymentRequestSchema>
  >({
    defaultValues: {
      roomPayment:
        roomBalance > 0
          ? {
              method: "Cash",
              amount: roomBalance,
            }
          : undefined,
      checkoutPayment:
        pendingChargesAmount > 0
          ? {
              method: "Cash",
              amount: pendingChargesAmount,
            }
          : undefined,
    },
  });

  // Checkout form - Simple notes field
  const checkoutForm = useForm<CheckoutFormData>({
    resolver: zodResolver(StaffCheckoutRequestSchema),
    defaultValues: {
      notes: "",
    },
  });

  // Update amounts when data changes
  useEffect(() => {
    if (roomBalance > 0) {
      paymentForm.setValue("roomPayment.amount", roomBalance);
    }
    if (pendingChargesAmount > 0) {
      paymentForm.setValue("checkoutPayment.amount", pendingChargesAmount);
    }
  }, [roomBalance, pendingChargesAmount, paymentForm]);

  // Handler 1: Create invoice
  const handleCreateInvoice = async () => {
    if (!hasPendingCharges) {
      toast.error("Không có dịch vụ nào cần tạo hóa đơn");
      return;
    }

    try {
      await createCheckoutInvoice();
      setInvoiceCreated(true);
    } catch (error) {
      console.error("Create invoice failed:", error);
    }
  };

  // Handler 2: Process payment
  const handlePayment = async (
    data: z.infer<typeof StaffCheckoutPaymentRequestSchema>
  ) => {
    try {
      await processPayment(data);
      setPaymentProcessed(true);
    } catch (error) {
      console.error("Payment failed:", error);
    }
  };

  // Handler 3: Complete checkout
  const handleCompleteCheckout = async (data: CheckoutFormData) => {
    try {
      await completeCheckout(data);
      onOpenChange(false);
      // Reset states
      setInvoiceCreated(false);
      setPaymentProcessed(false);
      paymentForm.reset();
      checkoutForm.reset();
    } catch (error) {
      console.error("Checkout failed:", error);
    }
  };

  if (isLoading) {
    return (
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent>
          <div className="flex items-center justify-center h-full">
            <Loader2 className="w-8 h-8 animate-spin" />
          </div>
        </SheetContent>
      </Sheet>
    );
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="w-full sm:max-w-[90vw] lg:max-w-[1200px] p-0 flex flex-col overflow-y-auto"
      >
        <SheetHeader className="p-6 pb-4 border-b">
          <SheetTitle>Checkout Booking #{bookingId}</SheetTitle>
          <SheetDescription>
            Xem lại chi phí và hoàn tất thanh toán
          </SheetDescription>
        </SheetHeader>

        <div className="flex-1 p-6 space-y-6">
          {/* Pending Charges */}
          {pendingCharges && (
            <div className="space-y-4">
              <h3 className="font-semibold text-lg">Chi phí chưa thanh toán</h3>
              <ChargesTable data={pendingCharges} />
            </div>
          )}

          {/* Invoice Preview (if exists) */}
          {invoicePreview && (
            <div className="space-y-4">
              <h3 className="font-semibold text-lg">Xem trước hóa đơn</h3>
              <div className="p-4 border rounded-lg bg-muted/50">
                <dl className="space-y-2">
                  <div className="flex justify-between">
                    <dt className="text-muted-foreground">Tổng phụ:</dt>
                    <dd className="font-medium">
                      {invoicePreview.subTotal.toLocaleString("vi-VN")} đ
                    </dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-muted-foreground">Tổng cộng:</dt>
                    <dd className="font-bold text-lg">
                      {invoicePreview.total.toLocaleString("vi-VN")} đ
                    </dd>
                  </div>
                </dl>
              </div>
            </div>
          )}

          {/* Created Invoice Info */}
          {checkoutInvoiceData && (
            <div className="p-4 border border-green-200 bg-green-50 rounded-lg">
              <h4 className="font-semibold text-green-900 mb-2">
                ✓ Hóa đơn đã tạo
              </h4>
              <p className="text-sm text-green-700">
                Mã HĐ: {checkoutInvoiceData.invoiceNo}
              </p>
              <p className="text-sm text-green-700">
                Tổng: {checkoutInvoiceData.total.toLocaleString("vi-VN")} đ
              </p>
            </div>
          )}

          {/* Payment Form */}
          {totalPendingAmount > 0 && !paymentProcessed && (
            <div className="space-y-4">
              <h3 className="font-semibold text-lg">Thông tin thanh toán</h3>
              <Form {...paymentForm}>
                <form className="space-y-4">
                  {/* Room Payment */}
                  {roomBalance > 0 && (
                    <div className="p-4 border rounded-lg space-y-3">
                      <h4 className="font-medium">Thanh toán phòng</h4>
                      <FormField
                        control={paymentForm.control}
                        name="roomPayment.method"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Phương thức</FormLabel>
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
                                {PAYMENT_METHODS.map((method) => (
                                  <SelectItem
                                    key={method.value}
                                    value={method.value}
                                  >
                                    {method.label}
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
                        name="roomPayment.amount"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Số tiền</FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                {...field}
                                onChange={(e) =>
                                  field.onChange(Number(e.target.value))
                                }
                              />
                            </FormControl>
                            <FormDescription>
                              Số dư phòng: {roomBalance.toLocaleString("vi-VN")}{" "}
                              đ
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  )}

                  {/* Checkout Payment */}
                  {pendingChargesAmount > 0 && (
                    <div className="p-4 border rounded-lg space-y-3">
                      <h4 className="font-medium">Thanh toán dịch vụ & POS</h4>
                      <FormField
                        control={paymentForm.control}
                        name="checkoutPayment.method"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Phương thức</FormLabel>
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
                                {PAYMENT_METHODS.map((method) => (
                                  <SelectItem
                                    key={method.value}
                                    value={method.value}
                                  >
                                    {method.label}
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
                        name="checkoutPayment.amount"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Số tiền</FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                {...field}
                                onChange={(e) =>
                                  field.onChange(Number(e.target.value))
                                }
                              />
                            </FormControl>
                            <FormDescription>
                              Tổng dịch vụ:{" "}
                              {pendingChargesAmount.toLocaleString("vi-VN")} đ
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  )}
                </form>
              </Form>
            </div>
          )}
        </div>

        <SheetFooter className="p-6 border-t bg-muted/30">
          <div className="flex justify-between items-center w-full">
            <div className="text-sm space-y-1">
              {invoiceCreated && (
                <p className="text-green-600">✓ Đã tạo hóa đơn</p>
              )}
              {paymentProcessed && (
                <p className="text-green-600">✓ Đã thanh toán</p>
              )}
            </div>

            <div className="flex gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={
                  isCreatingInvoice || isProcessingPayment || isCheckingOut
                }
              >
                Hủy
              </Button>

              {/* Step 1: Create Invoice */}
              {hasPendingCharges && !invoiceCreated && (
                <Button
                  onClick={handleCreateInvoice}
                  disabled={isCreatingInvoice}
                  variant="secondary"
                >
                  {isCreatingInvoice ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Đang tạo HĐ...
                    </>
                  ) : (
                    "Tạo hóa đơn"
                  )}
                </Button>
              )}

              {/* Step 2: Process Payment */}
              {totalPendingAmount > 0 && !paymentProcessed && (
                <Button
                  onClick={paymentForm.handleSubmit(handlePayment)}
                  disabled={isProcessingPayment}
                >
                  {isProcessingPayment ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Đang thanh toán...
                    </>
                  ) : (
                    "Thanh toán"
                  )}
                </Button>
              )}

              {/* Step 3: Complete Checkout */}
              <Button
                onClick={checkoutForm.handleSubmit(handleCompleteCheckout)}
                disabled={
                  isCheckingOut || (totalPendingAmount > 0 && !paymentProcessed)
                }
                size="lg"
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
            </div>
          </div>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
