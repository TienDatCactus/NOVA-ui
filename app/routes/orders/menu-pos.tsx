import {
  ArrowLeft,
  Loader2,
  Plus,
  RotateCcw,
  SearchIcon,
  ShoppingBasket,
  Trash2,
} from "lucide-react";
import { useCallback, useMemo, useState } from "react";
import { toast } from "sonner";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { AuthLoader, Permission, RouteModule } from "~/lib/auth/auth.loader";
import type { Route } from "./+types/menu-pos";

import { uuidv4, type z } from "zod";
import { Separator } from "~/components/ui/separator";
import { Skeleton } from "~/components/ui/skeleton";
import type { MenuListItemSchema } from "~/services/api/menu/menu.schema";
import { useMenuCategories } from "../menu/container/menu-categories/query.hooks";
import { useMenuList } from "../menu/container/menu/query.hooks";
import BookingSelectionDialog from "./components/booking-selection.dialog";
import CartItem from "./components/cart-item";
import CartSummary from "./components/cart-summary";
import CustomItemDialog from "./components/menu-pos/custom-item.dialog";
import MenuItemCard from "./components/menu-pos/menu-item-card";
import OrderConfirmationDialog from "./components/order-confirmation.dialog";

import { Link } from "react-router";
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
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "~/components/ui/tooltip";
import { DASHBOARD } from "~/lib/fe-url";
import { useMenuPosOrderStore } from "~/store/menu-pos-order.store";
import useMenuFilters from "../menu/container/menu/filter.hooks";
import OrderConfirmDialog from "./components/order-confirm.dialog";
import ScheduledTimeDialog from "./components/scheduled-time.dialog";
import { useCreatePOSOrderWithItems } from "./container/pos-orders/mutation.hooks";

type MenuItem = z.infer<typeof MenuListItemSchema>;

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Bán Hàng Thực Đơn - NOVA Hotel Management" },
    { name: "description", content: "Điểm bán POS thực đơn" },
  ];
}

export const clientLoader = () =>
  AuthLoader.guard(RouteModule.Orders, Permission.Read);

