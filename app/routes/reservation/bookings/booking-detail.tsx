import { zodResolver } from "@hookform/resolvers/zod";
import { differenceInDays, format, parseISO } from "date-fns";
import {
  Baby,
  Ellipsis,
  Globe,
  Mail,
  Pen,
  Phone,
  Plus,
  Receipt,
  User,
  X,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useFieldArray, useForm } from "react-hook-form";
import { toast } from "sonner";
import type z from "zod";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { DatePicker } from "~/components/ui/date-picker";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
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
import { Counter } from "~/components/ui/shadcn-io/button-group/advanced/counter";
import { Skeleton } from "~/components/ui/skeleton";
import { Textarea } from "~/components/ui/textarea";
import { toYMD } from "~/lib/utils";
import { useAvailableRoomsInternal } from "~/routes/rooms/container/rooms/query.hooks";
import { BookingSchema } from "~/services/api/booking/booking.schema";
import type { StaffUpdateBookingRequestDto } from "~/services/api/booking/dto";
import { BOOKING_STATUSES } from "~/services/types/booking.types";
import { useOTAInfo } from "../new-booking/container/create-booking-query.hooks";
import type { Route } from "./+types/booking-detail";
import { AddRoomModal } from "./components/add-room-modal";
import AddMenuItemDialog from "./components/add-menu-item.dialog";
import BookingOrders from "./components/booking-orders";
import NewRoomItemWrapper from "./fragments/new-room-item-wrapper";
import ExistingRoomItemWrapper from "./fragments/existing-room-item-wrapper";
import { useUpdateBooking } from "./container/booking-mutation.hooks";
import { useBookingDetail } from "./container/booking-query.hooks";
import { useBookingOrders } from "./container/use-booking-orders.hooks";

