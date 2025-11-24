import { zodResolver } from "@hookform/resolvers/zod";
import { differenceInDays, parseISO } from "date-fns";
import {
  CreditCard,
  DoorOpen,
  FileWarning,
  Loader2,
  Receipt,
  RotateCcw,
  Save,
  AlertTriangle,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useFieldArray, useForm } from "react-hook-form";
import { toast } from "sonner";
import { AnimatePresence, motion } from "framer-motion"; // Optional: Cho hiệu ứng mượt mà, nếu không có thì dùng CSS conditional

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
import { Skeleton } from "~/components/ui/skeleton";
import { Textarea } from "~/components/ui/textarea";
import { useOTAInfo } from "~/features/create-booking-wizard/container/create-booking-query.hooks";
import { formatMoney, toYMD, useCalculateNights } from "~/lib/utils";
import { BookingSchema } from "~/services/api/booking/booking.schema";
import type { StaffUpdateBookingRequestDto } from "~/services/api/booking/dto";
import { useUpdateBooking } from "../bookings/container/booking-mutation.hooks";
import { useBookingDetail } from "../bookings/container/booking-query.hooks";
import type { Route } from "./+types/booking-detail";

// Components
import AddCompletedChargesDialog from "./components/operations/add-completed-charges-dialog";
import BookingRoomsBar from "./components/booking-rooms-bar";
import CheckoutSheet from "./components/checkout/checkout-sheet";
import CustomerInfoBar from "./components/customer-info-bar";
import PendingChargesSection from "./components/pending-charges-section";
import RefundButton from "./components/refunds/refund-button";
import RefundHistory from "./components/refunds/refund-history";
import StayDetailBar from "./components/stay-detail-bar";