export default function Component({}: Route.ComponentProps) {
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

  const {
    mutate: createOrder,
    isError,
    isPending,
  } = useCreatePOSOrderWithItems();

  const handleAddToCart = useCallback(
    (item: MenuItem) => {
      if (item.maxQuantityAvailable === 0) {
        toast.error(`${item.name} hiện đã hết hàng`);
        return;
      }

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
    },
    [addItem, items]
  );

  const handleAddCustomItem = useCallback(
    (item: {
      name: string;
      description?: string;
      unitPrice: number;
      quantity: number;
    }) => {
      const id = uuidv4();
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
    },
    [addItem]
  );

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
    setScheduledTimeDialog(false);
    handleCreateOrder(scheduledAt);
  };
  const handleCreateOrder = (scheduledAtParam?: string) => {
    const finalScheduledAt = scheduledAtParam || scheduledAt;

    if (!finalScheduledAt) {
      toast.error("Vui lòng chọn thời gian phục vụ");
      return;
    }

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
          setConfirmationDialog({
            open: true,
            customerType: wasBooking ? "In-House" : "Walk-In",
          });
          setSelectedBookingInfo(null);
          setBookingInfo(null, null);
          setScheduledAt("");
          setNotes("");
        },
      }
    );
  };

  const handleNewOrder = () => {
    clearOrder();
  };
  const isInvalid = useMemo(
    () =>
      menuItems?.some((item) => {
        const cartItem = items.find((i) => i.id === item.itemId);
        if (!cartItem) return false;
        return (
          item.maxQuantityAvailable !== undefined &&
          cartItem.quantity > (item?.maxQuantityAvailable || 0)
        );
      }),
    [items, menuItems]
  );
  return (
    <div className="flex flex-col h-screen relative bg-background">
      {isPending && (
        <div className="absolute inset-0 flex h-full items-center justify-center bg-black/50 z-50">
          <Loader2
            className="m-auto h-12 w-12 text-white animate-spin"
            aria-label="Loading"
          />
        </div>
      )}
      <header className="flex items-center justify-between px-6 py-3 border-b bg-background z-20 shadow-sm">
        <div className="flex items-center gap-4 flex-1 min-w-0">
          <div className="flex h-5 items-center space-x-4 text-sm">
            <Link to={DASHBOARD.orders.menuOrders}>
              <Button
                variant="ghost"
                size="sm"
                className="pl-0 hover:bg-transparent hover:text-primary"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Quay lại
              </Button>
            </Link>
            <Separator orientation="vertical" className="h-6" />
            <Select
              value={selectedCategoryId || "all"}
              onValueChange={(value) =>
                handleCategorySelect(value === "all" ? null : value)
              }
            >
              <SelectTrigger className="w-[200px] border-primary/50 bg-background shadow-md">
                <SelectValue placeholder="Chọn danh mục" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">
                  <div className="flex items-center justify-between w-full font-medium">
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
                          className="h-5 min-w-5 rounded-full px-1.5 font-mono tabular-nums text-[10px]"
                          variant="secondary"
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

        <div className="flex items-center h-9 gap-3">
          <Input
            startAddon={
              <SearchIcon className="h-4 w-4 text-muted-foreground" />
            }
            placeholder="Tìm kiếm món..."
            value={filters.searchText}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="w-64 bg-muted/40 border-transparent focus-visible:bg-background focus-visible:ring-1 focus-visible:ring-primary"
          />
          <Separator orientation="vertical" className="h-6" />
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCustomItemDialog(true)}
            className="border-dashed"
          >
            <Plus className="h-4 w-4 mr-2" />
            Món tùy chỉnh
          </Button>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleReset}
                  className="h-9 w-9"
                >
                  <RotateCcw className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Đặt lại bộ lọc</TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Main Content (Grid) */}
        <main className="flex-1 overflow-y-auto p-6 bg-muted/5">
          {isLoadingMenu ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6">
              {Array.from({ length: 8 }).map((_, i) => (
                <Skeleton key={i} className="aspect-[4/5] rounded-xl" />
              ))}
            </div>
          ) : filteredItems && filteredItems.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 pb-20">
              {filteredItems.map((item) => (
                <MenuItemCard
                  key={item.itemId}
                  menuItem={item}
                  addToOrder={() => handleAddToCart(item)}
                />
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-center space-y-4">
              <div className="h-24 w-24 bg-muted rounded-full flex items-center justify-center opacity-50">
                <SearchIcon className="h-10 w-10" />
              </div>
              <div className="space-y-1">
                <p className="text-xl font-semibold text-foreground">
                  Không tìm thấy món ăn
                </p>
                <p className="text-muted-foreground">
                  Thử tìm kiếm từ khóa khác hoặc đặt lại bộ lọc
                </p>
              </div>
              <Button variant="outline" onClick={handleReset}>
                Đặt lại bộ lọc
              </Button>
            </div>
          )}
        </main>

        {/* Sidebar (Cart) */}
        <aside className="w-[420px] overflow-y-auto flex flex-col border-l bg-background shadow-2xl shadow-black/5 z-10 relative">
          {/* 1. Header */}
          <div className="flex items-center justify-between p-4 border-b bg-background/80 backdrop-blur z-10">
            <h2 className="font-semibold text-xl">Đơn hàng hiện tại</h2>
            {items.length > 0 ? (
              <div className="flex items-center gap-2">
                {orderId && (
                  <Badge variant="secondary" className="font-mono">
                    {orderId}
                  </Badge>
                )}
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-muted-foreground hover:text-destructive"
                  onClick={clearOrder}
                  title="Xóa tất cả"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ) : (
              <Badge
                variant="outline"
                className="text-xs text-muted-foreground font-normal"
              >
                Mới
              </Badge>
            )}
          </div>

          {/* 2. Scrollable Items Area */}
          <div className="flex-1 max-h-72 overflow-y-auto">
            {items.length > 0 ? (
              <div className="flex flex-col p-4  gap-3">
                {items.map((item) => (
                  <CartItem
                    key={item.id}
                    cartItem={item}
                    onQuantityChange={(qty) => updateQuantity(item.id, qty)}
                    onRemove={() => removeItem(item.id)}
                    isInvalid={isInvalid}
                  />
                ))}
              </div>
            ) : (
              <Empty>
                <EmptyHeader>
                  <EmptyMedia variant="icon">
                    <ShoppingBasket />
                  </EmptyMedia>
                  <EmptyTitle>Giỏ hàng trống</EmptyTitle>
                  <EmptyDescription>
                    Chọn món từ thực đơn để bắt đầu tạo đơn.
                  </EmptyDescription>
                </EmptyHeader>
              </Empty>
            )}
          </div>

          {/* 3. Sticky Footer (Summary & Action) */}
          <div className="p-4 border-t bg-muted/5 space-y-4">
            {/* This component usually handles Subtotal display, Tax, and the Main Action Button */}
            <CartSummary
              itemCount={itemCount}
              subtotal={subtotal}
              notes={notes}
              onNotesChange={setNotes}
              onConfirm={handleConfirm}
              onClearCart={clearOrder}
              isInvalid={isInvalid}
            />
          </div>
        </aside>
      </div>

      <OrderConfirmDialog
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
