import { zodResolver } from "@hookform/resolvers/zod";
import { parseISO } from "date-fns";
import { Check, FileWarning, NotebookPen } from "lucide-react";
import { useEffect, useState } from "react";
import { useFieldArray, useForm } from "react-hook-form";
import { toast } from "sonner";

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
import type { Route } from "./+types/booking-detail";

// Components
import BookingRoomsBar from "./components/booking-rooms-bar";
import CustomerInfoBar from "./components/customer-info-bar";
import AddCompletedChargesDialog from "./components/operations/add-completed-charges-dialog";
import PendingChargesSection from "./components/pending-charges-section";
import RefundHistory from "./components/refunds/refund-history";
import StayDetailBar from "./components/stay-detail-bar";

import { Navigate, useSearchParams } from "react-router";
import { useBookingFinancialStatus } from "./container/use-booking-financial-status.hooks";
import { useBookingUpdatePermissions } from "./container/use-booking-update-permissions.hooks";
import { BookingActionsBar } from "./fragments/booking-actions.bar";

const { StaffUpdateBookingRequestSchema } = BookingSchema;
export default function Component({ loaderData }: Route.ComponentProps) {
  const [searchParams] = useSearchParams();
  const bookingCode = searchParams.get("bookingCode");

  if (!bookingCode) {
    return <Navigate to="/404" replace />;
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

  const permissions = useBookingUpdatePermissions(bookingDetail);
  const financialSummary = useBookingFinancialStatus(bookingDetail?.invoices);
  const { data: OTAList } = useOTAInfo({ selection: true });

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

  const { isDirty } = form.formState;
  const handleSubmit = (data: StaffUpdateBookingRequestDto) => {
    if (data.rooms && data.rooms.length > 0) {
      try {
        data.rooms.forEach((room, idx) => {
          console.log(`Room operation ${idx}:`, {
            action: room.action,
            actionType: typeof room.action,
            bookingRoomId: room.bookingRoomId,
            roomId: room.roomId,
            newRoomId: room.newRoomId,
            fromDate: room.fromDate,
            toDate: room.toDate,
          });

          const result =
            BookingSchema.UpdateBookingRoomRequestSchema.safeParse(room);

          if (!result.success) {
            console.error("Invalid room operation:", room, result.error);
            const errorMsg = result.error.issues
              .map((e) => `${e.path.join(".")}: ${e.message}`)
              .join(", ");
            throw new Error(
              `Phòng ${room.roomId || room.bookingRoomId || "unknown"} không hợp lệ: ${errorMsg}`
            );
          }
        });
      } catch (error) {
        toast.error(
          error instanceof Error ? error.message : "Dữ liệu phòng không hợp lệ"
        );
        return; // Stop submission
      }
    }

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

    updateBooking(payload, {
      onError: (error: any) => {
        if (error.response?.data?.errors) {
          const validationErrors = error.response.data.errors;
          Object.entries(validationErrors).forEach(([field, messages]) => {
            if (Array.isArray(messages)) {
              messages.forEach((msg) => {
                toast.error(`${field}: ${msg}`);
              });
            } else {
              toast.error(`${field}: ${messages}`);
            }
          });
        }

        if (error.errors) {
          console.error("Form validation errors:", error.errors);
          error.errors.forEach((err: any) => {
            const fieldPath = err.path?.join(".") || "unknown";
            toast.error(`${fieldPath}: ${err.message}`);
          });
        }

        if (!error.response?.data?.errors && !error.errors) {
          toast.error(error.message || "Cập nhật booking thất bại");
        }
      },
      onSuccess: () => {
        toast.success("Cập nhật booking thành công");
      },
    });
  };

  useEffect(() => {
    if (bookingDetail && bookingDetail.id) {
      const currentRooms = form.getValues("rooms") || [];
      const hasPendingRoomChanges = currentRooms.some(
        (room) =>
          room.action === "Add" ||
          room.action === "Remove" ||
          room.action === "Change"
      );

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
          breakfastDates:
            bookingDetail.breakfastDates?.map((date) => {
              return { date: date };
            }) || [],
          rooms: hasPendingRoomChanges ? currentRooms : [],
        },
        {
          keepDirty: true, // ✅ Preserve dirty state
          keepValues: false, // We're providing new values explicitly
        }
      );
    }
  }, [bookingDetail?.id]);

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

            {/* Dialogs */}
            <AddCompletedChargesDialog
              open={completedChargesDialogOpen}
              onOpenChange={setCompletedChargesDialogOpen}
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
                            disabled={!permissions.canDoSoftUpdate}
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

      <BookingActionsBar
        isDirty={isDirty}
        isUpdating={isUpdating}
        bookingDetail={bookingDetail}
        financialSummary={financialSummary}
        onReset={() => form.reset()}
        onSave={form.handleSubmit(handleSubmit, onError)}
      />
    </div>
  );
}

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