const { StaffUpdateBookingRequestSchema } = BookingSchema;

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
  const [addRoomModalOpen, setAddRoomModalOpen] = useState(false);
  const [expandedRooms, setExpandedRooms] = useState<Set<string>>(new Set());

  const { mutate: updateBooking, isPending: isUpdating } = useUpdateBooking(
    bookingDetail?.id || ""
  );

  // Booking orders hook (separate from booking update)
  const {
    hasOrder,
    isCreatingOrder,
    orderDetail,
    isLoadingOrder,
    createOrder,
    addMenuItem,
    removeItem,
  } = useBookingOrders({
    bookingId: bookingDetail?.id,
    bookingRoomId: bookingDetail?.rooms[0]?.roomId,
  });

  const { data: availableRoomTypes, isPending: isLoadingAvailableRooms } =
    useAvailableRoomsInternal({
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
    }
  }, [bookingDetail, form]);

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

    updateBooking(payload as any, {
      onSuccess: () => {
        toast.success("Cập nhật đặt phòng thành công");
      },
    });
  };

  const handleAddRoom = (roomId: string, roomTypeId: string) => {
    const checkinDate = form.watch("checkinDate");
    const checkoutDate = form.watch("checkoutDate");

    append({
      roomId,
      fromDate:
        checkinDate instanceof Date
          ? format(checkinDate, "yyyy-MM-dd")
          : checkinDate?.toString() || format(new Date(), "yyyy-MM-dd"),
      toDate:
        checkoutDate instanceof Date
          ? format(checkoutDate, "yyyy-MM-dd")
          : checkoutDate?.toString() || format(new Date(), "yyyy-MM-dd"),
      remove: false,
    });

    toast.success("Đã thêm phòng mới");
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
            <p className="text-card-foreground">
              Không thể tải thông tin đặt phòng. Vui lòng thử lại.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <Form {...form}>
        <div className="flex-1 flex overflow-hidden">
          <aside className="w-80 flex-shrink-0 flex flex-col">
            <Card className="flex-1 flex flex-col  border-accent-foreground">
              <CardHeader className="text-card-foreground">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base font-medium uppercase">
                    Danh sách phòng
                  </CardTitle>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setAddRoomModalOpen(true)}
                  >
                    <Plus className="h-4 w-4 mr-1" />
                    Thêm
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="flex-1 overflow-y-auto space-y-2">
                {/* Existing Rooms */}
                {bookingDetail.rooms.map((room) => (
                  <ExistingRoomItemWrapper
                    key={room.roomId}
                    room={room}
                    isSelected={selectedRoomId === room.roomId}
                    isExpanded={expandedRooms.has(room.roomId)}
                    onSelect={() => setSelectedRoomId(room.roomId)}
                    onToggleExpand={() => toggleRoomExpand(room.roomId)}
                  />
                ))}

                {/* New Rooms Being Added */}
                {fields.length > 0 && (
                  <>
                    <Separator className="my-3" />
                    <div className="text-xs font-semibold text-card-foreground mb-2">
                      Phòng đang được thêm ({fields.length})
                    </div>
                    <div className="space-y-2">
                      {fields.map((field, index) => {
                        const roomId = form.watch(`rooms.${index}.roomId`);
                        const fromDate = form.watch(`rooms.${index}.fromDate`);
                        const toDate = form.watch(`rooms.${index}.toDate`);

                        if (!roomId || !fromDate || !toDate) return null;

                        return (
                          <NewRoomItemWrapper
                            key={field.id}
                            roomId={roomId}
                            fromDate={fromDate}
                            toDate={toDate}
                            onRemove={() => remove(index)}
                          />
                        );
                      })}
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </aside>
          <div className="grid flex-1 gap-4 px-6">
            <Card className="border-b w-full h-fit shadow-sm">
              <CardContent className="flex justify-evenly items-center gap-6 md:flex-wrap">
                <div className="grid gap-2">
                  <h1 className="uppercase font-medium text-card-foreground text-sm">
                    Khách hàng
                  </h1>
                  <p className="text-sm">{bookingDetail.customer.fullName}</p>
                </div>
                {(bookingDetail.customer.email ||
                  bookingDetail.customer.phoneNumber) && (
                  <div className="grid gap-2">
                    <h1 className="font-medium uppercase text-card-foreground text-sm">
                      Phương thức liên lạc
                    </h1>
                    <div className="flex flex-col gap-1 text-sm">
                      {bookingDetail.customer.email && (
                        <a
                          href={`mailto:${bookingDetail.customer.email}`}
                          className="hover:underline flex items-center gap-2 "
                        >
                          <Mail className="h-3 w-3" />
                          {bookingDetail.customer.email}
                        </a>
                      )}
                      {bookingDetail.customer.phoneNumber && (
                        <a
                          href={`tel:${bookingDetail.customer.phoneNumber}`}
                          className="hover:underline flex items-center gap-2"
                        >
                          <Phone className="h-3 w-3" />
                          {bookingDetail.customer.phoneNumber}
                        </a>
                      )}
                    </div>
                  </div>
                )}

                <FormField
                  control={form.control}
                  name="adultsAmount"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm uppercase text-card-foreground">
                        Số lượng người lớn
                      </FormLabel>
                      <FormControl className="text-sm">
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4" />
                          <Counter className="w-30 " {...field} />
                        </div>
                      </FormControl>

                      <FormMessage />
                    </FormItem>
                  )}
                />

                {form.watch("childrenAmount")! > 0 && (
                  <FormField
                    control={form.control}
                    name="childrenAmount"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm uppercase text-card-foreground">
                          Số lượng trẻ em
                        </FormLabel>
                        <FormControl>
                          <div className="flex items-center gap-2">
                            <Baby className="h-4 w-4" />
                            <Counter className="w-30" {...field} />
                          </div>
                        </FormControl>

                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}

                {/* Source */}
                {!form.watch("otaInformationId") && (
                  <div className="flex items-center gap-6">
                    <FormField
                      control={form.control}
                      name="otaInformationId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-sm text-card-foreground uppercase">
                            Nền tảng OTA
                          </FormLabel>
                          <FormControl>
                            <div className="flex items-center gap-2">
                              <Select
                                value={field.value}
                                onValueChange={field.onChange}
                              >
                                <FormControl>
                                  <SelectTrigger className="w-full bg-secondary">
                                    <SelectValue placeholder="Chọn nền tảng OTA" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  {OTAList?.map((ota) => (
                                    <SelectItem key={ota.id} value={ota.id}>
                                      {ota.name}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="otaBookingCode"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-sm text-card-foreground uppercase">
                            Mã đặt phòng OTA
                          </FormLabel>
                          <FormControl>
                            <Input {...field} className="w-full bg-secondary" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                )}

                {/* Note Modal Button */}
              </CardContent>
            </Card>
            {/* Main Content Area */}
            <main className="flex-1 space-y-6 overflow-y-auto">
              {/* Booking Update Form */}
              <form
                onSubmit={form.handleSubmit(handleSubmit)}
                className="space-y-6"
              >
                <Card className="shadow-sm">
                  <CardHeader>
                    <div className="flex justify-between items-center">
                      <CardTitle className="flex gap-1">
                        <h1>
                          {selectedRoomId
                            ? `Phòng: ${
                                bookingDetail.rooms.find(
                                  (room) => room.roomId == selectedRoomId
                                )?.roomName
                              }`
                            : `Thông tin đặt phòng : ${bookingCode}`}
                        </h1>
                        <sup>
                          <Badge
                            variant={
                              BOOKING_STATUSES.find(
                                (status) => status.value == bookingDetail.status
                              )?.variant
                            }
                          >
                            {
                              BOOKING_STATUSES.find(
                                (status) => status.value == bookingDetail.status
                              )?.label
                            }
                          </Badge>
                        </sup>
                      </CardTitle>
                      <div className="flex items-center gap-2">
                        <Button
                          onClick={() => setNoteModalOpen(true)}
                          variant="outline"
                        >
                          <Pen />
                        </Button>
                        <Button variant={"success"}>Nhận phòng</Button>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size={"icon"}>
                              <Ellipsis />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent>
                            <DropdownMenuLabel>My Account</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem>Profile</DropdownMenuItem>
                            <DropdownMenuItem>Billing</DropdownMenuItem>
                            <DropdownMenuItem>Team</DropdownMenuItem>
                            <DropdownMenuItem>Subscription</DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center gap-6">
                      <div className="grid gap-2">
                        <Label>Phòng</Label>
                        <Select
                          value={selectedRoomId ?? ""}
                          onValueChange={setSelectedRoomId}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Chọn phòng" />
                          </SelectTrigger>
                          <SelectContent>
                            {bookingDetail.rooms.map((room) => (
                              <SelectItem key={room.roomId} value={room.roomId}>
                                {room.roomName}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

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
                      <div className="grid gap-2">
                        <span className="text-sm font-medium">Số đêm:</span>
                        <span className="text-lg font-bold text-primary">
                          {nights} đêm
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* POS Orders Section */}
                <BookingOrders
                  hasOrder={hasOrder}
                  isCreatingOrder={isCreatingOrder}
                  orderDetail={orderDetail}
                  isLoadingOrder={isLoadingOrder}
                  onCreateOrder={createOrder}
                  onAddMenuItem={() => setOrderDialogOpen(true)}
                  onRemoveItem={removeItem}
                />

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

            <AddRoomModal
              open={addRoomModalOpen}
              onOpenChange={setAddRoomModalOpen}
              availableRooms={availableRoomTypes || []}
              isLoading={isLoadingAvailableRooms}
              onAddRoom={handleAddRoom}
            />

            {/* Add Menu Item Dialog */}
            <AddMenuItemDialog
              open={orderDialogOpen}
              onOpenChange={setOrderDialogOpen}
              onConfirm={addMenuItem}
              isAdding={false}
            />

            {/* Note Modal */}
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
                            placeholder="Nhập ghi chú về đặt phòng..."
                            rows={6}
                          />
                        </FormControl>
                        <FormDescription>
                          Ghi chú nội bộ về đặt phòng này (khách hàng không
                          thấy)
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
        </div>
      </Form>
    </div>
  );
}
