import {
  AlertTriangle,
  CreditCard,
  DoorOpen,
  Loader2,
  Receipt,
  RotateCcw,
  Save,
  Wallet,
} from "lucide-react";
import { useState } from "react";
import { Alert, AlertTitle } from "~/components/ui/alert";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import { formatMoney } from "~/lib/utils";
import type { BookingDetailResponseDto } from "~/services/api/booking/dto";
import { useUpdateBookingStatus } from "../../bookings/container/booking-mutation.hooks";
import CheckoutSheet from "../components/checkout/checkout-sheet";
import { PayNowRoomsSheet } from "../components/operations/pay-now-rooms-sheet";
import RefundButton from "../components/refunds/refund-button";
import type { BookingState } from "../container/use-booking-state.hooks";
import { hasAnyRole } from "~/lib/auth/bouncer";
import { AuthLoader, UserRole } from "~/lib/auth/auth.loader";

export function BookingActionsBar({
  isDirty,
  isUpdating,
  bookingDetail,
  bookingState,
  onReset,
  onSave,
}: {
  isDirty: boolean;
  isUpdating: boolean;
  bookingDetail: BookingDetailResponseDto;
  bookingState: BookingState;
  onReset: () => void;
  onSave: () => void;
}) {
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [payNowRoomsOpen, setPayNowRoomsOpen] = useState(false);

  const { mutateAsync: updateStatus, isPending: isUpdatingStatus } =
    useUpdateBookingStatus(bookingDetail?.id || "");
  const canRefund =
    bookingDetail?.status === "CheckedOut" ||
    bookingDetail?.status === "Confirmed";
  const handleQuickCheckout = async () => {
    if (bookingDetail?.source === "RoomBlock") {
      await updateStatus("CheckedOut");
    }
  };

  return (
    <div className="sticky bottom-0 left-0 right-0 border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 p-4 shadow-lg z-10 transition-all duration-200">
      <div className="max-w-[1600px] mx-auto flex items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          {canRefund && (
            <RefundButton
              bookingId={bookingDetail?.id || ""}
              bookingNumber={bookingDetail?.bookingCode || ""}
              bookingStatus={bookingDetail?.status || ""}
              totalPaidAmount={bookingDetail.paidAmount}
            />
          )}
        </div>

        <div className="flex items-center gap-3">
          {isDirty ? (
            <div className="flex items-center gap-3 animate-in slide-in-from-bottom-2 fade-in">
              <Alert variant="warning">
                <AlertTriangle className="w-4 h-4" />
                <AlertTitle>Thay đổi chưa lưu</AlertTitle>
              </Alert>

              <Button
                type="button"
                variant="ghost"
                onClick={onReset}
                disabled={isUpdating}
                className="text-muted-foreground hover:text-foreground"
              >
                <RotateCcw className="w-4 h-4 mr-2" />
                Hoàn tác
              </Button>
              {hasAnyRole(AuthLoader.getUser(), [UserRole.Receptionist]) && (
                <Button
                  onClick={onSave}
                  disabled={isUpdating}
                  className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-md min-w-[140px]"
                >
                  {isUpdating ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Lưu...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4 mr-2" /> Lưu thay đổi
                    </>
                  )}
                </Button>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-3 animate-in slide-in-from-bottom-2 fade-in">
              {hasAnyRole(AuthLoader.getUser(), [UserRole.Receptionist]) &&
                (bookingDetail?.status === "InHouse" ||
                  bookingDetail?.status === "CheckedIn") && (
                  <Button
                    variant="info-outline"
                    onClick={() => setPayNowRoomsOpen(true)}
                  >
                    <Wallet className="w-4 h-4 mr-2" />
                    Thanh toán phòng
                  </Button>
                )}

              {/* Checkout Button Logic */}
              {hasAnyRole(AuthLoader.getUser(), [UserRole.Receptionist]) &&
              bookingDetail?.source === "RoomBlock" &&
              (bookingDetail?.status === "InHouse" ||
                bookingDetail?.status === "CheckedIn") ? (
                <Button
                  variant="success"
                  onClick={handleQuickCheckout}
                  disabled={isUpdatingStatus}
                  className="shadow-sm"
                >
                  {isUpdatingStatus ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Đang xử
                      lý...
                    </>
                  ) : (
                    <>
                      <DoorOpen className="w-4 h-4 mr-2" />
                      Kết thúc bảo trì
                    </>
                  )}
                </Button>
              ) : hasAnyRole(AuthLoader.getUser(), [UserRole.Receptionist]) &&
                (bookingDetail?.status === "InHouse" ||
                  bookingDetail?.status === "CheckedIn") ? (
                <Button
                  variant="success"
                  onClick={() => setCheckoutOpen(true)}
                  className="shadow-sm"
                >
                  <DoorOpen className="w-4 h-4 mr-2" />
                  Checkout & Thanh toán
                </Button>
              ) : null}

              {/* Post-Checkout Collection */}
              {bookingDetail?.status === "CheckedOut" &&
                bookingState.financial.totalBalance > 0 && (
                  <Button
                    onClick={() => setCheckoutOpen(true)}
                    className="bg-orange-600 hover:bg-orange-700 text-white shadow-sm"
                  >
                    <CreditCard className="w-4 h-4 mr-2" />
                    Thu nợ sau checkout
                    <Badge
                      variant="secondary"
                      className="ml-2 bg-background/20 text-white hover:bg-background/30 border-0"
                    >
                      {
                        formatMoney(bookingState.financial.totalBalance)
                          .vndFormatted
                      }
                    </Badge>
                  </Button>
                )}

              {bookingDetail?.status === "CheckedOut" &&
                bookingState.financial.totalBalance === 0 && (
                  <Button
                    variant="outline"
                    onClick={() => setCheckoutOpen(true)}
                  >
                    <Receipt className="w-4 h-4 mr-2" />
                    Xem hóa đơn
                  </Button>
                )}
            </div>
          )}
        </div>
      </div>
      <CheckoutSheet
        open={checkoutOpen}
        onOpenChange={setCheckoutOpen}
        bookingDetail={bookingDetail}
      />

      <PayNowRoomsSheet
        open={payNowRoomsOpen}
        onOpenChange={setPayNowRoomsOpen}
        bookingDetail={bookingDetail}
      />
    </div>
  );
}
