import { useState, useMemo } from "react";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Badge } from "~/components/ui/badge";
import {
  ArrowLeft,
  RotateCcw,
  SearchIcon,
  SquareMenu,
  Plus,
} from "lucide-react";
import { toast } from "sonner";

import type { ServiceItem } from "~/services/api/services/dto";
import { Separator } from "~/components/ui/separator";
import { Skeleton } from "~/components/ui/skeleton";
import { useServiceTypes } from "../services/container/service-types/query.hooks";
import { useServices } from "../services/container/services/query.hooks";
import BookingSelectionDialog from "./components/booking-selection.dialog";
import CartSummary from "./components/cart-summary";
import CheckoutConfirmDialog from "./components/checkout-confirm.dialog";
import ServiceItemCard from "./components/service-pos/service-item-card";
import OrderConfirmationDialog from "./components/order-confirmation.dialog";
import ServedTimeDialog from "./components/scheduled-time.dialog";
import CustomServiceDialog from "./components/service-pos/custom-service.dialog";

import useServiceFilters from "../services/container/services/filter.hooks";
import { Link } from "react-router";
import { DASHBOARD } from "~/lib/fe-url";
import { useCreateServiceOrder } from "./container/service-order/mutation.hooks";
import type { Route } from "./+types/service-pos";
import { useServicePosOrderStore } from "~/store/service-pos-order.store";
import { Image as ImageIcon } from "lucide-react";
import { Textarea } from "~/components/ui/textarea";
import { Label } from "~/components/ui/label";
import { formatMoney } from "~/lib/utils";
import Image from "~/components/ui/image";
import { Counter } from "~/components/ui/shadcn-io/button-group/advanced/counter";
import { Card } from "~/components/ui/card";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "~/components/ui/empty";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";

export const clientLoader = async ({ request, params }: Route.LoaderArgs) => {
  return {};
};

