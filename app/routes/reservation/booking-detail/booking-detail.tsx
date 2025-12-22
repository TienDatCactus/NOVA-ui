import { zodResolver } from "@hookform/resolvers/zod";
import { parseISO } from "date-fns";
import { Check, FileWarning, NotebookPen, RotateCcw } from "lucide-react";
import { useEffect, useState } from "react";
import { useFieldArray, useForm } from "react-hook-form";
import { toast } from "sonner";
import {
  AuthLoader,
  hasAnyRole,
  Permission,
  RouteModule,
  UserRole,
} from "~/lib/auth/auth.loader";
import type { Route } from "./+types/booking-detail";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Chi Tiết Đặt Phòng - NOVA Hotel Management" },
    {
      name: "description",
      content: "Thông tin chi tiết đặt phòng và quản lý thanh toán",
    },
  ];
}

export const clientLoader = () =>
  AuthLoader.guard(RouteModule.Bookings, Permission.Read);

import { Button } from "~/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
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
  FormField,
  FormItem,
  FormMessage,
} from "~/components/ui/form";
import { Skeleton } from "~/components/ui/skeleton";
import { Textarea } from "~/components/ui/textarea";
import { useOTAInfo } from "~/features/create-booking-wizard/container/create-booking-query.hooks";
import { onError, toYMD, useCalculateNights } from "~/lib/utils";
import { BookingSchema } from "~/services/api/booking/booking.schema";
import type { StaffUpdateBookingRequestDto } from "~/services/api/booking/dto";
import { useUpdateBooking } from "../bookings/container/booking-mutation.hooks";
import { useBookingDetail } from "../bookings/container/booking-query.hooks";

// Components
import BookingRoomsBar from "./components/booking-rooms-bar";
import CustomerInfoBar from "./components/customer-info-bar";
import AddCompletedChargesDialog from "./components/operations/add-completed-charges-dialog";
import PendingChargesSection from "./components/pending-charges-section";
import RefundHistory from "./components/refunds/refund-history";
import StayDetailBar from "./components/stay-detail-bar";

import { useParams } from "react-router";
import { useBookingState } from "./container/use-booking-state.hooks";
import { BookingActionsBar } from "./fragments/booking-actions.bar";

const { StaffUpdateBookingRequestSchema } = BookingSchema;

