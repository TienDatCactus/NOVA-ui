import { zodResolver } from "@hookform/resolvers/zod";
import { addDays, format } from "date-fns";
import {
  AlertTriangle,
  BookCopy,
  Eraser,
  Loader2,
  RotateCcw,
} from "lucide-react";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { Link, useNavigate } from "react-router"; // Chỉnh lại import tùy router bạn dùng
import { toast } from "sonner";

import { Button, buttonVariants } from "~/components/ui/button";
import { Form } from "~/components/ui/form";
import { DASHBOARD } from "~/lib/fe-url";
import { useCreateBookingStore } from "~/store/create-booking.store";

import useCreateBookingMutation from "./container/create-booking-mutation.hooks";

import z from "zod";
import { BookingSchema } from "~/services/api/booking/booking.schema";
import { CustomerInfoSection } from "./components/customer-info-step";
import { BookingCartWidget } from "./components/review-payment-step";
import { RoomSelectionSection } from "./components/room-selection-step";
import { BOOKING_SOURCES } from "~/services/api/booking/booking.types";
import { cn, onError } from "~/lib/utils";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "~/components/ui/alert-dialog";
import { isDirty } from "zod/v3";

export const BookingMasterSchema = z
  .object({
    ...BookingSchema.StaffCreateBookingSchema.shape,
    bookingType: z.enum(["Direct", "OTA", "RoomBlock"]),
    dateRange: z
      .object({
        from: z.date(),
        to: z.date(),
      })
      .optional(),
  })
  .refine(
    (data) => {
      const checkin = new Date(data.checkinDate);
      const checkout = new Date(data.checkoutDate);
      return checkout > checkin;
    },
    {
      message: "Ngày trả phòng phải sau ngày nhận phòng",
      path: ["checkoutDate"],
    }
  )
  .refine(
    (data) => {
      // Validate: Must select at least 1 room (except for RoomBlock which can have no specific rooms)
      if (data.bookingType === "RoomBlock") return true;
      return data.roomIds && data.roomIds.length > 0;
    },
    {
      message: "Phải chọn ít nhất 1 phòng",
      path: ["roomIds"],
    }
  );

