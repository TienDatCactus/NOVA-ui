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
import BookingSelectionDialog from "./components/order-pos/booking-selection.dialog";
import CartItem from "./components/order-pos/cart-item";
import CartSummary from "./components/order-pos/cart-summary";
import CheckoutConfirmDialog from "./components/order-pos/checkout-confirm.dialog";
import ServiceItemCard from "./components/order-pos/service-item-card";
import OrderConfirmationDialog from "./components/order-pos/order-confirmation.dialog";
import ServedTimeDialog from "./components/order-pos/served-time.dialog";
import CustomServiceDialog from "./components/order-pos/custom-service.dialog";

import useServiceFilters from "../services/container/services/filter.hooks";
import { Link } from "react-router";
import { DASHBOARD } from "~/lib/fe-url";
import { useCreateServicePosOrderAndItems } from "./container/service-pos/mutation.hooks";
import type { Route } from "./+types/service-pos";
import { useServicePosOrderStore } from "~/store/service-pos-order.store";

export const action = async ({ request, params }: Route.ActionArgs) => {
  return {};
};

export const loader = async ({ request, params }: Route.LoaderArgs) => {
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

  // Cart logic
  const {
    items,
    subtotal,
    itemCount,
    orderId,
    bookingId,
    bookingRoomId,
    scheduledAt,
    notes,
    addItem,
    removeItem,
    updateQuantity,
    setBookingInfo,
    setScheduledAt,
    setNotes,
    clearOrder,
  } = useServicePosOrderStore();

  const isEmpty = items.length === 0;

  const customerDisplay = bookingId ? "Khách lẻ" : null;
  const { mutate } = useCreateServicePosOrderAndItems();

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
  }>({ open: false });

  // Handlers
  const handleAddToCart = (item: ServiceItem) => {
    addItem({
      id: item.serviceItemId,
      serviceItemId: item.serviceItemId,
      code: item.code,
      name: item.name,
      unitPrice: item.basePrice,
      imageUrl: item.imageUrls?.[0],
    });
    toast.success(`Đã thêm ${item.name} vào đơn`);
  };

  const handleAddCustomService = (service: {
    name: string;
    description?: string;
    unitPrice: number;
    quantity: number;
  }) => {
    const id = crypto.randomUUID();
    const customId = `CUSTOM-${id}`;
    addItem({
      id: customId,
      serviceItemId: undefined,
      code: "CUSTOM",
      name: service.name,
      unitPrice: service.unitPrice,
      quantity: service.quantity,
      customServiceName: service.name,
      customServiceDescription: service.description,
    });
    toast.success(`Đã thêm "${service.name}" vào giỏ`);
  };

  const handleConfirm = () => {
    if (isEmpty) return;
    setCheckoutDialog(true);
  };

  const handleCheckoutConfirm = (mode: "walk-in" | "booking") => {
    setCheckoutDialog(false);

    if (mode === "walk-in") {
      // Walk-in guests also need scheduled time
      setScheduledTimeDialog(true);
    } else {
      // Booking guests select booking first, then scheduled time
      setBookingDialog(true);
    }
  };

  const handleSelectBooking = (
    bookingId: string,
    bookingRoomId: string,
    bookingCode?: string
  ) => {
    setBookingInfo(bookingId, bookingRoomId || null);
    setSelectedBookingInfo({ bookingId, bookingRoomId, bookingCode });

    // Show scheduled time dialog for booking orders
    setBookingDialog(false);
    setScheduledTimeDialog(true);
  };

  const handleScheduledTimeConfirm = (scheduledTime: string) => {
    setScheduledAt(scheduledTime);
    setScheduledTimeDialog(false);
    handleCreateOrder();
  };

  const handleCreateOrder = () => {
    try {
      mutate({
        bookingId,
        bookingRoomId,
        scheduledAt,
        notes,
        items: items,
      });
      setConfirmationDialog({
        open: true,
      });
    } catch (error) {
      console.error("Create service order failed:", error);
    }
  };

  const handleNewOrder = () => {
    clearOrder();
  };

  return (
    <div className="flex flex-col h-screen">
      <header className="flex items-center justify-between p-4 border-b border-accent-foreground/20">
        <div className="flex items-center gap-4 flex-1 min-w-0">
          <div className="flex h-5 items-center space-x-4 text-sm">
            <Link to={DASHBOARD.orders.index}>
              <Button variant="ghost" size="sm" onClick={handleReset}>
                <ArrowLeft className="h-4 w-4" />
                Quay lại
              </Button>
            </Link>
            <Separator orientation="vertical" />
            <Button
              variant={selectedTypeId === null ? "default" : "outline"}
              size="sm"
              onClick={() => handleTypeSelect(null)}
            >
              <SquareMenu />
              Tất cả
            </Button>
            <Separator orientation="vertical" />
            <div className="flex items-center gap-2 flex-wrap">
              {!!serviceTypes &&
                serviceTypes.length > 0 &&
                serviceTypes?.map((item) => (
                  <Button
                    variant={selectedTypeId === item.id ? "default" : "outline"}
                    size="sm"
                    key={item.id}
                    onClick={() => handleTypeSelect(item.id)}
                  >
                    {item.name}
                    <Badge
                      className="h-5 min-w-5 rounded-full px-1 font-mono tabular-nums ml-1"
                      variant={
                        selectedTypeId === item.id ? "secondary" : "outline"
                      }
                    >
                      {item.serviceItemCount}
                    </Badge>
                  </Button>
                ))}
            </div>
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
                  addToOrder={() => handleAddToCart(item)}
                />
              ))}
            </div>
          ) : (
            <div className="flex items-center justify-center h-full">
              <div className="text-center text-muted-foreground">
                <p className="text-lg font-medium">Không tìm thấy dịch vụ</p>
                <p className="text-sm">Thử điều chỉnh bộ lọc của bạn</p>
              </div>
            </div>
          )}
        </main>

        {/* Cart Sidebar */}
        <aside className="p-2 overflow-y-auto">
          <div className="w-md bg-card rounded-xl h-full border p-2 flex flex-col">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">Tóm tắt đơn hàng</h2>
              {orderId && (
                <Badge variant="outline" className="font-mono">
                  {orderId}
                </Badge>
              )}
            </div>
            <Separator className="my-2" />
            <div className="flex-1 flex flex-col justify-between space-y-2">
              {items.length > 0 && (
                <div className="space-y-4 p-2 overflow-y-auto h-72 snap-y">
                  {items.map((item) => (
                    <CartItem
                      key={item.id}
                      cartItem={item}
                      onQuantityChange={(qty) => updateQuantity(item.id, qty)}
                      onRemove={() => removeItem(item.id)}
                    />
                  ))}
                </div>
              )}

              {/* Cart Summary */}
              <CartSummary
                itemCount={itemCount}
                subtotal={subtotal}
                isEmpty={isEmpty}
                notes={notes}
                onNotesChange={setNotes}
                onConfirm={handleConfirm}
                onClearCart={clearOrder}
              />
            </div>
          </div>
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
        onPrintReceipt={() => {}}
        open={confirmationDialog.open}
        onOpenChange={(open) =>
          setConfirmationDialog({ open, orderId: undefined })
        }
        orderId={confirmationDialog.orderId || ""}
        orderTotal={subtotal}
        itemCount={itemCount}
        customerInfo={customerDisplay || "Khách vãng lai"}
        onNewOrder={handleNewOrder}
      />
    </div>
  );
}
