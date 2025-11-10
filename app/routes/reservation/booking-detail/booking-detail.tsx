import { zodResolver } from "@hookform/resolvers/zod";
import { differenceInDays, format, parseISO } from "date-fns";
import {
  Baby,
  Ellipsis,
  Mail,
  Pen,
  Phone,
  Plus,
  User,
  Wallet,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useFieldArray, useForm } from "react-hook-form";
import { toast } from "sonner";
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
import { useOTAInfo } from "~/features/create-booking-wizard/container/create-booking-query.hooks";
import { formatMoney, toYMD } from "~/lib/utils";
import { BookingSchema } from "~/services/api/booking/booking.schema";
import { BOOKING_STATUSES } from "~/services/api/booking/booking.types";
import type { StaffUpdateBookingRequestDto } from "~/services/api/booking/dto";
import CreateOrderDialog from "../bookings/components/create-order-dialog";
import { useUpdateBooking } from "../bookings/container/booking-mutation.hooks";
import { useBookingDetail } from "../bookings/container/booking-query.hooks";
import type { Route } from "./+types/booking-detail";
import AddMenuItemDialog from "./components/add-menu-item-dialog";
import { AddRoomModal } from "./components/add-room-modal";
import BookingPosOrders from "./components/booking-pos-orders";
import BookingServiceOrders from "./components/booking-service-orders";
import PaymentInvoiceModal from "./components/payment-invoice-modal";
import { useBookingOrders } from "./container/use-booking-orders.hooks";
import { useBookingUpdatePermissions } from "./container/use-booking-update-permissions.hooks";
import ExistingRoomItemWrapper from "./fragments/existing-room-item-wrapper";
import NewRoomItemWrapper from "./fragments/new-room-item-wrapper";

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
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  const [createOrderDialogOpen, setCreateOrderDialogOpen] = useState(false);
  const [completedChargesDialogOpen, setCompletedChargesDialogOpen] =
    useState(false);
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const [noteModalOpen, setNoteModalOpen] = useState(false);
  const [addRoomModalOpen, setAddRoomModalOpen] = useState(false);
  const [expandedRooms, setExpandedRooms] = useState<Set<string>>(new Set());

  // Booking update permissions
  const permissions = useBookingUpdatePermissions(bookingDetail);

  const { mutate: updateBooking, isPending: isUpdating } = useUpdateBooking(
    bookingDetail?.id || ""
  );

  const {
    isCreatingOrder,
    isLoadingOrder,
    createBookingOrder,
    createRoomOrder,
    addMenuItem,
    removeItem,
    isAddingItem,
    addCompletedCharges,
    isAddingCompletedCharges,
  } = useBookingOrders({
    bookingId: bookingDetail?.id || "",
    ordersData: bookingDetail ? bookingDetail.posOrders : [],
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
      breakfastDates: [],
      totalAmount: 0,
      paidAmount: 0,
      paymentMethod: undefined,
      invoiceStatus: undefined,
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
        checkinDate: bookingDetail.checkinDate,
        checkoutDate: bookingDetail.checkoutDate,
        adultsAmount: bookingDetail.adults,
        childrenAmount: bookingDetail.children || 0,
        note: bookingDetail.note || "",
        // Load OTA info from API if source is OTA
        otaBookingCode: bookingDetail.source === "OTA" ? "" : "",
        otaInformationId: bookingDetail.source === "OTA" ? "" : "",
        customerId: bookingDetail.customer.id,
        totalAmount: bookingDetail.totalAmount || 0,
        paidAmount: bookingDetail.paidAmount || 0,
        paymentMethod: bookingDetail.paymentMethod || undefined,
        invoiceStatus: bookingDetail.invoiceStatus || undefined,
        // Don't include rooms array - handled separately via room operations
        rooms: [],
      });
    }
  }, [bookingDetail, form]);
  const checkinDate = form.watch("checkinDate");
  const checkoutDate = form.watch("checkoutDate");
  const handleSubmit = (data: StaffUpdateBookingRequestDto) => {
    // Check if attempting heavy updates
    const hasHeavyUpdates =
      data.checkinDate !== bookingDetail?.checkinDate ||
      data.checkoutDate !== bookingDetail?.checkoutDate ||
      (data.rooms && data.rooms.length > 0);

    if (hasHeavyUpdates && !permissions.canDoHeavyUpdate) {
      toast.error(
        permissions.blockReason || "Không thể cập nhật cấu trúc booking này"
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
    };

    updateBooking(payload, {});
  };

  const handleAddRoom = (roomId: string, roomTypeId: string) => {
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

  const handleAddMenuItem = (
    menuItemId: string,
    quantity: number,
    unitPrice: number
  ) => {
    if (selectedOrderId) {
      addMenuItem(selectedOrderId, menuItemId, quantity, unitPrice);
    }
  };

  const handleAddCompletedCharges = (menuItemId: string, quantity: number) => {
    const posItems = [{ menuItemId, quantity }];
    addCompletedCharges(posItems, selectedRoomId);
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
    <div className="flex flex-col h-full p-4 ">
      <Form {...form}>
        <div className="space-y-4">
          <div className="flex-1 flex">
            <aside className="w-80 flex-shrink-0  flex flex-col">
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
                      disabled={!permissions.canAddRooms}
                    >
                      <Plus className="h-4 w-4 mr-1" />
                      Thêm
                    </Button>
                  </div>
                  {!permissions.canAddRooms && (
                    <p className="text-xs text-destructive mt-2">
                      {permissions.blockReason}
                    </p>
                  )}
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
                          const fromDate = form.watch(
                            `rooms.${index}.fromDate`
                          );
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
                <CardContent className="flex justify-around items-start gap-6 flex-wrap">
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
                  {form.watch("otaInformationId") && (
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
                              <Input
                                {...field}
                                className="w-full bg-secondary"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  )}
                  {/* Breakfast Dates Picker */}
                  {/* {!!form.watch("breakfastDates") && (
                    <FormField
                      control={form.control}
                      name="breakfastDates"
                      render={({ field }) => {
                        const checkinDate = form.watch("checkinDate");
                        const checkoutDate = form.watch("checkoutDate");
                        const breakfastDates = field.value || [];
                        return (
                          <FormItem className="flex flex-col">
                            <FormLabel className="text-sm uppercase text-card-foreground">
                              Ngày có bữa sáng
                            </FormLabel>
                            <FormControl>
                              <Popover>
                                <PopoverTrigger asChild>
                                  <Button
                                    variant="outline"
                                    className={cn(
                                      "w-full justify-start text-left font-normal",
                                      field.value?.length === 0 &&
                                        "text-muted-foreground"
                                    )}
                                  >
                                    <CalendarIcon className="mr-2 h-4 w-4" />
                                    {breakfastDates.length > 0
                                      ? `Đã chọn ${breakfastDates.length} ngày`
                                      : "Chọn ngày có bữa sáng"}
                                  </Button>
                                </PopoverTrigger>
                                <PopoverContent
                                  className="w-auto p-0"
                                  align="start"
                                >
                                  <Calendar
                                    mode="multiple"
                                    selected={breakfastDates}
                                    onSelect={(dates) =>
                                      onSelectDates(dates || [])
                                    }
                                    disabled={(date) =>
                                      date <= checkinDate || date > checkoutDate
                                    }
                                    locale={vi}
                                  />
                                </PopoverContent>
                              </Popover>
                            </FormControl>
                            <FormDescription>
                              Chọn các ngày khách có sử dụng bữa sáng
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        );
                      }}
                    />
                  )} */}

                  <div className="flex flex-col gap-2">
                    <Label className="text-sm uppercase text-card-foreground">
                      Thanh toán & Hóa đơn
                    </Label>
                    <Button
                      type="button"
                      variant="outline"
                      className="w-full justify-start"
                      onClick={() => setPaymentModalOpen(true)}
                    >
                      <Wallet className="mr-2 h-4 w-4" />
                      <span className="truncate line-clamp-1 w-40">
                        {form.watch("totalAmount")
                          ? `${formatMoney(form.watch("paidAmount") || 0).vndFormatted} / ${formatMoney(form.watch("totalAmount") || 0).vndFormatted}`
                          : "Cập nhật thanh toán"}
                      </span>
                    </Button>
                    <p className="text-xs text-muted-foreground">
                      Nhấn để cập nhật thông tin thanh toán
                    </p>
                  </div>
                  {/* Note Modal Button */}
                </CardContent>
              </Card>
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
                    {selectedRoomId && (
                      <div>
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => setSelectedRoomId("")}
                        >
                          Xem đơn đặt phòng
                        </Button>
                      </div>
                    )}
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
                              <DatePicker
                                {...field}
                                disabled={!permissions.canEditDates}
                              />
                            </FormControl>
                            {!permissions.canEditDates && (
                              <FormDescription className="text-destructive text-xs">
                                {permissions.blockReason}
                              </FormDescription>
                            )}
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
                              <DatePicker
                                {...field}
                                disabled={!permissions.canEditDates}
                              />
                            </FormControl>
                            {!permissions.canEditDates && (
                              <FormDescription className="text-destructive text-xs">
                                {permissions.blockReason}
                              </FormDescription>
                            )}
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

                {/* Save Button */}
              </form>

              <AddRoomModal
                open={addRoomModalOpen}
                onOpenChange={setAddRoomModalOpen}
                onAddRoom={handleAddRoom}
                bookingDetail={bookingDetail}
              />

              <AddMenuItemDialog
                open={orderDialogOpen}
                onOpenChange={setOrderDialogOpen}
                onConfirm={handleAddMenuItem}
                isAdding={isAddingItem}
              />

              <AddMenuItemDialog
                open={completedChargesDialogOpen}
                onOpenChange={setCompletedChargesDialogOpen}
                onConfirm={handleAddCompletedCharges}
                isAdding={isAddingCompletedCharges}
              />

              <CreateOrderDialog
                open={createOrderDialogOpen}
                onOpenChange={setCreateOrderDialogOpen}
                onCreateBookingOrder={createBookingOrder}
                onCreateRoomOrder={createRoomOrder}
                isCreating={isCreatingOrder}
                hasMultipleRooms={(bookingDetail?.rooms.length || 0) > 1}
              />

              <PaymentInvoiceModal
                open={paymentModalOpen}
                onOpenChange={setPaymentModalOpen}
                form={form}
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
          <div className="grid md:grid-cols-2 grid-cols-1 gap-4 pb-4">
            <BookingPosOrders
              isCreatingOrder={isCreatingOrder}
              ordersList={bookingDetail.posOrders}
              isLoadingOrder={isLoadingOrder}
              onOpenCreateDialog={() => setCreateOrderDialogOpen(true)}
              onAddMenuItem={(orderId) => {
                setSelectedOrderId(orderId);
                setOrderDialogOpen(true);
              }}
              onRemoveItem={removeItem}
              onAddCompletedCharges={() => setCompletedChargesDialogOpen(true)}
            />
            <BookingServiceOrders />
          </div>
        </div>
        <Separator />
        <div className="flex justify-end gap-3 sticky bottom-0 bg-background pb-4 pt-4 ">
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
      </Form>
    </div>
  );
}
