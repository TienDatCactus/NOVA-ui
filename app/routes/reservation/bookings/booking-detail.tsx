import { zodResolver } from "@hookform/resolvers/zod";
import { differenceInDays, format, parseISO } from "date-fns";
import { vi } from "date-fns/locale";
import {
  Calendar,
  ChevronDown,
  ChevronUp,
  Clock,
  Mail,
  MapPin,
  Minus,
  Phone,
  Plus,
  Receipt,
  StickyNote,
  User,
  Users,
  X,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useFieldArray, useForm } from "react-hook-form";
import { SelectGroup } from "@radix-ui/react-select";
import { toast } from "sonner";
import type { Route } from "./+types/booking-detail";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog";
import { DatePicker } from "~/components/ui/date-picker";
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
import { Label } from "~/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { Separator } from "~/components/ui/separator";
import { Skeleton } from "~/components/ui/skeleton";
import { Textarea } from "~/components/ui/textarea";
import AddServiceDialog from "~/features/order-dialog";
import { useServiceOrderStore } from "~/store/service-order.store";
import { cn, handleLimitInput, toYMD } from "~/lib/utils";
import {
  useAvailableRoomsInternal,
  useRoomDetail,
} from "~/routes/rooms/container/rooms/query.hooks";
import { BookingSchema } from "~/services/api/booking/booking.schema";
import type {
  BookingDetailResponseDto,
  StaffUpdateBookingRequestDto,
} from "~/services/api/booking/dto";
import { OrderSchema } from "~/services/api/order/order.schema";
import { PAYMENT_STATUSES } from "~/services/types/payment.types";
import {
  BOOKING_SOURCES,
  BOOKING_STATUSES,
} from "~/services/types/booking.types";
import { useBookingDetail } from "./container/booking-query.hooks";
import { useUpdateBooking } from "./container/booking-mutation.hooks";
import { useOTAInfo } from "../new-booking/container/create-booking-query.hooks";
import type z from "zod";

const { StaffUpdateBookingRequestSchema } = BookingSchema;
const { ServiceOrderItemSchema } = OrderSchema;
type ServiceOrderItemDto = z.infer<typeof ServiceOrderItemSchema>;

function RoomItem({
  room,
  isSelected,
  isExpanded,
  onSelect,
  onToggleExpand,
}: {
  room: {
    roomId: string;
    roomName: string;
    roomTypeName: string;
    fromDate: string;
    toDate: string;
  };
  isSelected: boolean;
  isExpanded: boolean;
  onSelect: () => void;
  onToggleExpand: () => void;
}) {
  const { data: roomDetail, isPending } = useRoomDetail({
    id: room.roomId,
    params: {},
  });

  return (
    <Card
      className={cn(
        "transition-colors cursor-pointer",
        isSelected && "border-primary bg-primary/5"
      )}
    >
      <div onClick={onSelect} className="p-3 flex items-center justify-between">
        <div className="flex-1">
          <div className="font-medium text-sm">{room.roomName}</div>
          <div className="text-xs text-muted-foreground mt-1">
            {room.roomTypeName}
          </div>
          <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
            <Clock className="h-3 w-3" />
            {format(parseISO(room.fromDate), "dd/MM")} →{" "}
            {format(parseISO(room.toDate), "dd/MM")}
          </div>
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          onClick={(e) => {
            e.stopPropagation();
            onToggleExpand();
          }}
        >
          {isExpanded ? (
            <ChevronUp className="h-4 w-4" />
          ) : (
            <ChevronDown className="h-4 w-4" />
          )}
        </Button>
      </div>
      {isExpanded && (
        <CardContent className="pt-0 pb-3">
          {isPending ? (
            <Skeleton className="h-20 w-full" />
          ) : roomDetail ? (
            <div className="space-y-2 text-xs">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <span className="text-muted-foreground">Trạng thái:</span>
                  <div className="font-medium">
                    {roomDetail.status || "N/A"}
                  </div>
                </div>
                <div>
                  <span className="text-muted-foreground">Hạng phòng:</span>
                  <div className="font-medium">
                    {roomDetail.roomTypeName || "N/A"}
                  </div>
                </div>
              </div>
              {/* {roomDetail.description && (
                <div>
                  <span className="text-muted-foreground">Mô tả:</span>
                  <div className="font-medium">{roomDetail.description}</div>
                </div>
              )} */}
            </div>
          ) : (
            <p className="text-xs text-muted-foreground">
              Không thể tải thông tin phòng
            </p>
          )}
        </CardContent>
      )}
    </Card>
  );
}

