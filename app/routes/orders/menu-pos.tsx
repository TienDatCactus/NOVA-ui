import {
  ArrowLeft,
  Plus,
  RotateCcw,
  SearchIcon,
  SquareMenu,
} from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";

import type { z } from "zod";
import { Separator } from "~/components/ui/separator";
import { Skeleton } from "~/components/ui/skeleton";
import type { MenuListItemSchema } from "~/services/api/menu/menu.schema";
import { useMenuCategories } from "../menu/container/menu-categories/query.hooks";
import { useMenuList } from "../menu/container/menu/query.hooks";
import BookingSelectionDialog from "./components/booking-selection.dialog";
import CartItem from "./components/cart-item";
import CartSummary from "./components/cart-summary";
import CheckoutConfirmDialog from "./components/checkout-confirm.dialog";
import CustomItemDialog from "./components/menu-pos/custom-item.dialog";
import MenuItemCard from "./components/menu-pos/menu-item-card";
import OrderConfirmationDialog from "./components/order-confirmation.dialog";

import { Link } from "react-router";
import { DASHBOARD } from "~/lib/fe-url";
import { useMenuPosOrderStore } from "~/store/menu-pos-order.store";
import useMenuFilters from "../menu/container/menu/filter.hooks";
import type { Route } from "./+types/menu-pos";
import ScheduledTimeDialog from "./components/scheduled-time.dialog";
import { useCreatePOSOrderWithItems } from "./container/pos-orders/mutation.hooks";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";

type MenuItem = z.infer<typeof MenuListItemSchema>;