//*------------------------------------------------------------
export default function CreateBookingPage() {
  const navigate = useNavigate();
  const {
    data: storeData,
    setData,
    reset: resetStore,
  } = useCreateBookingStore();

  const { mutateAsync: createBooking, isPending: isSubmitting } =
    useCreateBookingMutation();
  const defaultCheckin = storeData.checkinDate
    ? new Date(storeData.checkinDate)
    : new Date();
  const defaultCheckout = storeData.checkoutDate
    ? new Date(storeData.checkoutDate)
    : addDays(new Date(), 1);

  const form = useForm({
    resolver: zodResolver(BookingMasterSchema),
    defaultValues: {
      bookingType: storeData.bookingType || "Direct",
      dateRange: {
        from: defaultCheckin,
        to: defaultCheckout,
      },
      source: storeData.source,
      checkinDate: defaultCheckin,
      checkoutDate: defaultCheckout,

      guestFullName: storeData.guestFullName || "",
      guestPhone: storeData.guestPhone || "",
      guestEmail: storeData.guestEmail || "",

      adultsAmount: storeData.adultsAmount || 1,
      childrenAmount: storeData.childrenAmount || 0,
      roomIds: storeData.roomIds || [],

      isBreakfastAll: storeData.isBreakfastAll || false,
      breakfastDates: storeData.breakfastDates?.map((d) => new Date(d)) || [],
      specialRequest: storeData.specialRequest || "",
      overridePrice: storeData.overridePrice,
      internalNote: storeData.internalNote,

      roomPayment: storeData.roomPayment,
      otaInformationId: storeData.otaInformationId,
      otaBookingCode: storeData.otaBookingCode,
      serviceOrder: {
        services: storeData.serviceOrder?.services?.map((s) => ({
          ...s,
        })),
      },
    },
    mode: "all",
  });
  const dateRange = form.watch("dateRange");
  useEffect(() => {
    if (dateRange?.from) {
      const prevCheckin = new Date(form.getValues("checkinDate"));
      const newCheckin = dateRange.from;

      form.setValue("checkinDate", newCheckin, { shouldValidate: true });

      if (prevCheckin && prevCheckin.getTime() !== newCheckin.getTime()) {
        toast.info(
          "Ngày lưu trú đã thay đổi. Vui lòng chọn lại phòng và dịch vụ.",
          {
            duration: 4000,
          }
        );

        form.setValue("roomIds", []);
        form.setValue("breakfastDates", []);
        form.setValue("isBreakfastAll", false);
        form.setValue("serviceOrder.services", []);
      }
    }

    if (dateRange?.to) {
      const prevCheckout = new Date(form.getValues("checkoutDate"));
      const newCheckout = dateRange.to;

      form.setValue("checkoutDate", newCheckout, { shouldValidate: true });

      if (prevCheckout && prevCheckout.getTime() !== newCheckout.getTime()) {
        toast.info(
          "Ngày lưu trú đã thay đổi. Vui lòng chọn lại phòng và dịch vụ.",
          {
            duration: 4000,
          }
        );

        form.setValue("roomIds", []);
        form.setValue("breakfastDates", []);
        form.setValue("isBreakfastAll", false);
        form.setValue("serviceOrder.services", []);
      }
    }
  }, [dateRange?.from, dateRange?.to, form]);

  useEffect(() => {
    const subscription = form.watch((value) => {
      setData({
        ...value,
        checkinDate: value.dateRange?.from,
        checkoutDate: value.dateRange?.to,
      } as any);
    });
    return () => subscription.unsubscribe();
  }, [form.watch, setData]);

  const handleReset = () => {
    resetStore();
    form.reset();
    toast.success("Đã làm mới");
  };

  const onSubmit = async (data: z.infer<typeof BookingMasterSchema>) => {
    const isRoomBlock = data.bookingType === "RoomBlock";

    if (
      !isRoomBlock &&
      data.serviceOrder?.services &&
      data.serviceOrder.services.length > 0
    ) {
      const checkin = new Date(data.checkinDate);
      const checkout = new Date(data.checkoutDate);
      const hasInvalidDate = data.serviceOrder.services.some((s: any) => {
        if (!s.scheduledDate) return false;
        const d = new Date(s.scheduledDate);
        return d < checkin || d >= checkout;
      });

      if (hasInvalidDate) {
        toast.error("Có dịch vụ nằm ngoài ngày lưu trú.");
        return;
      }
    }

    try {
      const { bookingType, dateRange, ...apiPayload } = data;

      const finalPayload = {
        ...apiPayload,
        checkinDate: format(data.checkinDate, "yyyy-MM-dd"),
        checkoutDate: format(data.checkoutDate, "yyyy-MM-dd"),
        serviceOrder: isRoomBlock
          ? undefined
          : {
              services: (data.serviceOrder?.services || []).map((s) => ({
                itemType: s.itemType,
                itemId: s.itemId,
                quantity: s.quantity,
                scheduledDate: s.scheduledDate,
                note: s.note,
              })),
            },

        overridePrice: isRoomBlock ? 0 : data.overridePrice || null,
        roomPayment: isRoomBlock ? undefined : data.roomPayment,
        internalNote: isRoomBlock
          ? `ROOM BLOCK - ${data.guestFullName}`
          : data.internalNote || null,

        source:
          (isRoomBlock
            ? BOOKING_SOURCES.find((bs) => bs.key === "RoomBlock")?.key
            : data.bookingType === "OTA"
              ? BOOKING_SOURCES.find((bs) => bs.key === "OTA")?.key
              : data.source ||
                BOOKING_SOURCES.find((bs) => bs.key === "DirectStaff")?.key) ||
          "DirectStaff",
      };
      await createBooking(finalPayload, {
        onSuccess: () => {
          resetStore();
          navigate(DASHBOARD.bookings.list);
        },
      });
    } catch (e) {}
  };

  return (
    <div className="flex flex-col h-full overflow-y-auto">
      <header className="h-14 shrink-0 bg-background border-b px-4 flex items-center justify-between z-30 shadow-sm">
        <div className="flex items-center gap-3">
          <h1 className="font-bold text-lg text-accent-foreground">
            Tạo Đặt Phòng
          </h1>
        </div>
        <div className="flex items-center gap-2">
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                disabled={!isDirty}
                className="text-muted-foreground hover:text-foreground"
              >
                <RotateCcw className="mr-2 h-3.5 w-3.5" />
                Làm mới
              </Button>
            </AlertDialogTrigger>

            <AlertDialogContent className="max-w-[400px]">
              <AlertDialogHeader>
                <div className="flex items-center gap-3">
                  {/* Visual Indicator: Icon cảnh báo nổi bật */}
                  <div className="p-2 rounded-full bg-red-100 text-red-600 dark:bg-red-900/20">
                    <AlertTriangle className="w-5 h-5" />
                  </div>
                  <div className="space-y-1">
                    <AlertDialogTitle>Xác nhận làm mới?</AlertDialogTitle>
                    <AlertDialogDescription className="text-sm text-muted-foreground">
                      Hành động này sẽ xóa toàn bộ dữ liệu bạn vừa nhập.
                      <br />
                      <span className="font-medium text-foreground">
                        Bạn không thể hoàn tác hành động này.
                      </span>
                    </AlertDialogDescription>
                  </div>
                </div>
              </AlertDialogHeader>

              <AlertDialogFooter className="mt-2">
                <AlertDialogCancel className="h-9">Hủy</AlertDialogCancel>

                <AlertDialogAction
                  onClick={handleReset}
                  className={cn(
                    buttonVariants({ variant: "destructive", size: "default" }),
                    "h-9"
                  )}
                >
                  <Eraser className="w-4 h-4 mr-2" />
                  Xóa & Làm mới
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
          <Button variant="outline" size="sm" asChild>
            <Link to={DASHBOARD.bookings.list}>Thoát</Link>
          </Button>
        </div>
      </header>

      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit, onError)}
          className="flex-1 grid grid-cols-12 gap-0 overflow-hidden"
        >
          <aside className="col-span-12 md:col-span-3 bg-background border-r overflow-y-auto">
            <div className="p-5">
              <CustomerInfoSection form={form} />
            </div>
          </aside>

          <main className="col-span-12 md:col-span-5 flex flex-col overflow-hidden bg-muted">
            <div className="flex-1 overflow-hidden flex flex-col p-4 gap-4">
              <RoomSelectionSection form={form} />
            </div>
          </main>

          <aside className="col-span-12 md:col-span-4 bg-background border-l flex flex-col  h-full">
            <div className="flex-1 overflow-hidden flex flex-col">
              <BookingCartWidget form={form} />
            </div>
            <div className="p-4 border-t ">
              <Button
                type="submit"
                size="lg"
                className="w-full  font-bold shadow-md"
                disabled={isSubmitting}
              >
                <BookCopy />
                {isSubmitting ? (
                  <Loader2 className="animate-spin" />
                ) : (
                  "Xác nhận & Tạo đơn"
                )}
              </Button>
            </div>
          </aside>
        </form>
      </Form>
    </div>
  );
}