export default function Component({
  loaderData,
  actionData,
}: Route.ComponentProps) {
  // Data fetching
  const { data: serviceTypes } = useServiceTypes();

  // Filters
  const { filterServices, filters, resetFilters, updateFilter } =
    useServiceFilters();
  const { data: services, isLoading: isLoadingServices } = useServices({
    typeCode: filters.typeCode,
  });

  const [selectedTypeId, setSelectedTypeId] = useState<string | null>(null);

  const filteredItems = useMemo(() => {
    if (!services) return [];
    let items = filterServices(services);
    return items;
  }, [services, filterServices]);

  const handleTypeSelect = (typeId: string | null) => {
    setSelectedTypeId(typeId);

    // Find the type code from the typeId
    const type = serviceTypes?.find((t) => t.id === typeId);
    const typeCode = type?.code || "";

    // Update the filter with the type code
    updateFilter("typeCode", typeCode);
  };

  const handleSearchChange = (value: string) => {
    updateFilter("searchText", value);
  };

  const handleReset = () => {
    resetFilters();
    setSelectedTypeId(null);
  };

  // Single service selection logic
  const {
    selectedService,
    subtotal,
    bookingId,
    bookingRoomId,
    scheduledAt,
    selectService,
    clearService,
    updateServiceQuantity,
    updateServiceNote,
    setBookingInfo,
    setScheduledAt,
  } = useServicePosOrderStore();

  const isEmpty = !selectedService;
  const itemCount = selectedService?.quantity || 0;

  const { mutate, isPending, isError } = useCreateServiceOrder();
  const [checkoutDialog, setCheckoutDialog] = useState(false);
  const [bookingDialog, setBookingDialog] = useState(false);
  const [scheduledTimeDialog, setScheduledTimeDialog] = useState(false);
  const [customServiceDialog, setCustomServiceDialog] = useState(false);
  const [selectedBookingInfo, setSelectedBookingInfo] = useState<{
    bookingId: string;
    bookingRoomId: string;
    bookingCode?: string;
  } | null>(null);
  const [confirmationDialog, setConfirmationDialog] = useState<{
    open: boolean;
    orderId?: string;
    customerType?: "In-House" | "Walk-In";
  }>({ open: false });

  // Handlers
  const handleSelectService = (item: ServiceItem) => {
    selectService({
      id: item.serviceItemId,
      serviceItemId: item.serviceItemId,
      code: item.code,
      name: item.name,
      unitPrice: item.basePrice,
      imageUrl: item.imageUrls?.[0],
    });
    toast.success(`Đã chọn ${item.name}`);
  };

  const handleAddCustomService = (service: {
    name: string;
    description?: string;
    unitPrice: number;
    quantity: number;
  }) => {
    const id = crypto.randomUUID();
    const customId = `CUSTOM-${id}`;
    selectService({
      id: customId,
      serviceItemId: undefined,
      code: "CUSTOM",
      name: service.name,
      unitPrice: service.unitPrice,
      quantity: service.quantity,
      customServiceName: service.name,
      customServiceDescription: service.description,
    });
    toast.success(`Đã chọn "${service.name}"`);
  };

  const handleConfirm = () => {
    if (isEmpty) return;
    setCheckoutDialog(true);
  };

  const handleCheckoutConfirm = () => {
    setCheckoutDialog(false);
    setBookingDialog(true);
  };

  const handleSelectBooking = (
    bookingId: string,
    bookingRoomId: string,
    bookingCode?: string
  ) => {
    setBookingInfo(bookingId, bookingRoomId || null);
    setSelectedBookingInfo({ bookingId, bookingRoomId, bookingCode });

    setBookingDialog(false);
    setScheduledTimeDialog(true);
  };

  const handleScheduledTimeConfirm = (scheduledTime: string) => {
    setScheduledAt(scheduledTime);
    console.log("Scheduled time confirmed:", scheduledTime);
    setScheduledTimeDialog(false);
    handleCreateOrder(scheduledTime);
  };

  const handleCreateOrder = (scheduledAtParam?: string) => {
    const finalScheduledAt = scheduledAtParam || scheduledAt;

    if (!selectedService || !bookingId || !finalScheduledAt) {
      toast.error("Thiếu thông tin đơn hàng");
      return;
    }

    try {
      mutate(
        {
          bookingId,
          bookingRoomId: bookingRoomId || undefined,
          serviceItemId: selectedService.serviceItemId || "",
          customServiceName: selectedService.customServiceName,
          customServiceDescription: selectedService.customServiceDescription,
          scheduledAt: finalScheduledAt,
          quantity: selectedService.quantity,
          unitPrice: selectedService.unitPrice,
          note: selectedService.note || undefined,
          assignedToStaffId: undefined,
        },
        {
          onSuccess: () => {
            toast.success("Tạo đơn dịch vụ thành công!");
            // Capture customer type before clearing
            const wasBooking = !!bookingId;
            setSelectedBookingInfo(null);
            setBookingInfo(null, null);
            setScheduledAt("");
            setConfirmationDialog({
              open: true,
              customerType: wasBooking ? "In-House" : "Walk-In",
            });
          },
          onError: (error) => {
            console.error("Create service order failed:", error);
            toast.error("Không thể tạo đơn dịch vụ. Vui lòng thử lại.");
          },
        }
      );
    } catch (error) {
      console.error("Create service order failed:", error);
      toast.error("Đã xảy ra lỗi khi tạo đơn dịch vụ");
    }
  };

  const handleNewOrder = () => {
    // Keep service selected, only reset booking info
    setBookingInfo(null, null);
    setConfirmationDialog({ open: false });
  };

  return (
    <div className="flex flex-col h-screen">
      <header className="flex items-center justify-between p-4 border-b border-accent-foreground/20">
        <div className="flex items-center gap-4 flex-1 min-w-0">
          <div className="flex h-5 items-center space-x-4 text-sm">
            <Link to={DASHBOARD.orders["serviceOrders"]}>
              <Button variant="ghost" size="sm">
                <ArrowLeft className="h-4 w-4" />
                Quay lại
              </Button>
            </Link>{" "}
            <Separator orientation="vertical" className="h-6" />
            <Select
              value={selectedTypeId || "all"}
              onValueChange={(value) =>
                handleTypeSelect(value === "all" ? null : value)
              }
            >
              <SelectTrigger className="w-[200px] border-primary/50 bg-white shadow-md">
                <SelectValue placeholder="Chọn loại dịch vụ" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">
                  <span>Tất cả</span>
                </SelectItem>
                {!!serviceTypes &&
                  serviceTypes.length > 0 &&
                  serviceTypes.map((item) => (
                    <SelectItem key={item.id} value={item.id}>
                      <div className="flex items-center justify-between gap-2 w-full">
                        <span>{item.name}</span>
                        <Badge
                          className="h-5 min-w-5 rounded-full px-1 font-mono tabular-nums"
                          variant="outline"
                        >
                          {item.serviceItemCount}
                        </Badge>
                      </div>
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="flex items-center h-5 gap-2">
          <Button variant="outline" size="sm" onClick={handleReset}>
            <RotateCcw className="h-4 w-4" />
            Đặt lại
          </Button>
          <Separator orientation="vertical" />
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCustomServiceDialog(true)}
            className="text-primary border-primary/50 hover:bg-primary/10"
          >
            <Plus className="h-4 w-4" />
            Dịch vụ tùy chỉnh
          </Button>
          <Separator orientation="vertical" />
          <Input
            startAddon={<SearchIcon />}
            placeholder="Tìm kiếm dịch vụ..."
            value={filters.searchText}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="w-64"
          />
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        <main className="flex-1 overflow-auto p-6">
          {isLoadingServices ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {Array.from({ length: 6 }).map((_, i) => (
                <Skeleton key={i} className="h-60" />
              ))}
            </div>
          ) : filteredItems && filteredItems.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredItems.map((item) => (
                <ServiceItemCard
                  key={item.serviceItemId}
                  serviceItem={item}
                  addToOrder={() => handleSelectService(item)}
                  isSelected={
                    selectedService?.serviceItemId === item.serviceItemId
                  }
                />
              ))}
            </div>
          ) : (
            <Empty className="flex items-center justify-center h-full">
              <EmptyHeader className="text-center text-muted-foreground">
                <EmptyMedia variant={"icon"}>
                  <SearchIcon className="h-12 w-12 mx-auto" />
                </EmptyMedia>
                <EmptyTitle className="text-lg font-medium">
                  Không tìm thấy dịch vụ
                </EmptyTitle>
                <EmptyDescription className="text-sm">
                  Thử điều chỉnh bộ lọc của bạn
                </EmptyDescription>
              </EmptyHeader>
            </Empty>
          )}
        </main>

        {/* Cart Sidebar - Single Service Selection */}
        <aside className="w-md shadow-md h-full border p-4  overflow-y-auto flex flex-col">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Dịch vụ đã chọn</h2>
          </div>
          <Separator className="my-2" />

          {/* Empty State */}
          {isEmpty && (
            <Empty>
              <EmptyHeader>
                <EmptyMedia variant={"icon"}>
                  <ImageIcon className="h-12 w-12 mx-auto opacity-20" />
                </EmptyMedia>
                <EmptyTitle>Chưa chọn dịch vụ</EmptyTitle>
                <EmptyDescription>Chọn dịch vụ để bắt đầu</EmptyDescription>
              </EmptyHeader>
            </Empty>
          )}

          {/* Selected Service */}
          {selectedService && (
            <div className="flex-1 flex flex-col justify-between space-y-4">
              {/* Service Info Card */}
              <Card className="border-none bg-transparent ">
                {selectedService.imageUrl && (
                  <Image
                    src={selectedService.imageUrl}
                    alt={selectedService.name}
                    className="w-full h-32 object-cover rounded-md"
                  />
                )}
                <div>
                  <h3 className="font-semibold text-sm">
                    {selectedService.name}
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    {selectedService.code}
                  </p>
                  <p className="text-sm font-mono font-bold text-primary mt-1">
                    {formatMoney(selectedService.unitPrice).vndFormatted}
                  </p>
                </div>

                {/* Quantity Input */}
                <div className="space-y-2">
                  <Label htmlFor="quantity" className="text-xs">
                    Số lượng
                  </Label>
                  <Counter
                    value={selectedService.quantity}
                    onChange={(e) => updateServiceQuantity(e || 1)}
                  />
                </div>

                {/* Notes Input */}
                <div className="space-y-2">
                  <Label htmlFor="note" className="text-xs">
                    Ghi chú
                  </Label>
                  <Textarea
                    id="note"
                    placeholder="Ghi chú cho dịch vụ..."
                    value={selectedService.note || ""}
                    onChange={(e) => updateServiceNote(e.target.value)}
                    rows={3}
                    className="text-sm resize-none"
                  />
                </div>

                {/* Subtotal */}
                <div className="pt-2 border-t">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Tổng cộng</span>
                    <span className="text-lg font-bold text-primary font-mono">
                      {formatMoney(subtotal).vndFormatted}
                    </span>
                  </div>
                </div>
              </Card>

              {/* Action Buttons */}
              <div className="space-y-2">
                <Button
                  onClick={handleConfirm}
                  className="w-full"
                  size="lg"
                  disabled={isEmpty}
                >
                  Xác nhận đơn
                </Button>
                <Button
                  onClick={clearService}
                  variant="outline"
                  className="w-full"
                  size="sm"
                >
                  Xóa dịch vụ
                </Button>
              </div>
            </div>
          )}
        </aside>
      </div>

      <CheckoutConfirmDialog
        open={checkoutDialog}
        onOpenChange={setCheckoutDialog}
        subtotal={subtotal}
        itemCount={itemCount}
        onConfirm={handleCheckoutConfirm}
      />

      <BookingSelectionDialog
        open={bookingDialog}
        onOpenChange={setBookingDialog}
        onSelect={handleSelectBooking}
      />

      <ServedTimeDialog
        open={scheduledTimeDialog}
        onOpenChange={setScheduledTimeDialog}
        onConfirm={handleScheduledTimeConfirm}
        bookingInfo={selectedBookingInfo?.bookingCode}
      />

      <CustomServiceDialog
        open={customServiceDialog}
        onOpenChange={setCustomServiceDialog}
        onConfirm={handleAddCustomService}
      />

      <OrderConfirmationDialog
        status={isPending ? "loading" : isError ? "error" : "success"}
        open={confirmationDialog.open}
        onOpenChange={(open) =>
          setConfirmationDialog({ open, orderId: undefined })
        }
        orderId={confirmationDialog.orderId || ""}
        orderTotal={subtotal}
        itemCount={itemCount}
        customerInfo={
          confirmationDialog.customerType === "In-House"
            ? "Khách đặt phòng"
            : confirmationDialog.customerType === "Walk-In"
              ? "Khách lẻ"
              : "Khách đặt phòng"
        }
        onNewOrder={handleNewOrder}
      />
    </div>
  );
}