export default function Component() {
  const { bookingCode } = useParams<{ bookingCode: string }>();

  if (!bookingCode) {
    return <BookingDetailError errorDetails="Mã booking không hợp lệ" />;
  }

  const {
    data: bookingDetail,
    isPending,
    error,
  } = useBookingDetail({
    bookingCode,
    enabled: !!bookingCode,
  });
  const [completedChargesDialogOpen, setCompletedChargesDialogOpen] =
    useState(false);
  const [noteModalOpen, setNoteModalOpen] = useState(false);

  const bookingState = useBookingState(bookingDetail);
  const { data: OTAList } = useOTAInfo({ selection: true });

  const { mutate: updateBooking, isPending: isUpdating } = useUpdateBooking(
    bookingDetail?.id || "",
    bookingCode
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
      totalAmount: 0,
    },
  });

  const roomsFieldArray = useFieldArray({
    control: form.control,
    name: "rooms",
  });

  const { isDirty } = form.formState;

  // Clear pending operations on mount to prevent auto-submission on refresh
  useEffect(() => {
    form.setValue("rooms", [], { shouldDirty: false });
  }, []);

  const handleSubmit = (data: StaffUpdateBookingRequestDto) => {
    const hasDatesChanged =
      data.checkinDate !== bookingDetail?.checkinDate ||
      data.checkoutDate !== bookingDetail?.checkoutDate;
    const hasRoomChanges = data.rooms && data.rooms.length > 0;

    if (hasDatesChanged && !bookingState.permissions.canEditDates) {
      toast.error(
        bookingState.permissions.dateChangeBlockReason ||
          "Không thể thay đổi ngày check-in/check-out"
      );
      return;
    }

    if (hasRoomChanges && !bookingState.permissions.canEditRooms) {
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
      totalAmount: data.totalAmount,
      rooms: data.rooms,
    };

    updateBooking(payload, {
      onSuccess: () => {
        form.setValue("rooms", [], { shouldDirty: false });
      },
    });
  };

  useEffect(() => {
    if (bookingDetail && bookingDetail.id) {
      form.reset(
        {
          checkinDate: bookingDetail.checkinDate,
          checkoutDate: bookingDetail.checkoutDate,
          adultsAmount: bookingDetail.adults,
          childrenAmount: bookingDetail.children || 0,
          note: bookingDetail.note || "",
          otaBookingCode: bookingDetail.source === "OTA" ? "" : "",
          otaInformationId: bookingDetail.source === "OTA" ? "" : "",
          customerId: bookingDetail.customer.id,
          totalAmount: bookingDetail.totalAmount || 0,

          rooms: [],
        },
        {
          keepDirty: false, // Don't preserve dirty state on data refresh
          keepValues: false,
        }
      );
    }
  }, [bookingDetail]);

  const nights = useCalculateNights({
    checkinDate: bookingDetail
      ? parseISO(bookingDetail.checkinDate)
      : undefined,
    checkoutDate: bookingDetail
      ? parseISO(bookingDetail.checkoutDate)
      : undefined,
  });
  if (isPending) return <BookingDetailSkeleton />;
  if (error || !bookingDetail) return <BookingDetailError />;

  return (
    <div className="flex flex-col h-full bg-muted/10 relative">
      <div className="flex-1 overflow-y-auto p-4">
        <Form {...form}>
          <div className="grid gap-4 container mx-auto">
            <div className="flex  items-start gap-2">
              <div className="grid gap-2">
                <BookingRoomsBar
                  bookingDetail={bookingDetail}
                  form={form}
                  roomsFieldArray={roomsFieldArray}
                  bookingState={bookingState}
                />{" "}
                <CustomerInfoBar
                  bookingDetail={bookingDetail}
                  form={form}
                  OTAList={OTAList || []}
                  bookingState={bookingState}
                />
                <RefundHistory bookingId={bookingDetail.id} />
              </div>

              <div className="flex-1  grid  gap-2">
                <StayDetailBar
                  bookingCode={bookingCode}
                  bookingDetail={bookingDetail}
                  form={form}
                  bookingState={bookingState}
                  nights={nights}
                  setNoteModalOpen={setNoteModalOpen}
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
              </div>
            </div>

            {/* Dialogs */}
            <AddCompletedChargesDialog
              open={completedChargesDialogOpen}
              onOpenChange={setCompletedChargesDialogOpen}
              booking={bookingDetail}
            />

            <Dialog open={noteModalOpen} onOpenChange={setNoteModalOpen}>
              <DialogContent className="sm:max-w-[500px] gap-0 p-0 overflow-hidden">
                <DialogHeader className="px-6 py-4 border-b bg-muted/10">
                  <div className="flex items-center gap-2">
                    <div className="p-2 bg-primary/10 rounded-md">
                      <NotebookPen className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <DialogTitle>Ghi chú đặt phòng</DialogTitle>
                      <DialogDescription className="mt-1">
                        Ghi chú nội bộ dành cho nhân viên (Khách sẽ không thấy)
                      </DialogDescription>
                    </div>
                  </div>
                </DialogHeader>

                {/* Body */}
                <div className="p-6">
                  <FormField
                    control={form.control}
                    name="note"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <Textarea
                            {...field}
                            disabled={!bookingState.permissions.canEdit}
                            placeholder="Nhập các lưu ý quan trọng về khách hàng hoặc đơn đặt phòng này..."
                            className="min-h-[200px] resize-none bg-muted/30 focus:bg-background transition-colors border-dashed focus:border-solid"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Footer */}
                <DialogFooter className="px-6 py-4 bg-muted/10 border-t">
                  <div className="flex w-full justify-between items-center">
                    {/* Nhắc nhở nhỏ bên trái (Optional) */}
                    <span className="text-[11px] text-muted-foreground italic">
                      * Đừng quên bấm "Lưu thay đổi" ở màn hình chính
                    </span>

                    <div className="flex gap-2">
                      <Button
                        variant="ghost"
                        onClick={() => setNoteModalOpen(false)}
                      >
                        Hủy
                      </Button>
                      <Button
                        onClick={() => setNoteModalOpen(false)}
                        className="bg-primary/90 hover:bg-primary"
                      >
                        <Check className="w-4 h-4 mr-2" />
                        Áp dụng
                      </Button>
                    </div>
                  </div>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </Form>
      </div>

      {hasAnyRole(AuthLoader.getUser(), [
        UserRole.HotelManager,
        UserRole.Receptionist,
      ]) && (
        <BookingActionsBar
          isDirty={isDirty}
          isUpdating={isUpdating}
          bookingDetail={bookingDetail}
          bookingState={bookingState}
          onReset={() => form.reset()}
          onSave={form.handleSubmit(handleSubmit, onError)}
        />
      )}
    </div>
  );
}

function BookingDetailSkeleton() {
  return (
    <div className="flex flex-col gap-6 p-4 md:p-6 lg:flex-row">
      {/* Main Content Area */}
      <div className="flex w-full flex-col space-y-6">
        {/* Top Summary / Stats Cards */}
        <div className="flex flex-col gap-4 sm:flex-row">
          <Skeleton className="h-28 w-full rounded-xl sm:w-2/3" />
          <Skeleton className="h-28 w-full rounded-xl sm:w-1/3" />
        </div>

        {/* Detail Sections */}
        <div className="flex flex-col gap-4 lg:flex-row">
          {/* Main Info (Customer, Booking Details) */}
          <Skeleton className="h-[500px] w-full rounded-xl lg:w-2/3" />

          {/* Sidebar Info (Payment, History, Notes) */}
          <Skeleton className="h-[500px] w-full rounded-xl lg:w-1/3" />
        </div>
      </div>
    </div>
  );
}

function BookingDetailError({
  onRetry,
  errorDetails,
}: {
  onRetry?: () => void;
  errorDetails?: string;
}) {
  return (
    <div className="flex h-full min-h-[400px] items-center justify-center p-6">
      <Empty>
        <EmptyHeader>
          <EmptyMedia
            variant="icon"
            className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-50 text-red-500"
          >
            <FileWarning className="h-8 w-8" />
          </EmptyMedia>
          <EmptyTitle className="text-xl font-semibold text-gray-900">
            Không thể tải thông tin
          </EmptyTitle>
          <EmptyDescription className="mt-2 text-center text-sm text-gray-500">
            {errorDetails ||
              "Đã có lỗi xảy ra trong quá trình lấy dữ liệu đặt phòng. Vui lòng kiểm tra kết nối mạng."}
          </EmptyDescription>
        </EmptyHeader>

        {/* Actionable UX: Nút thử lại */}
        {onRetry && (
          <div className="mt-6 flex justify-center">
            <Button variant="outline" onClick={onRetry} className="gap-2">
              <RotateCcw className="h-4 w-4" />
              Thử lại
            </Button>
          </div>
        )}
      </Empty>
    </div>
  );
}