export default function Component({
  loaderData,
  actionData,
}: Route.ComponentProps) {
  const { data: menuCategories } = useMenuCategories();

  const { filterMenuItems, filters, resetFilters, updateFilter } =
    useMenuFilters();
  const { data: menuItems, isLoading: isLoadingMenu } = useMenuList({
    categoryCode: filters.categoryCode,
  });
  const [checkoutDialog, setCheckoutDialog] = useState(false);
  const [bookingDialog, setBookingDialog] = useState(false);
  const [scheduledTimeDialog, setScheduledTimeDialog] = useState(false);
  const [customItemDialog, setCustomItemDialog] = useState(false);
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
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(
    null
  );

  const filteredItems = useMemo(() => {
    if (!menuItems) return [];
    let items = filterMenuItems(menuItems);
    return items;
  }, [menuItems, filterMenuItems]);

  const handleCategorySelect = (categoryId: string | null) => {
    setSelectedCategoryId(categoryId);
    const category = menuCategories?.find((cat) => cat.id === categoryId);
    const categoryCode = category?.code || "";

    updateFilter("categoryCode", categoryCode);
  };

  const handleSearchChange = (value: string) => {
    updateFilter("searchText", value);
  };

  const handleReset = () => {
    resetFilters();
    setSelectedCategoryId(null);
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
  } = useMenuPosOrderStore();

  const isEmpty = items.length === 0;

  const { mutate: createOrder, isError } = useCreatePOSOrderWithItems();

  // Handlers
  const handleAddToCart = (item: MenuItem) => {
    // Check if out of stock
    if (item.maxQuantityAvailable === 0) {
      toast.error(`${item.name} hiện đã hết hàng`);
      return;
    }

    // Check if adding would exceed max available
    const existingItem = items.find((i) => i.id === item.itemId);
    if (existingItem) {
      const newQuantity = existingItem.quantity + 1;
      if (
        item.maxQuantityAvailable !== undefined &&
        newQuantity > (item?.maxQuantityAvailable ?? 0)
      ) {
        toast.error(
          `Số lượng tối đa cho ${item.name} là ${item.maxQuantityAvailable}`
        );
        return;
      }
    }

    addItem({
      id: item.itemId,
      menuItemId: item.itemId,
      code: item.code,
      name: item.name,
      unitPrice: item.price,
      imageUrl: item.imageUrls?.[0],
      maxQuantityAvailable: item.maxQuantityAvailable || undefined,
    });
    toast.success(`Đã thêm ${item.name} vào đơn`);
  };

  const handleAddCustomItem = (item: {
    name: string;
    description?: string;
    unitPrice: number;
    quantity: number;
  }) => {
    const id = crypto.randomUUID();
    const customId = `CUSTOM-${id}`;
    addItem({
      id: customId,
      menuItemId: undefined,
      code: "CUSTOM",
      name: item.name,
      unitPrice: item.unitPrice,
      quantity: item.quantity,
      customItemName: item.name,
      customItemDescription: item.description,
    });
    toast.success(`Đã thêm "${item.name}" vào giỏ`);
  };

  const handleConfirm = () => {
    if (isEmpty) return;
    setCheckoutDialog(true);
  };

  const handleCheckoutConfirm = (mode: "walk-in" | "booking") => {
    setCheckoutDialog(false);

    if (mode === "walk-in") {
      setScheduledTimeDialog(true);
    } else {
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
    setBookingDialog(false);
    setScheduledTimeDialog(true);
  };

  const handleScheduledTimeConfirm = (scheduledAt: string) => {
    setScheduledAt(scheduledAt);
    console.log("Scheduled time confirmed:", scheduledAt);
    setScheduledTimeDialog(false);
    handleCreateOrder(scheduledAt);
  };
  const handleCreateOrder = (scheduledAtParam?: string) => {
    const finalScheduledAt = scheduledAtParam || scheduledAt;

    if (!finalScheduledAt) {
      toast.error("Vui lòng chọn thời gian phục vụ");
      return;
    }

    try {
      createOrder(
        {
          bookingId,
          bookingRoomId,
          scheduledAt: finalScheduledAt,
          note: notes || "",
          items,
        },
        {
          onSuccess: () => {
            const wasBooking = !!bookingId;
            setSelectedBookingInfo(null);
            setBookingInfo(null, null);
            setScheduledAt("");
            setNotes("");
            setConfirmationDialog({
              open: true,
              customerType: wasBooking ? "In-House" : "Walk-In",
            });
          },
        }
      );
    } catch (error) {
      console.error("Create order failed:", error);
      toast.error("Đã xảy ra lỗi khi tạo đơn hàng");
    }
  };

  const handleNewOrder = () => {
    clearOrder();
  };

  return (
    <div className="flex flex-col h-screen">
      <header className="flex items-center justify-between p-4 border-b  border-accent-foreground/20">
        <div className="flex items-center gap-4 flex-1 min-w-0">
          <div className="flex h-5 items-center space-x-4 text-sm">
            <Link to={DASHBOARD.orders.menuOrders}>
              <Button variant="ghost" size="sm">
                <ArrowLeft className="h-4 w-4" />
                Quay lại
              </Button>
            </Link>
            <Separator orientation="vertical" />
            <Select
              value={selectedCategoryId || "all"}
              onValueChange={(value) =>
                handleCategorySelect(value === "all" ? null : value)
              }
            >
              <SelectTrigger className="w-[200px] border-primary/50 bg-white shadow-md">
                <SelectValue placeholder="Chọn danh mục" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">
                  <div className="flex items-center justify-between w-full">
                    <span>Tất cả</span>
                  </div>
                </SelectItem>
                {!!menuCategories &&
                  menuCategories.length > 0 &&
                  menuCategories.map((item) => (
                    <SelectItem key={item.id} value={item.id}>
                      <div className="flex items-center justify-between w-full gap-2">
                        <span>{item.name}</span>
                        <Badge
                          className="h-5 min-w-5 rounded-full px-1 font-mono tabular-nums"
                          variant="outline"
                        >
                          {item.menuItemCount}
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
            variant="info-outline"
            size="sm"
            onClick={() => setCustomItemDialog(true)}
          >
            <Plus className="h-4 w-4" />
            Món tùy chỉnh
          </Button>
          <Separator orientation="vertical" />
          <Input
            startAddon={<SearchIcon />}
            placeholder="Tìm kiếm món..."
            value={filters.searchText}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="w-64"
          />
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden ">
        <main className="flex-1 overflow-auto p-6 ">
          {isLoadingMenu ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {Array.from({ length: 8 }).map((_, i) => (
                <Skeleton key={i} className="h-60 " />
              ))}
            </div>
          ) : filteredItems && filteredItems.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {filteredItems.map((item) => (
                <MenuItemCard
                  key={item.itemId}
                  menuItem={item}
                  addToOrder={() => handleAddToCart(item)}
                />
              ))}
            </div>
          ) : (
            <div className="flex items-center justify-center h-full">
              <div className="text-center text-muted-foreground">
                <p className="text-lg font-medium">Không tìm thấy món</p>
                <p className="text-sm">Thử điều chỉnh bộ lọc của bạn</p>
              </div>
            </div>
          )}
        </main>

        {/* Cart Sidebar */}
        <aside className=" p-2 overflow-y-auto ">
          <div className="w-md bg-card rounded-xl h-full border p-4 flex flex-col ">
            <div className="flex items-center justify-between ">
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
                <div className="space-y-4  overflow-y-auto flex-1 max-h-[50vh]">
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

      <ScheduledTimeDialog
        open={scheduledTimeDialog}
        onOpenChange={setScheduledTimeDialog}
        onConfirm={handleScheduledTimeConfirm}
        bookingInfo={selectedBookingInfo?.bookingCode}
      />

      <CustomItemDialog
        open={customItemDialog}
        onOpenChange={setCustomItemDialog}
        onConfirm={handleAddCustomItem}
      />

      <OrderConfirmationDialog
        status={isError ? "error" : "success"}
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
              : "Khách vãng lai"
        }
        onNewOrder={handleNewOrder}
      />
    </div>
  );
}
