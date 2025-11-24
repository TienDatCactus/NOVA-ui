import { zodResolver } from "@hookform/resolvers/zod";
import { differenceInDays, parseISO } from "date-fns";
import { CreditCard, DoorOpen, FileWarning, Receipt } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useFieldArray, useForm } from "react-hook-form";
import { toast } from "sonner";

import { Badge } from "~/components/ui/badge";

import { Button } from "~/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "~/components/ui/empty";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "~/components/ui/form";
import { Separator } from "~/components/ui/separator";
import { Skeleton } from "~/components/ui/skeleton";
import { Textarea } from "~/components/ui/textarea";
import { useOTAInfo } from "~/features/create-booking-wizard/container/create-booking-query.hooks";
import { formatMoney, toYMD } from "~/lib/utils";
import { BookingSchema } from "~/services/api/booking/booking.schema";
import type { StaffUpdateBookingRequestDto } from "~/services/api/booking/dto";
import { useUpdateBooking } from "../bookings/container/booking-mutation.hooks";
import { useBookingDetail } from "../bookings/container/booking-query.hooks";
import type { Route } from "./+types/booking-detail";
import AddCompletedChargesDialog from "./components/operations/add-completed-charges-dialog";
import BookingRoomsBar from "./components/booking-rooms-bar";
import CheckoutSheet from "./components/checkout/checkout-sheet";
import CustomerInfoBar from "./components/customer-info-bar";
import PendingChargesSection from "./components/pending-charges-section";
import RefundButton from "./components/refunds/refund-button";
import RefundHistory from "./components/refunds/refund-history";
import StayDetailBar from "./components/stay-detail-bar";
import { useAddCompletedCharges } from "./container/use-booking-checkout.hooks";
import { useBookingFinancialStatus } from "./container/use-booking-financial-status.hooks";
import { useBookingUpdatePermissions } from "./container/use-booking-update-permissions.hooks";

const { StaffUpdateBookingRequestSchema } = BookingSchema;

export const clientLoader = async ({ request, params }: Route.LoaderArgs) => {
  const bookingCode = params.bookingCode;
  if (!bookingCode) {
    throw new Response("Booking code is required", { status: 400 });
  }

  return { bookingCode };
};