// Hooks
import { useAddCompletedCharges } from "./container/use-booking-checkout.hooks";
import { useBookingFinancialStatus } from "./container/use-booking-financial-status.hooks";
import { useBookingUpdatePermissions } from "./container/use-booking-update-permissions.hooks";
import { Alert, AlertTitle } from "~/components/ui/alert";

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

  // --- Queries ---
  const {
    data: bookingDetail,
    isPending,
    error,
  } = useBookingDetail({
    bookingCode,
    enabled: !!bookingCode,
  });

  // --- Local State ---
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [completedChargesDialogOpen, setCompletedChargesDialogOpen] =
    useState(false);
  const [noteModalOpen, setNoteModalOpen] = useState(false);
  const [isAddingCompletedCharges, setIsAddingCompletedCharges] =
    useState(false);

  // --- Derived State & Hooks ---
  const permissions = useBookingUpdatePermissions(bookingDetail);
  const financialSummary = useBookingFinancialStatus(bookingDetail?.invoices);
  const { data: OTAList } = useOTAInfo({ selection: true });

  // --- Mutations ---
  const { mutate: updateBooking, isPending: isUpdating } = useUpdateBooking(
    bookingDetail?.id || ""
  );

  const { mutate: addCompletedCharges } = useAddCompletedCharges(
    bookingDetail?.id || ""
  );

  // --- Form Setup ---
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

  // UX: Track Dirty State
  const { isDirty } = form.formState;

  // --- Effects ---
  useEffect(() => {
    if (bookingDetail && bookingDetail.id) {
      // Reset form with new data.
      // Important: This clears the 'isDirty' state after a successful fetch or save.
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
  }, [bookingDetail]); // form is stable, safe to include

  // --- Handlers ---
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
      // ... (Giữ nguyên logic mapping payload) ...
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

  const handleAddCompletedCharges = (data: any) => {
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

  const nights = useCalculateNights({
    checkinDate: bookingDetail
      ? parseISO(bookingDetail.checkinDate)
      : undefined,
    checkoutDate: bookingDetail
      ? parseISO(bookingDetail.checkoutDate)
      : undefined,
  });
  // --- Render Loading/Error ---
  if (isPending) return <BookingDetailSkeleton />;
  if (error || !bookingDetail) return <BookingDetailError />;

  return (
    <div className="flex flex-col h-full bg-muted/10 relative">
      {/* Scrollable Content Area */}
      <div className="flex-1 overflow-y-auto p-4">
        <Form {...form}>
          <div className="grid gap-4 container mx-auto">
            <CustomerInfoBar
              bookingDetail={bookingDetail}
              form={form}
              OTAList={OTAList || []}
              permissions={permissions}
            />

            <div className="flex  items-start gap-4">
              <BookingRoomsBar
                bookingDetail={bookingDetail}
                form={form}
                roomsFieldArray={roomsFieldArray}
                permissions={permissions}
              />

              <div className="flex-1  space-y-4">
                <StayDetailBar
                  bookingCode={bookingCode}
                  bookingDetail={bookingDetail}
                  form={form}
                  permissions={permissions}
                  nights={nights}
                  setNoteModalOpen={setNoteModalOpen}
                  handleSubmit={handleSubmit} // Keep for internal save if needed
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

            {/* Dialogs */}
            <AddCompletedChargesDialog
              open={completedChargesDialogOpen}
              onOpenChange={setCompletedChargesDialogOpen}
              onConfirm={handleAddCompletedCharges}
              isAdding={isAddingCompletedCharges}
            />

            <Dialog open={noteModalOpen} onOpenChange={setNoteModalOpen}>
              <DialogContent className="max-w-xl">
                {/* ... (Note Dialog Content Giữ nguyên) ... */}
                <DialogHeader>
                  <DialogTitle>Ghi chú đặt phòng</DialogTitle>
                  <DialogDescription>
                    Ghi chú nội bộ (khách không thấy)
                  </DialogDescription>
                </DialogHeader>
                <FormField
                  control={form.control}
                  name="note"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <Textarea
                          {...field}
                          disabled={!permissions.canDoSoftUpdate}
                          rows={6}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="flex justify-end gap-2 mt-4">
                  <Button
                    variant="outline"
                    onClick={() => setNoteModalOpen(false)}
                  >
                    Đóng
                  </Button>
                  {/* Note: Saving here just closes dialog, user must click Main Save */}
                  <Button onClick={() => setNoteModalOpen(false)}>Xong</Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </Form>
      </div>

      {/* SMART ACTION BAR 
        Fixed at bottom, changes based on IsDirty state 
      */}
      <BookingActionsBar
        isDirty={isDirty}
        isUpdating={isUpdating}
        bookingDetail={bookingDetail}
        financialSummary={financialSummary}
        onReset={() => form.reset()}
        onSave={form.handleSubmit(handleSubmit)}
        onCheckout={() => setCheckoutOpen(true)}
      />

      <CheckoutSheet
        open={checkoutOpen}
        onOpenChange={setCheckoutOpen}
        bookingId={bookingDetail?.id || ""}
        bookingCode={bookingDetail?.bookingCode || ""}
        bookingDetail={bookingDetail}
      />
    </div>
  );
}

// --- Sub-components for Cleaner File ---

function BookingActionsBar({
  isDirty,
  isUpdating,
  bookingDetail,
  financialSummary,
  onReset,
  onSave,
  onCheckout,
}: {
  isDirty: boolean;
  isUpdating: boolean;
  bookingDetail: any;
  financialSummary: any;
  onReset: () => void;
  onSave: () => void;
  onCheckout: () => void;
}) {
  return (
    <div className="sticky bottom-0 left-0 right-0 border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 p-4 shadow-lg z-10 transition-all duration-200">
      <div className="max-w-[1600px] mx-auto flex items-center justify-between gap-4">
        {/* Left: Always Visible Operations (Refund) */}
        <div className="flex items-center gap-2">
          <RefundButton
            bookingId={bookingDetail?.id || ""}
            bookingNumber={bookingDetail?.bookingCode || ""}
            bookingStatus={bookingDetail?.status || ""}
            totalPaidAmount={bookingDetail.paidAmount}
            variant="outline"
            className="border-destructive/50 text-destructive hover:bg-destructive/10"
          />
        </div>

        {/* Right: Contextual Actions */}
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
            </div>
          ) : (
            // === MODE 2: OPERATIONAL (CLEAN STATE) ===
            // Shows Checkout/Operations.
            <div className="flex items-center gap-3 animate-in slide-in-from-bottom-2 fade-in">
              {/* Checkout Button Logic */}
              {(bookingDetail?.status === "InHouse" ||
                bookingDetail?.status === "CheckedIn") && (
                <Button
                  variant="success"
                  onClick={onCheckout}
                  className="shadow-sm"
                >
                  <DoorOpen className="w-4 h-4 mr-2" />
                  Checkout & Thanh toán
                </Button>
              )}

              {/* Post-Checkout Collection */}
              {bookingDetail?.status === "CheckedOut" &&
                financialSummary.totalBalance > 0 && (
                  <Button
                    onClick={onCheckout}
                    className="bg-orange-600 hover:bg-orange-700 text-white shadow-sm"
                  >
                    <CreditCard className="w-4 h-4 mr-2" />
                    Thu nợ sau checkout
                    <Badge
                      variant="secondary"
                      className="ml-2 bg-white/20 text-white hover:bg-white/30 border-0"
                    >
                      {formatMoney(financialSummary.totalBalance).vndFormatted}
                    </Badge>
                  </Button>
                )}

              {/* View Invoices */}
              {bookingDetail?.status === "CheckedOut" &&
                financialSummary.totalBalance === 0 && (
                  <Button variant="outline" onClick={onCheckout}>
                    <Receipt className="w-4 h-4 mr-2" />
                    Xem hóa đơn
                  </Button>
                )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Skeleton & Error Components (Keep them simple)
function BookingDetailSkeleton() {
  return (
    <div className="flex gap-4 p-6">
      <div className="w-full space-y-4">
        <div className="flex gap-4">
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-24 w-1/3" />
        </div>
        <div className="flex gap-4">
          <Skeleton className="h-96 w-2/3" />
          <Skeleton className="h-96 w-1/3" />
        </div>
      </div>
    </div>
  );
}

function BookingDetailError() {
  return (
    <div className="h-full flex items-center justify-center">
      <Empty>
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <FileWarning />
          </EmptyMedia>
          <EmptyTitle>Lỗi</EmptyTitle>
          <EmptyDescription>
            Không thể tải thông tin đặt phòng.
          </EmptyDescription>
        </EmptyHeader>
      </Empty>
    </div>
  );
}
