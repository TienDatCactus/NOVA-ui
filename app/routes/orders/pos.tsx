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

import type { MenuListItemSchema } from "~/services/api/menu/menu.schema";
import type { z } from "zod";
import { Separator } from "~/components/ui/separator";
import { Skeleton } from "~/components/ui/skeleton";
import { useMenuCategories } from "../menu/container/menu-categories/query.hooks";
import { useMenuList } from "../menu/container/menu/query.hooks";
import BookingSelectionDialog from "./components/order-pos/booking-selection.dialog";
import CartItem from "./components/order-pos/cart-item";
import CartSummary from "./components/order-pos/cart-summary";
import CheckoutConfirmDialog from "./components/order-pos/checkout-confirm.dialog";
import ItemCustomizationDialog from "./components/order-pos/item-customization.dialog";
import MenuItemCard from "./components/order-pos/menu-item-card";
import OrderConfirmationDialog from "./components/order-pos/order-confirmation.dialog";
import ServedTimeDialog from "./components/order-pos/served-time.dialog";
import CustomItemDialog from "./components/order-pos/custom-item.dialog";

import useMenuFilters from "../menu/container/menu/filter.hooks";
import { Link } from "react-router";
import { DASHBOARD } from "~/lib/fe-url";
import type { Route } from "./+types/pos";
import { usePosOrderStore } from "~/store/pos-order.store";
import { useCreatePosOrderAndItems } from "./container/order-pos/mutation.hooks";

export const action = async ({ request, params }: Route.ActionArgs) => {
  return {};
};

export const loader = async ({ request, params }: Route.LoaderArgs) => {
  return {};
};

type MenuItem = z.infer<typeof MenuListItemSchema>;

export default function Component({
  loaderData,
  actionData,
}: Route.ComponentProps) {
  // Data fetching
  const { data: menuCategories } = useMenuCategories();

  // Filters
  const { filterMenuItems, filters, resetFilters, updateFilter } =
    useMenuFilters();
  const { data: menuItems, isLoading: isLoadingMenu } = useMenuList({
    categoryCode: filters.categoryCode,
  });

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

    // Find the category code from the categoryId
    const category = menuCategories?.find((cat) => cat.id === categoryId);
    const categoryCode = category?.code || "";

    // Update the filter with the category code
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
    servedAt,
    addItem,
    removeItem,
    updateQuantity,
    setBookingInfo,
    setServedAt,
    clearOrder,
  } = usePosOrderStore();

  const isEmpty = items.length === 0;

  const customerDisplay = bookingId ? "Khách lẻ" : null;
  const { mutate } = useCreatePosOrderAndItems();

  const [checkoutDialog, setCheckoutDialog] = useState(false);
  const [bookingDialog, setBookingDialog] = useState(false);
  const [servedTimeDialog, setServedTimeDialog] = useState(false);
  const [customItemDialog, setCustomItemDialog] = useState(false);
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
  const handleAddToCart = (item: MenuItem) => {
    addItem({
      menuItemId: item.itemId,
      code: item.code,
      name: item.name,
      unitPrice: item.price,
      imageUrl: item.imageUrls?.[0],
    });
    toast.success(`Đã thêm ${item.name} vào giỏ`);
  };

  const handleAddCustomItem = (item: {
    name: string;
    unitPrice: number;
    quantity: number;
  }) => {
    addItem({
      menuItemId: `CUSTOM-${Date.now()}`, // Generate unique ID for custom items
      code: "CUSTOM",
      name: item.name,
      unitPrice: item.unitPrice,
      quantity: item.quantity,
    });
    toast.success(`Đã thêm "${item.name}" vào giỏ`);
  };

  const handleConfirm = () => {
    if (isEmpty) return;
    setCheckoutDialog(true);
  };

  const handleCheckoutConfirm = (mode: "walk-in" | "booking") => {
    if (mode === "walk-in") {
      setCheckoutDialog(false);
      handleCreateOrder();
    } else {
      setCheckoutDialog(false);
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

    // Show served time dialog for booking orders
    setBookingDialog(false);
    setServedTimeDialog(true);
  };

  const handleServedTimeConfirm = (servedAt: string) => {
    setServedAt(servedAt);
    setServedTimeDialog(false);
    handleCreateOrder();
  };

  const handleCreateOrder = () => {
    try {
      mutate({
        bookingId,
        bookingRoomId,
        servedAt,
        items: items,
      });
      setConfirmationDialog({
        open: true,
      });
    } catch (error) {
      console.error("Create order failed:", error);
    }
  };

  const handleNewOrder = () => {
    clearOrder();
    toast.info("Bắt đầu đơn hàng mới");
  };

  return (
    <div className="flex flex-col h-screen">
      <header className="flex items-center justify-between p-4 border-b  border-accent-foreground/20">
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
              variant={selectedCategoryId === null ? "default" : "outline"}
              size="sm"
              onClick={() => handleCategorySelect(null)}
            >
              <SquareMenu />
              Tất cả
            </Button>
            <Separator orientation="vertical" />
            <div className="flex items-center gap-2 flex-wrap">
              {!!menuCategories &&
                menuCategories.length > 0 &&
                menuCategories?.map((item) => (
                  <Button
                    variant={
                      selectedCategoryId === item.id ? "default" : "outline"
                    }
                    size="sm"
                    key={item.id}
                    onClick={() => handleCategorySelect(item.id)}
                  >
                    {item.name}
                    <Badge
                      className="h-5 min-w-5 rounded-full px-1 font-mono tabular-nums ml-1"
                      variant={
                        selectedCategoryId === item.id ? "secondary" : "outline"
                      }
                    >
                      {item.menuItemCount}
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
            onClick={() => setCustomItemDialog(true)}
            className="text-primary border-primary/50 hover:bg-primary/10"
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
          <div className="w-md bg-card rounded-xl h-full border p-2 flex flex-col ">
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
                <div className="space-y-4 p-2 overflow-y-auto  h-100">
                  {items.map((item) => (
                    <CartItem
                      key={item.menuItemId}
                      cartItem={item}
                      onQuantityChange={(qty) =>
                        updateQuantity(item.menuItemId, qty)
                      }
                      onRemove={() => removeItem(item.menuItemId)}
                    />
                  ))}
                </div>
              )}

              {/* Cart Summary */}
              <CartSummary
                orderId={orderId}
                itemCount={itemCount}
                subtotal={subtotal}
                isEmpty={isEmpty}
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
        open={servedTimeDialog}
        onOpenChange={setServedTimeDialog}
        onConfirm={handleServedTimeConfirm}
        bookingInfo={selectedBookingInfo?.bookingCode}
      />

      <CustomItemDialog
        open={customItemDialog}
        onOpenChange={setCustomItemDialog}
        onConfirm={handleAddCustomItem}
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