export default function Component({ loaderData }: Route.ComponentProps) {
  const { bookingCode } = loaderData;
  const {
    data: bookingDetail,
    isPending,
    error,
  } = useBookingDetail({
    bookingCode,
    enabled: !!bookingCode,
  });
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [completedChargesDialogOpen, setCompletedChargesDialogOpen] =
    useState(false);
  const [noteModalOpen, setNoteModalOpen] = useState(false);

  const [isAddingCompletedCharges, setIsAddingCompletedCharges] =
    useState(false);

  const permissions = useBookingUpdatePermissions(bookingDetail);

  const financialSummary = useBookingFinancialStatus(bookingDetail?.invoices);

  const { mutate: updateBooking, isPending: isUpdating } = useUpdateBooking(
    bookingDetail?.id || ""
  );

  const form = useForm<StaffUpdateBookingRequestDto>({
    resolver: zodResolver(StaffUpdateBookingRequestSchema),
    defaultValues: {
      checkinDate: new Date(),
      checkoutDate: new Date(),
      adultsAmount: 1,
      childrenAmount: 0,
      note: "",
      otaBookingCode: "",
      otaInformationId: "",
      rooms: [],
      breakfastDates: [],
      totalAmount: 0,
    },
  });

  const roomsFieldArray = useFieldArray({
    control: form.control,
    name: "rooms",
  });

  const { data: OTAList } = useOTAInfo({
    selection: true,
  });

  useEffect(() => {
    if (bookingDetail && bookingDetail.id) {
      form.reset({
        checkinDate: bookingDetail.checkinDate,
        checkoutDate: bookingDetail.checkoutDate,
        adultsAmount: bookingDetail.adults,
        childrenAmount: bookingDetail.children || 0,
        note: bookingDetail.note || "",
        otaBookingCode: bookingDetail.source === "OTA" ? "" : "",
        otaInformationId: bookingDetail.source === "OTA" ? "" : "",
        customerId: bookingDetail.customer.id,
        totalAmount: bookingDetail.totalAmount || 0,
        breakfastDates: [],
        rooms: [],
      });
    }
  }, [bookingDetail, form]);
  const handleSubmit = (data: StaffUpdateBookingRequestDto) => {
    const hasDatesChanged =
      data.checkinDate !== bookingDetail?.checkinDate ||
      data.checkoutDate !== bookingDetail?.checkoutDate;
    const hasRoomChanges = data.rooms && data.rooms.length > 0;

    if (hasDatesChanged && !permissions.canUpdateDates) {
      toast.error(
        permissions.dateChangeBlockReason ||
          "Không thể thay đổi ngày check-in/check-out"
      );
      return;
    }

    if (hasRoomChanges && !permissions.canModifyRooms) {
      toast.error(
        "Không thể thay đổi phòng khi đã có thanh toán hoặc booking đã kết thúc"
      );
      return;
    }

    const payload: Partial<StaffUpdateBookingRequestDto> = {
      checkinDate:
        data.checkinDate instanceof Date
          ? toYMD(data.checkinDate)
          : data.checkinDate,
      checkoutDate:
        data.checkoutDate instanceof Date
          ? toYMD(data.checkoutDate)
          : data.checkoutDate,
      adultsAmount: Number(data.adultsAmount),
      childrenAmount: Number(data.childrenAmount),
      note: data.note,
      otaBookingCode: data.otaBookingCode,
      otaInformationId: data.otaInformationId,
      breakfastDates: data.breakfastDates || [],
      totalAmount: data.totalAmount,
      rooms: data.rooms,
    };

    updateBooking(payload, {});
  };

  const { mutate: addCompletedCharges } = useAddCompletedCharges(
    bookingDetail?.id || ""
  );
  const handleAddCompletedCharges = (data: {
    posItems?: Array<{ menuItemId: string; quantity: number }>;
    serviceItems?: Array<{ serviceItemId: string; quantity: number }>;
    bookingRoomId?: string;
    source?: string;
  }) => {
    if (!bookingDetail?.id) return;
    setIsAddingCompletedCharges(true);
    try {
      addCompletedCharges(data);
      setCompletedChargesDialogOpen(false);
    } catch (error) {
      console.error("Failed to add completed charges:", error);
    } finally {
      setIsAddingCompletedCharges(false);
    }
  };

  const nights = useMemo(() => {
    const checkin = form.watch("checkinDate");
    const checkout = form.watch("checkoutDate");
    const checkinDate =
      checkin instanceof Date ? checkin : parseISO(checkin!.toString());
    const checkoutDate =
      checkout instanceof Date ? checkout : parseISO(checkout!.toString());
    return differenceInDays(checkoutDate, checkinDate);
  }, [form.watch("checkinDate"), form.watch("checkoutDate")]);

  if (isPending) {
    return (
      <div className="flex gap-4 p-6">
        <div className="w-64 space-y-4">
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-32 w-full" />
        </div>
        <div className="flex-1 space-y-4">
          <Skeleton className="h-48 w-full" />
          <Skeleton className="h-96 w-full" />
        </div>
      </div>
    );
  }
  if (error || !bookingDetail) {
    return (
      <Empty>
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <FileWarning />
          </EmptyMedia>
          <EmptyTitle>Lỗi</EmptyTitle>
          <EmptyDescription>
            Không thể tải thông tin đặt phòng. Vui lòng thử lại.
          </EmptyDescription>
        </EmptyHeader>
      </Empty>
    );
  }

  return (
    <div className="flex flex-col h-full p-4 gap-4">
      <Form {...form}>
        <div className="grid flex-1 gap-4 ">
          <CustomerInfoBar
            bookingDetail={bookingDetail}
            form={form}
            OTAList={OTAList || []}
            permissions={permissions}
          />
          <div className="flex items-start gap-2">
            <div>
              <BookingRoomsBar
                bookingDetail={bookingDetail}
                form={form}
                roomsFieldArray={roomsFieldArray}
                permissions={permissions}
              />
            </div>
            <div className="flex-1 space-y-2">
              <StayDetailBar
                bookingCode={bookingCode}
                bookingDetail={bookingDetail}
                form={form}
                permissions={permissions}
                nights={nights}
                setNoteModalOpen={setNoteModalOpen}
                handleSubmit={handleSubmit}
              />
              <PendingChargesSection
                bookingId={bookingDetail.id}
                onAddCompletedCharges={() =>
                  setCompletedChargesDialogOpen(true)
                }
                canAddCharges={
                  bookingDetail.status !== "CheckedOut" &&
                  bookingDetail.status !== "Cancelled"
                }
              />

              <RefundHistory bookingId={bookingDetail.id} />
            </div>
          </div>

          <AddCompletedChargesDialog
            open={completedChargesDialogOpen}
            onOpenChange={setCompletedChargesDialogOpen}
            onConfirm={handleAddCompletedCharges}
            isAdding={isAddingCompletedCharges}
          />

          <Dialog open={noteModalOpen} onOpenChange={setNoteModalOpen}>
            <DialogContent className="max-w-xl">
              <DialogHeader>
                <DialogTitle>Ghi chú đặt phòng</DialogTitle>
                <DialogDescription>
                  Xem và chỉnh sửa các ghi chú liên quan đến đặt phòng này
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <FormField
                  control={form.control}
                  name="note"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Ghi chú</FormLabel>
                      <FormControl>
                        <Textarea
                          {...field}
                          disabled={!permissions.canDoSoftUpdate}
                          placeholder="Nhập ghi chú về đặt phòng..."
                          rows={6}
                        />
                      </FormControl>
                      <FormDescription>
                        Ghi chú nội bộ về đặt phòng này (khách hàng không thấy)
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="flex justify-end gap-2">
                  <Button
                    variant="outline"
                    onClick={() => setNoteModalOpen(false)}
                  >
                    Đóng
                  </Button>
                  <Button
                    onClick={() => {
                      setNoteModalOpen(false);
                    }}
                  >
                    Lưu ghi chú
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
        <Separator />
        <div className="flex justify-between gap-3 sticky bottom-0 bg-background pb-4 pt-4 ">
          {/* Left side: Refund button */}
          <div>
            <RefundButton
              bookingId={bookingDetail?.id || ""}
              bookingNumber={bookingDetail?.bookingCode || ""}
              bookingStatus={bookingDetail?.status || ""}
              totalPaidAmount={bookingDetail.paidAmount}
              variant="destructive"
            />
          </div>

          {/* Right side: Action buttons */}
          <div className="flex gap-3">
            {/* Checkout button for InHouse/CheckedIn */}
            {(bookingDetail?.status === "InHouse" ||
              bookingDetail?.status === "CheckedIn") && (
              <Button variant={"success"} onClick={() => setCheckoutOpen(true)}>
                <DoorOpen className="w-4 h-4 mr-2" />
                Checkout và Thanh toán
              </Button>
            )}

            {/* Post-checkout payment button */}
            {bookingDetail?.status === "CheckedOut" &&
              financialSummary.totalBalance > 0 && (
                <Button
                  variant="default"
                  onClick={() => setCheckoutOpen(true)}
                  className="bg-yellow-600 hover:bg-yellow-700 text-white"
                >
                  <CreditCard className="w-4 h-4 mr-2" />
                  Thu tiền sau checkout
                  <Badge variant="destructive" className="ml-2">
                    {formatMoney(financialSummary.totalBalance).vndFormatted}
                  </Badge>
                </Button>
              )}

            {/* View invoices for settled checkouts */}
            {bookingDetail?.status === "CheckedOut" &&
              financialSummary.totalBalance === 0 && (
                <Button variant="outline" onClick={() => setCheckoutOpen(true)}>
                  <Receipt className="w-4 h-4 mr-2" />
                  Xem hóa đơn
                </Button>
              )}

            <Button
              type="button"
              variant="outline"
              onClick={() => form.reset()}
              disabled={isUpdating}
            >
              Đặt lại
            </Button>
            <Button
              onClick={form.handleSubmit(handleSubmit)}
              disabled={isUpdating}
            >
              {isUpdating ? "Đang lưu..." : "Lưu thay đổi"}
            </Button>
          </div>
        </div>

        {/* Checkout Sheet */}
        <CheckoutSheet
          open={checkoutOpen}
          onOpenChange={setCheckoutOpen}
          bookingId={bookingDetail?.id || ""}
          bookingCode={bookingDetail?.bookingCode || ""}
          bookingDetail={bookingDetail}
        />

        {/* Confirm Payment Dialog */}
      </Form>
    </div>
  );
}
