import { useState, useMemo } from "react";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Badge } from "~/components/ui/badge";
import { ArrowLeft, RotateCcw, SearchIcon, SquareMenu } from "lucide-react";
import { toast } from "sonner";

import type { MenuListItemSchema } from "~/services/api/menu/menu.schema";
import type { z } from "zod";
import { Separator } from "~/components/ui/separator";
import { Skeleton } from "~/components/ui/skeleton";
import { useMenuCategories } from "../menu/container/menu-categories/query.hooks";
import { useMenuList } from "../menu/container/menu/query.hooks";
import BookingSelectionDialog from "./components/booking-selection.dialog";
import CartItem from "./components/cart-item";
import CartSummary from "./components/cart-summary";
import CheckoutConfirmDialog from "./components/checkout-confirm.dialog";
import CustomerInfoDialog from "./components/customer-info.dialog";
import ItemCustomizationDialog from "./components/item-customization.dialog";
import MenuItemCard from "./components/menu-item-card";
import OrderConfirmationDialog from "./components/order-confirmation.dialog";
import { useCreatePosOrder } from "./container/use-create-order.hooks";
import { usePosCart } from "./container/use-pos-cart.hooks";
import useMenuFilters from "../menu/container/menu/filter.hooks";
import { Link } from "react-router";
import { DASHBOARD } from "~/lib/fe-url";
import type { Route } from "./+types/pos";

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
    items: cartItems,
    subtotal,
    itemCount,
    isEmpty,
    orderId,
    customerDisplay,
    bookingId,
    bookingRoomId,
    addItem,
    removeItem,
    updateQuantity,
    updateNotes,
    setWalkInCustomer,
    setBookingInfo,
    clearOrder,
  } = usePosCart();

  const { mutate } = useCreatePosOrder();
  const [customizationDialog, setCustomizationDialog] = useState<{
    open: boolean;
    itemId?: string;
  }>({ open: false });

  const [customerInfoDialog, setCustomerInfoDialog] = useState(false);
  const [checkoutDialog, setCheckoutDialog] = useState(false);
  const [bookingDialog, setBookingDialog] = useState(false);
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

  const handleEditCartItem = (menuItemId: string) => {
    setCustomizationDialog({ open: true, itemId: menuItemId });
  };

  const handleSaveCustomization = (notes: string) => {
    const itemId = customizationDialog.itemId;
    if (!itemId) return;
    updateNotes(itemId, notes);
    toast.success("Đã cập nhật món");
  };

  const handleConfirm = () => {
    if (isEmpty) return;
    setCheckoutDialog(true);
  };

  const handleCheckoutConfirm = (mode: "walk-in" | "booking") => {
    if (mode === "walk-in") {
      setCheckoutDialog(false);
      setCustomerInfoDialog(true);
    } else {
      // Open booking selection dialog
      setCheckoutDialog(false);
      setBookingDialog(true);
    }
  };

  const handleSelectBooking = (bookingId: string, bookingRoomId: string) => {
    setBookingInfo(bookingId, bookingRoomId);
    toast.success("Đã chọn booking và phòng");
    handleCreateOrder();
  };

  const handleSaveCustomerInfo = (customer: {
    name: string;
    phone?: string;
  }) => {
    setWalkInCustomer(customer);
    toast.success(`Đã lưu thông tin khách: ${customer.name}`);
    handleCreateOrder();
  };

  const handleCreateOrder = () => {
    console.log(bookingId, bookingRoomId);
    try {
      const result = mutate({
        bookingId,
        bookingRoomId,
        items: cartItems,
      });

      toast.success("Đơn hàng đã được tạo thành công!");

      setConfirmationDialog({
        open: true,
      });
    } catch (error) {
      // Error already handled in mutation
      console.error("Create order failed:", error);
    }
  };

  const handleNewOrder = () => {
    clearOrder();
    toast.info("Bắt đầu đơn hàng mới");
  };

  const currentCustomizationItem = cartItems.find(
    (item) => item.menuItemId === customizationDialog.itemId
  );

  return (
    <div className="flex flex-col h-screen">
      {/* Header */}
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
                  itemId={item.itemId}
                  code={item.code}
                  name={item.name}
                  description={item.description}
                  imageUrl={item.imageUrls?.[0]}
                  unitName={item.unitName || undefined}
                  price={item.price}
                  active={item.active}
                  onAdd={() => handleAddToCart(item)}
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
              {cartItems.length > 0 && (
                <div className="space-y-4 p-2 overflow-y-auto  h-100">
                  {cartItems.map((item) => (
                    <CartItem
                      key={item.menuItemId}
                      menuItemId={item.menuItemId}
                      code={item.code}
                      name={item.name}
                      unitPrice={item.unitPrice}
                      quantity={item.quantity}
                      imageUrl={item.imageUrl}
                      notes={item.notes}
                      onQuantityChange={(qty) =>
                        updateQuantity(item.menuItemId, qty)
                      }
                      onEdit={() => handleEditCartItem(item.menuItemId)}
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

      {/* Dialogs */}
      {currentCustomizationItem && (
        <ItemCustomizationDialog
          open={customizationDialog.open}
          onOpenChange={(open) =>
            setCustomizationDialog({
              open,
              itemId: open ? customizationDialog.itemId : undefined,
            })
          }
          itemName={currentCustomizationItem.name}
          currentNotes={currentCustomizationItem.notes}
          onSave={handleSaveCustomization}
        />
      )}

      <CustomerInfoDialog
        open={customerInfoDialog}
        onOpenChange={setCustomerInfoDialog}
        onSave={handleSaveCustomerInfo}
      />

      <CheckoutConfirmDialog
        open={checkoutDialog}
        onOpenChange={setCheckoutDialog}
        subtotal={subtotal}
        itemCount={itemCount}
        hasCustomerInfo={!!customerDisplay}
        customerDisplay={customerDisplay}
        onConfirm={handleCheckoutConfirm}
      />

      <BookingSelectionDialog
        open={bookingDialog}
        onOpenChange={setBookingDialog}
        onSelect={handleSelectBooking}
      />

      <OrderConfirmationDialog
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