// NewRoomItem Component for new room modifications
function NewRoomItem({
  form,
  index,
  availableRoomTypes,
  onRemove,
}: {
  form: any;
  index: number;
  availableRoomTypes: any;
  onRemove: () => void;
}) {
  return (
    <Card className="p-3 border-dashed">
      <div className="space-y-3">
        <FormField
          control={form.control}
          name={`rooms.${index}.roomId`}
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-xs">Phòng</FormLabel>
              <FormControl>
                <Select {...field} onValueChange={field.onChange}>
                  <SelectTrigger className="h-8">
                    <SelectValue placeholder="Chọn phòng" />
                  </SelectTrigger>
                  <SelectContent>
                    {!!availableRoomTypes &&
                      availableRoomTypes.length > 0 &&
                      availableRoomTypes?.map((r: any) => (
                        <SelectGroup key={r.roomTypeId}>
                          {r.availableRooms.map((room: any) => (
                            <SelectItem key={room.roomId} value={room.roomId}>
                              {room.roomName}
                            </SelectItem>
                          ))}
                        </SelectGroup>
                      ))}
                  </SelectContent>
                </Select>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-2 gap-2">
          <FormField
            control={form.control}
            name={`rooms.${index}.fromDate`}
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-xs">Từ ngày</FormLabel>
                <FormControl>
                  <DatePicker {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name={`rooms.${index}.toDate`}
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-xs">Đến ngày</FormLabel>
                <FormControl>
                  <DatePicker {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="flex items-center justify-between">
          <FormField
            control={form.control}
            name={`rooms.${index}.remove`}
            render={({ field }) => (
              <FormItem className="flex items-center gap-2">
                <FormControl>
                  <input
                    type="checkbox"
                    checked={field.value || false}
                    onChange={(e) => field.onChange(e.target.checked)}
                    className="h-4 w-4"
                  />
                </FormControl>
                <FormLabel className="text-xs cursor-pointer">
                  Đánh dấu xóa
                </FormLabel>
              </FormItem>
            )}
          />
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-6 w-6"
            onClick={onRemove}
          >
            <X className="h-3 w-3" />
          </Button>
        </div>
      </div>
    </Card>
  );
}

export const loader = async ({ request, params }: Route.LoaderArgs) => {
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

  const [selectedRoomId, setSelectedRoomId] = useState<string | null>(null);
  const [orderDialogOpen, setOrderDialogOpen] = useState(false);
  const [noteModalOpen, setNoteModalOpen] = useState(false);
  const [expandedRooms, setExpandedRooms] = useState<Set<string>>(new Set());
  const serviceOrderItems = useServiceOrderStore((s) => s.services);
  const setOrderCtx = useServiceOrderStore((s) => s.setContext);
  const addManyToOrder = useServiceOrderStore((s) => s.addMany);
  const removeOrderItem = useServiceOrderStore((s) => s.removeById);

  const { mutate: updateBooking, isPending: isUpdating } = useUpdateBooking(
    bookingDetail?.id || ""
  );

  const { data: availableRoomTypes } = useAvailableRoomsInternal({
    CheckInDate: bookingDetail?.checkinDate
      ? format(parseISO(bookingDetail.checkinDate), "yyyy-MM-dd")
      : "",
    CheckOutDate: bookingDetail?.checkoutDate
      ? format(parseISO(bookingDetail.checkoutDate), "yyyy-MM-dd")
      : "",
    Guests: (bookingDetail?.adults || 1) + (bookingDetail?.children || 0),
  });

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
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "rooms",
  });

  const { data: OTAList } = useOTAInfo({
    selection: true,
  });

  useEffect(() => {
    if (bookingDetail && bookingDetail.id) {
      form.reset({
        checkinDate: parseISO(bookingDetail.checkinDate),
        checkoutDate: parseISO(bookingDetail.checkoutDate),
        adultsAmount: bookingDetail.adults,
        childrenAmount: bookingDetail.children || 0,
        note: bookingDetail.note || "",
        otaBookingCode: "",
        otaInformationId: "",
        customerId: bookingDetail.customer.id,
        rooms: bookingDetail.rooms.map((r) => ({
          bookingRoomId: bookingDetail.id,
          roomId: r.roomId,
          fromDate: r.fromDate,
          toDate: r.toDate,
          remove: false,
        })),
      });

      // Set first room as selected by default
      if (bookingDetail.rooms.length > 0) {
        setSelectedRoomId(bookingDetail.rooms[0].roomId);
      }
      setOrderCtx({
        bookingId: bookingDetail.id,
        roomId: bookingDetail.rooms[0]?.roomId,
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bookingDetail, setOrderCtx]);

  const handleSubmit = (data: StaffUpdateBookingRequestDto) => {
    const payload = {
      ...data,
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
    };

    // TODO: Handle serviceOrderItems separately when API is ready
    // For now, we'll add them to the booking update payload if the schema supports it
    // In the future, this might be a separate API call: addItemsToBooking(bookingId, items)

    updateBooking(payload as any, {
      onSuccess: () => {
        toast.success("Cập nhật đặt phòng thành công");
      },
    });
  };

  const handleConfirmServiceOrder = () => {
    const itemCount = serviceOrderItems.length;
    toast.success(`Đã xác nhận ${itemCount} mục trong đơn hàng`);
    // Items are already in the store, just show success message
    // TODO: When API is ready, call the submit order API here
  };

  const nights = useMemo(() => {
    const checkin = form.watch("checkinDate");
    const checkout = form.watch("checkoutDate");
    if (!checkin || !checkout) return 0;
    const checkinDate =
      checkin instanceof Date ? checkin : parseISO(checkin.toString());
    const checkoutDate =
      checkout instanceof Date ? checkout : parseISO(checkout.toString());
    return differenceInDays(checkoutDate, checkinDate);
  }, [form.watch("checkinDate"), form.watch("checkoutDate")]);

  const toggleRoomExpand = (roomId: string) => {
    setExpandedRooms((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(roomId)) {
        newSet.delete(roomId);
      } else {
        newSet.add(roomId);
      }
      return newSet;
    });
  };

  // Get OTA info if source is OTA
  const otaInfo = useMemo(() => {
    if (bookingDetail?.source === "OTA" && OTAList && OTAList.length > 0) {
      const otaInformationId = form.watch("otaInformationId");
      if (otaInformationId) {
        return OTAList.find((ota) => ota.id === otaInformationId) || OTAList[0];
      }
      return OTAList[0];
    }
    return null;
  }, [bookingDetail?.source, OTAList, form.watch("otaInformationId")]);

  // Separate services and menu items
  const services = useMemo(
    () => serviceOrderItems.filter((item) => item.itemType === "ServiceItem"),
    [serviceOrderItems]
  );

  const menuItems = useMemo(
    () => serviceOrderItems.filter((item) => item.itemType === "MenuItem"),
    [serviceOrderItems]
  );

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
      <div className="flex items-center justify-center h-96">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-destructive">Lỗi</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              Không thể tải thông tin đặt phòng. Vui lòng thử lại.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Top Command Bar - Customer Info & Basic Info */}
      <div className="border-b bg-card px-6 py-4">
        <div className="flex items-center justify-between gap-6 flex-wrap">
          {/* Customer Info */}
          <div className="flex items-center gap-4">
            <User className="h-5 w-5 text-primary" />
            <div>
              <div className="font-semibold">
                {bookingDetail.customer.fullName}
              </div>
              <div className="flex items-center gap-2 mt-1 text-sm text-muted-foreground">
                {bookingDetail.customer.email && (
                  <a
                    href={`mailto:${bookingDetail.customer.email}`}
                    className="hover:underline flex items-center gap-1"
                  >
                    <Mail className="h-3 w-3" />
                    {bookingDetail.customer.email}
                  </a>
                )}
                {bookingDetail.customer.phoneNumber && (
                  <a
                    href={`tel:${bookingDetail.customer.phoneNumber}`}
                    className="hover:underline flex items-center gap-1"
                  >
                    <Phone className="h-3 w-3" />
                    {bookingDetail.customer.phoneNumber}
                  </a>
                )}
              </div>
            </div>
          </div>

          <Separator orientation="vertical" className="h-8" />

          {/* Amounts with Icons */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <User className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm">
                {form.watch("adultsAmount") || bookingDetail.adults} người lớn
              </span>
            </div>
            {(form.watch("childrenAmount")! > 0 ||
              (bookingDetail.children && bookingDetail.children > 0)) && (
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">
                  {form.watch("childrenAmount") || bookingDetail.children || 0}{" "}
                  trẻ em
                </span>
              </div>
            )}
          </div>

          <Separator orientation="vertical" className="h-8" />

          {/* Source */}
          <div className="flex items-center gap-2">
            <MapPin className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm">
              {
                BOOKING_SOURCES.find((s) => s.key === bookingDetail.source)
                  ?.label
              }
            </span>
            {otaInfo && (
              <>
                <span className="text-muted-foreground">•</span>
                <span className="text-sm">{otaInfo.name}</span>
                {form.watch("otaBookingCode") && (
                  <>
                    <span className="text-muted-foreground">•</span>
                    <span className="text-sm font-mono">
                      {form.watch("otaBookingCode")}
                    </span>
                  </>
                )}
              </>
            )}
          </div>

          <Separator orientation="vertical" className="h-8" />

          {/* Note Modal Button */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => setNoteModalOpen(true)}
            className="flex items-center gap-2"
          >
            <StickyNote className="h-4 w-4" />
            Ghi chú
            {bookingDetail.note && (
              <Badge variant="secondary" className="ml-1">
                Có
              </Badge>
            )}
          </Button>
        </div>
      </div>

      <Form {...form}>
        <div className="flex gap-4 flex-1 overflow-hidden p-6">
          {/* Left Sidebar - Rooms List with Expandable Details */}
          <aside className="w-80 flex-shrink-0 flex flex-col">
            <Card className="flex-1 flex flex-col">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm">Danh sách phòng</CardTitle>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      availableRoomTypes && availableRoomTypes.length > 0
                        ? append({
                            roomId: "",
                            fromDate: format(new Date(), "yyyy-MM-dd"),
                            toDate: format(new Date(), "yyyy-MM-dd"),
                            remove: false,
                          })
                        : toast.error("Không có phòng trống để thêm")
                    }
                  >
                    <Plus className="h-4 w-4 mr-1" />
                    Thêm
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="flex-1 overflow-y-auto space-y-2">
                {/* Existing Rooms */}
                {bookingDetail.rooms.map((room) => (
                  <RoomItem
                    key={room.roomId}
                    room={room}
                    isSelected={selectedRoomId === room.roomId}
                    isExpanded={expandedRooms.has(room.roomId)}
                    onSelect={() => setSelectedRoomId(room.roomId)}
                    onToggleExpand={() => toggleRoomExpand(room.roomId)}
                  />
                ))}

                {/* New Room Modifications */}
                {fields.length > 0 && (
                  <>
                    <Separator className="my-3" />
                    <div className="text-xs font-semibold text-muted-foreground mb-2">
                      Phòng mới
                    </div>
                    {fields.map((field, index) => (
                      <NewRoomItem
                        key={field.id}
                        form={form}
                        index={index}
                        availableRoomTypes={availableRoomTypes}
                        onRemove={() => remove(index)}
                      />
                    ))}
                  </>
                )}
              </CardContent>
            </Card>
          </aside>

          {/* Main Content Area */}
          <main className="flex-1 space-y-6 overflow-y-auto">
            {/* Booking Update Form */}
            <form
              onSubmit={form.handleSubmit(handleSubmit)}
              className="space-y-6"
            >
              <Card>
                <CardHeader>
                  <CardTitle>Thông tin đặt phòng</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Room Dropdown */}
                  {bookingDetail.rooms.length > 1 && (
                    <FormField
                      control={form.control}
                      name="customerId"
                      render={() => (
                        <FormItem>
                          <FormLabel>Phòng</FormLabel>
                          <Select
                            value={
                              selectedRoomId ||
                              bookingDetail.rooms[0]?.roomId ||
                              ""
                            }
                            onValueChange={(value) => setSelectedRoomId(value)}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Chọn phòng để xem đơn hàng" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {bookingDetail.rooms.map((room) => (
                                <SelectItem
                                  key={room.roomId}
                                  value={room.roomId}
                                >
                                  {room.roomName} - {room.roomTypeName}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormDescription>
                            Chọn phòng để xem các đơn hàng dịch vụ/thực đơn
                          </FormDescription>
                        </FormItem>
                      )}
                    />
                  )}

                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="checkinDate"
                      render={({ field }) => (
                        <FormItem className="flex flex-col">
                          <FormLabel>Ngày nhận phòng</FormLabel>
                          <FormControl>
                            <DatePicker {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="checkoutDate"
                      render={({ field }) => (
                        <FormItem className="flex flex-col">
                          <FormLabel>Ngày trả phòng</FormLabel>
                          <FormControl>
                            <DatePicker {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  {/* Days Calculation */}
                  <Card className="p-4 bg-muted/30">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Số đêm:</span>
                      <span className="text-lg font-bold text-primary">
                        {nights} đêm
                      </span>
                    </div>
                  </Card>
                </CardContent>
              </Card>

              {/* Services & Menu Items Section */}
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>Dịch vụ & Thực đơn</CardTitle>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setOrderDialogOpen(true)}
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Thêm dịch vụ/Menu
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Services Section */}
                  <div>
                    <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
                      <Receipt className="h-4 w-4" />
                      Dịch vụ ({services.length})
                    </h3>
                    {services.length === 0 ? (
                      <p className="text-sm text-muted-foreground">
                        Chưa có dịch vụ nào được thêm
                      </p>
                    ) : (
                      <div className="space-y-2">
                        {services.map((item, index) => (
                          <Card key={index} className="p-3">
                            <div className="flex items-center justify-between">
                              <div>
                                <p className="font-medium">
                                  Service ID: {item.itemId}
                                </p>
                                <p className="text-sm text-muted-foreground">
                                  Số lượng: {item.quantity} • Ngày:{" "}
                                  {item.scheduledDate}
                                </p>
                                {item.note && (
                                  <p className="text-xs text-muted-foreground mt-1">
                                    {item.note}
                                  </p>
                                )}
                              </div>
                              <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                onClick={() => removeOrderItem(item.itemId)}
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            </div>
                          </Card>
                        ))}
                      </div>
                    )}
                  </div>

                  <Separator />

                  {/* Menu Items Section */}
                  <div>
                    <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
                      <Receipt className="h-4 w-4" />
                      Thực đơn ({menuItems.length})
                    </h3>
                    {menuItems.length === 0 ? (
                      <p className="text-sm text-muted-foreground">
                        Chưa có món nào được thêm
                      </p>
                    ) : (
                      <div className="space-y-2">
                        {menuItems.map((item, index) => (
                          <Card key={index} className="p-3">
                            <div className="flex items-center justify-between">
                              <div>
                                <p className="font-medium">
                                  Menu ID: {item.itemId}
                                </p>
                                <p className="text-sm text-muted-foreground">
                                  Số lượng: {item.quantity} • Ngày:{" "}
                                  {item.scheduledDate}
                                </p>
                                {item.note && (
                                  <p className="text-xs text-muted-foreground mt-1">
                                    {item.note}
                                  </p>
                                )}
                              </div>
                              <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                onClick={() => removeOrderItem(item.itemId)}
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            </div>
                          </Card>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* TODO: Future implementation
                   * Currently services/menu items are added at booking level.
                   * In the future, we may need to support:
                   * 1. Booking-level items: Apply to entire booking
                   * 2. Room-level items: Apply to specific room (selectedRoomId)
                   *
                   * Consider:
                   * - Separate API endpoints: addItemsToBooking vs addItemsToRoom
                   * - UI toggle: "Add to booking" vs "Add to room"
                   * - Display separation: Show items grouped by booking vs room
                   */}
                </CardContent>
              </Card>

              {/* Save Button */}
              <div className="flex justify-end gap-3 sticky bottom-0 bg-background pb-4 pt-4 border-t">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => form.reset()}
                  disabled={isUpdating}
                >
                  Đặt lại
                </Button>
                <Button type="submit" disabled={isUpdating}>
                  {isUpdating ? "Đang lưu..." : "Lưu thay đổi"}
                </Button>
              </div>
            </form>
          </main>

          {/* Order Dialog */}
          <AddServiceDialog
            open={orderDialogOpen}
            onOpenChange={setOrderDialogOpen}
            onConfirm={handleConfirmServiceOrder}
            bookingId={bookingDetail.id}
            customerName={bookingDetail.customer.fullName}
          />

          {/* Note Modal */}
          <Dialog open={noteModalOpen} onOpenChange={setNoteModalOpen}>
            <DialogContent>
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
                      // Note is already saved in form state, just close modal
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
      </Form>
    </div>
  );
}
