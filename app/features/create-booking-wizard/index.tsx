import { zodResolver } from "@hookform/resolvers/zod";
import { addDays, format } from "date-fns";
import { Loader2, RotateCcw } from "lucide-react";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { Link, useNavigate } from "react-router"; // Chỉnh lại import tùy router bạn dùng
import { toast } from "sonner";

import { Button } from "~/components/ui/button";
import { Form } from "~/components/ui/form";
import { DASHBOARD } from "~/lib/fe-url";
import { useCreateBookingStore } from "~/store/create-booking.store";
import { useServiceOrderStore } from "~/store/service-order.store";

// --- IMPORTS CÁC WIDGET MỚI ---

// --- IMPORTS API & UTILS ---
import useCreateBookingMutation from "./container/create-booking-mutation.hooks";

import z from "zod";
import { BookingSchema } from "~/services/api/booking/booking.schema";
import { CustomerInfoSection } from "./components/customer-info-step";
import { BookingCartWidget } from "./components/review-payment-step";
import { RoomSelectionSection } from "./components/room-selection-step";
import { ServiceQuickAddWidget } from "./components/services-breakfast-step";
import { BOOKING_SOURCES } from "~/services/api/booking/booking.types";
import { onError } from "~/lib/utils";

const BookingMasterSchema = z
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
      // Validate service order scheduledDates (Logic gốc của bạn)
      if (!data.serviceOrder?.services) return true;

      const checkinDate = new Date(data.checkinDate);
      const checkoutDate = new Date(data.checkoutDate);

      // Reset hours để so sánh chính xác
      checkinDate.setHours(0, 0, 0, 0);
      checkoutDate.setHours(23, 59, 59, 999);

      return data.serviceOrder.services.every((service) => {
        if (!service.scheduledDate) return true;
        const scheduledDate = new Date(service.scheduledDate);
        return scheduledDate >= checkinDate && scheduledDate <= checkoutDate;
      });
    },
    {
      message: "Ngày thực hiện dịch vụ phải nằm trong khoảng thời gian lưu trú",
      path: ["serviceOrder"],
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
  const { services: serviceOrderServices, clear: clearServices } =
    useServiceOrderStore();

  const { mutateAsync: createBooking, isPending: isSubmitting } =
    useCreateBookingMutation();

  // Khởi tạo default dates
  const defaultCheckin = storeData.checkinDate
    ? new Date(storeData.checkinDate)
    : new Date();
  const defaultCheckout = storeData.checkoutDate
    ? new Date(storeData.checkoutDate)
    : addDays(new Date(), 1);

  // 1. SETUP MASTER FORM
  const form = useForm({
    resolver: zodResolver(BookingMasterSchema),
    defaultValues: {
      // UI Fields
      bookingType: storeData.bookingType || "Direct",
      dateRange: {
        from: defaultCheckin,
        to: defaultCheckout,
      },

      // API Fields (Mapped from Store)
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
    },
    mode: "all",
  });

  const dateRange = form.watch("dateRange");
  useEffect(() => {
    if (dateRange?.from) {
      form.setValue("checkinDate", dateRange.from, { shouldValidate: true });
    }
    if (dateRange?.to) {
      form.setValue("checkoutDate", dateRange.to, { shouldValidate: true });
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
    if (confirm("Bạn có chắc muốn xóa form?")) {
      resetStore();
      clearServices();
      form.reset();
      toast.success("Đã làm mới");
    }
  };

  const onSubmit = async (data: z.infer<typeof BookingMasterSchema>) => {
    const isRoomBlock = data.bookingType === "RoomBlock";

    if (!isRoomBlock && serviceOrderServices.length > 0) {
      const checkin = new Date(data.checkinDate);
      const checkout = new Date(data.checkoutDate);
      const hasInvalidDate = serviceOrderServices.some((s) => {
        if (!s.scheduledDate) return false;
        const d = new Date(s.scheduledDate);
        return d < checkin || d > checkout;
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
              services: serviceOrderServices.map((s) => ({
                itemType: s.itemType,
                itemId: s.itemId,
                quantity: s.quantity,
                scheduledDate: s.scheduledDate, // Schema String date
                note: s.note,
              })),
            },

        overridePrice: isRoomBlock ? 0 : data.overridePrice || null,
        roomPayment: isRoomBlock ? undefined : data.roomPayment,
        internalNote: isRoomBlock
          ? `ROOM BLOCK - ${data.guestFullName}`
          : data.internalNote,

        source: isRoomBlock
          ? BOOKING_SOURCES.find((bs) => bs.key === "RoomBlock")?.value
          : data.bookingType === "OTA"
            ? BOOKING_SOURCES.find((bs) => bs.key === "OTA")?.value
            : data.source ||
              BOOKING_SOURCES.find((bs) => bs.key === "DirectStaff")?.value,
      };

      await createBooking(finalPayload as any, {
        onSuccess: () => {
          toast.success("Tạo đặt phòng thành công!");
          resetStore();
          clearServices();
          navigate(DASHBOARD.bookings.list);
        },
        onError: (err) => {
          console.error(err);
          toast.error("Thất bại. Vui lòng kiểm tra lại thông tin.");
        },
      });
    } catch (e) {
      console.error("Payload error", e);
      toast.error("Lỗi xử lý dữ liệu.");
    }
  };

  return (
    <div className="h-screen flex flex-col bg-gray-50 overflow-hidden">
      <header className="h-14 shrink-0 bg-white border-b px-4 flex items-center justify-between z-30 shadow-sm">
        <div className="flex items-center gap-3">
          <h1 className="font-bold text-lg text-gray-900">Tạo Đặt Phòng</h1>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" onClick={handleReset}>
            <RotateCcw className="mr-2 h-3.5 w-3.5" /> Làm mới
          </Button>
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
          {/* LEFT: Guest Info */}
          <aside className="col-span-12 md:col-span-3 bg-white border-r overflow-y-auto">
            <div className="p-5">
              <CustomerInfoSection form={form} />
            </div>
          </aside>

          {/* CENTER: Room Selection */}
          <main className="col-span-12 md:col-span-6 flex flex-col overflow-hidden bg-gray-50/50">
            <div className="flex-1 overflow-hidden flex flex-col p-4 gap-4">
              <RoomSelectionSection form={form} />
            </div>
            <div className="shrink-0 p-4 bg-white border-t z-20">
              <ServiceQuickAddWidget form={form} />
            </div>
          </main>

          {/* RIGHT: Cart & Payment */}
          <aside className="col-span-12 md:col-span-3 bg-white border-l flex flex-col shadow-xl z-40 h-full">
            <div className="flex-1 overflow-hidden flex flex-col">
              <BookingCartWidget form={form} />
            </div>
            <div className="p-4 border-t bg-gray-50">
              <Button
                type="submit"
                size="lg"
                className="w-full h-12 font-bold shadow-md"
                disabled={isSubmitting}
              >
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
