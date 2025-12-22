import { Minus, Plus, Search, ShoppingBasket } from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog";
import { Input } from "~/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { Tabs, TabsList, TabsTrigger } from "~/components/ui/tabs";
import { cn, formatMoney } from "~/lib/utils";
import { useMenuCategories } from "~/routes/menu/container/menu-categories/query.hooks";
import { useMenuList } from "~/routes/menu/container/menu/query.hooks";
import { useServiceTypes } from "~/routes/services/container/service-types/query.hooks";
import { useServices } from "~/routes/services/container/services/query.hooks";
import type { BookingDetailResponseDto } from "~/services/api/booking/dto";
import { useAddCompletedCharges } from "../../container/use-booking-checkout.hooks";

interface AddCompletedChargesDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  booking: BookingDetailResponseDto;
}

export default function AddCompletedChargesDialog({
  open,
  onOpenChange,
  booking,
}: AddCompletedChargesDialogProps) {
  const [activeTab, setActiveTab] = useState<"pos" | "service">("pos");
  const [selectedCategoryCode, setSelectedCategoryCode] = useState<
    string | null
  >(null);
  const [selectedServiceType, setSelectedServiceType] = useState<string | null>(
    null
  );
  const [searchText, setSearchText] = useState("");
  const [selectedBookingRoom, setSelectedBookingRoom] = useState<string | null>(
    null
  );

  // Cart State
  const [selectedPOSItems, setSelectedPOSItems] = useState(new Map());
  const [selectedServiceItems, setSelectedServiceItems] = useState(new Map());

  // Data Hooks
  const { data: menuCategories = [] } = useMenuCategories({}, true);
  const { data: serviceTypes = [] } = useServiceTypes({}, { enabled: true });
  const { data: menuItems = [] } = useMenuList({
    categoryCode: selectedCategoryCode || undefined,
  });
  const { data: serviceItems = [] } = useServices({
    typeCode: selectedServiceType || undefined,
  });
  const { mutate: addCompletedCharges, isPending } = useAddCompletedCharges(
    booking.id
  );

  // Filter Logic
  const filteredItems = useMemo(() => {
    const items = activeTab === "pos" ? menuItems : serviceItems;
    if (!searchText) return items;
    const lower = searchText.toLowerCase();
    return items.filter((i: any) => i.name.toLowerCase().includes(lower));
  }, [activeTab, menuItems, serviceItems, searchText]);

  // Totals
  const totalAmount = useMemo(() => {
    const pos = Array.from(selectedPOSItems.values()).reduce(
      (sum: number, { item, quantity }: any) => sum + item.price * quantity,
      0
    );
    const svc = Array.from(selectedServiceItems.values()).reduce(
      (sum: number, { item, quantity }: any) => sum + item.basePrice * quantity,
      0
    );
    return pos + svc;
  }, [selectedPOSItems, selectedServiceItems]);

  const totalCount = selectedPOSItems.size + selectedServiceItems.size;

  // Handlers
  const handleUpdateQuantity = (
    id: string,
    delta: number,
    item: any,
    isMenu: boolean
  ) => {
    const map = isMenu ? selectedPOSItems : selectedServiceItems;
    const setMap = isMenu ? setSelectedPOSItems : setSelectedServiceItems;
    const existing = map.get(id);
    const newMap = new Map(map);

    // Validation logic (Max Qty)
    if (isMenu && delta > 0) {
      const currentQty = existing?.quantity || 0;
      const max = item.maxQuantityAvailable ?? Infinity;
      if (currentQty + delta > max) {
        toast.error(`Chỉ còn lại ${max} sản phẩm`);
        return;
      }
    }

    if (existing) {
      const newQty = existing.quantity + delta;
      if (newQty <= 0) newMap.delete(id);
      else newMap.set(id, { ...existing, quantity: newQty });
    } else if (delta > 0) {
      newMap.set(id, { item, quantity: 1 });
    }
    setMap(newMap);
  };

  const handleConfirm = () => {
    addCompletedCharges(
      {
        posItems: Array.from(selectedPOSItems.values()).map(
          ({ item, quantity }: any) => ({ menuItemId: item.itemId, quantity })
        ),
        serviceItems: Array.from(selectedServiceItems.values()).map(
          ({ item, quantity }: any) => ({
            serviceItemId: item.serviceItemId,
            quantity,
          })
        ),
        bookingRoomId:
          selectedBookingRoom === "booking" ? "" : selectedBookingRoom || "",
        source: "Staff",
      },
      {
        onSuccess: () => {
          handleClose();
        },
      }
    );
  };

  const handleClose = () => {
    setSelectedPOSItems(new Map());
    setSelectedServiceItems(new Map());
    setSearchText("");
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-[95vw] w-[1200px] h-[90vh] p-0 flex flex-col gap-0 overflow-hidden bg-background">
        <DialogHeader className="px-6 py-4 border-b">
          <DialogTitle className="text-lg">Thêm dịch vụ</DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground">
            Chọn món hoặc dịch vụ để tính tiền
          </DialogDescription>
        </DialogHeader>

        {/* 2. Main Body */}
        <div className="flex flex-1 overflow-hidden relative">
          {/* LEFT: Item Selection */}
          <div className="flex-1 flex flex-col bg-muted/5 min-w-0">
            {/* Filters */}
            <div className="px-6 py-4 flex flex-col sm:flex-row gap-3 border-b bg-background shrink-0">
              <Tabs
                value={activeTab}
                onValueChange={(v: any) => setActiveTab(v)}
                className="w-[240px] shrink-0"
              >
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="pos">Menu</TabsTrigger>
                  <TabsTrigger value="service">Dịch vụ</TabsTrigger>
                </TabsList>
              </Tabs>

              <div className="flex flex-1 gap-2 min-w-0">
                <div className="relative flex-1">
                  <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Tìm tên món..."
                    className="pl-9 bg-muted/20 border-transparent focus:bg-background focus:border-input transition-all"
                    value={searchText}
                    onChange={(e) => setSearchText(e.target.value)}
                  />
                </div>
                <Select
                  value={
                    activeTab === "pos"
                      ? selectedCategoryCode || "all"
                      : selectedServiceType || "all"
                  }
                  onValueChange={(v) =>
                    activeTab === "pos"
                      ? setSelectedCategoryCode(v === "all" ? null : v)
                      : setSelectedServiceType(v === "all" ? null : v)
                  }
                >
                  <SelectTrigger className="w-[180px] bg-muted/20 border-transparent focus:bg-background focus:border-input">
                    <SelectValue placeholder="Tất cả danh mục" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tất cả</SelectItem>
                    {(activeTab === "pos" ? menuCategories : serviceTypes).map(
                      (c: any) => (
                        <SelectItem key={c.code || c.id} value={c.code || c.id}>
                          {c.name}
                        </SelectItem>
                      )
                    )}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Grid */}
            <div className="flex-1 p-6 overflow-y-auto h-[60vh]">
              <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 pb-20">
                {filteredItems.map((item: any) => {
                  const isMenu = activeTab === "pos";
                  const id = isMenu ? item.itemId : item.serviceItemId;
                  const price = isMenu ? item.price : item.basePrice;
                  const map = isMenu ? selectedPOSItems : selectedServiceItems;
                  const qty = map.get(id)?.quantity || 0;
                  const maxQty = isMenu ? item.maxQuantityAvailable : null;
                  const isSoldOut = isMenu && maxQty === 0;

                  return (
                    <ItemCard
                      key={id}
                      name={item.name}
                      price={price}
                      quantity={qty}
                      isSoldOut={isSoldOut}
                      onAdd={() => handleUpdateQuantity(id, 1, item, isMenu)}
                      onRemove={() =>
                        handleUpdateQuantity(id, -1, item, isMenu)
                      }
                    />
                  );
                })}
              </div>
            </div>
          </div>

          {/* RIGHT: Cart Sidebar (Desktop) */}
          <div className="hidden lg:flex w-[380px] flex-col border-l bg-background z-20 shadow-md shrink-0 h-full overflow-y-auto">
            <CartContent
              totalCount={totalCount}
              totalAmount={totalAmount}
              posItems={selectedPOSItems}
              serviceItems={selectedServiceItems}
              rooms={booking.rooms}
              selectedRoom={selectedBookingRoom}
              onRoomChange={setSelectedBookingRoom}
              onUpdatePos={(id: string, d: number) => {
                const entry = selectedPOSItems.get(id);
                if (entry) handleUpdateQuantity(id, d, entry.item, true);
              }}
              onUpdateService={(id: string, d: number) => {
                const entry = selectedServiceItems.get(id);
                if (entry) handleUpdateQuantity(id, d, entry.item, false);
              }}
              onConfirm={handleConfirm}
              isPending={isPending}
            />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// --- Sub-components ---

function ItemCard({ name, price, quantity, isSoldOut, onAdd, onRemove }: any) {
  return (
    <div
      className={cn(
        "group relative flex flex-col justify-between rounded-xl border bg-card p-4 shadow-sm transition-all select-none",
        isSoldOut
          ? "opacity-60 bg-muted cursor-not-allowed"
          : "hover:border-primary/50 hover:shadow-md cursor-pointer",
        quantity > 0 ? "ring-2 ring-primary border-primary bg-primary/5" : ""
      )}
      onClick={!isSoldOut ? onAdd : undefined}
    >
      <div className="space-y-1.5 mb-8">
        <div className="flex justify-between gap-2">
          <h4 className="font-medium text-sm leading-snug line-clamp-2">
            {name}
          </h4>
          {isSoldOut && (
            <Badge variant="destructive" className="h-5 px-1 text-[10px]">
              Hết
            </Badge>
          )}
        </div>
        <p className="font-bold text-primary">
          {formatMoney(price).vndFormatted}
        </p>
      </div>

      <div className="absolute bottom-3 right-3 flex items-center gap-1">
        {quantity > 0 ? (
          <div
            className="flex items-center gap-2 bg-background shadow-sm rounded-full p-1 border"
            onClick={(e) => e.stopPropagation()}
          >
            <Button
              size="icon"
              variant="ghost"
              className="h-7 w-7 rounded-full hover:bg-muted"
              onClick={onRemove}
            >
              <Minus className="h-3 w-3" />
            </Button>
            <span className="w-6 text-center font-semibold text-sm tabular-nums">
              {quantity}
            </span>
            <Button
              size="icon"
              variant="default"
              className="h-7 w-7 rounded-full"
              onClick={onAdd}
            >
              <Plus className="h-3 w-3" />
            </Button>
          </div>
        ) : (
          <Button
            size="icon"
            variant="secondary"
            className="h-8 w-8 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
            disabled={isSoldOut}
          >
            <Plus className="h-4 w-4" />
          </Button>
        )}
      </div>
    </div>
  );
}

function CartContent({
  totalCount,
  totalAmount,
  posItems,
  serviceItems,
  rooms,
  selectedRoom,
  onRoomChange,
  onUpdatePos,
  onUpdateService,
  onConfirm,
  isPending,
}: any) {
  return (
    <div className="flex flex-col h-full bg-background overflow-hidden">
      <div className="p-5 border-b bg-background shrink-0">
        <div className="flex items-center gap-2 mb-4">
          <ShoppingBasket className="h-5 w-5 text-primary" />
          <span className="font-bold text-lg">Giỏ hàng ({totalCount})</span>
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-muted-foreground uppercase">
            Tính phí vào
          </label>
          <Select
            value={selectedRoom || "booking"}
            onValueChange={onRoomChange}
          >
            <SelectTrigger className="bg-muted/20 border-transparent focus:bg-background focus:border-input w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="booking">Chung (Booking)</SelectItem>
              {rooms.map((r: any) => (
                <SelectItem key={r.bookingRoomId} value={r.bookingRoomId}>
                  {r.roomName} - {r.roomTypeName}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="p-4 flex-1 overflow-y-auto">
        {totalCount === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-muted-foreground space-y-3 opacity-60">
            <ShoppingBasket className="h-12 w-12" />
            <p className="text-sm">Chưa có món nào</p>
          </div>
        ) : (
          <div className="space-y-6 pb-4">
            {posItems.size > 0 && (
              <div className="space-y-2">
                <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider px-2">
                  Đồ ăn & Uống
                </h4>
                {Array.from(posItems.values()).map(
                  ({ item, quantity }: any) => (
                    <CartRow
                      key={item.itemId}
                      name={item.name}
                      price={item.price}
                      qty={quantity}
                      onUp={() => onUpdatePos(item.itemId, 1)}
                      onDown={() => onUpdatePos(item.itemId, -1)}
                    />
                  )
                )}
              </div>
            )}

            {serviceItems.size > 0 && (
              <div className="space-y-2">
                <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider px-2">
                  Dịch vụ
                </h4>
                {Array.from(serviceItems.values()).map(
                  ({ item, quantity }: any) => (
                    <CartRow
                      key={item.serviceItemId}
                      name={item.name}
                      price={item.basePrice}
                      qty={quantity}
                      onUp={() => onUpdateService(item.serviceItemId, 1)}
                      onDown={() => onUpdateService(item.serviceItemId, -1)}
                    />
                  )
                )}
              </div>
            )}
          </div>
        )}
      </div>

      <div className="p-5 bg-background border-t space-y-4 shadow-md shrink-0">
        <div className="flex justify-between items-end">
          <span className="text-sm font-medium text-muted-foreground">
            Tổng thanh toán
          </span>
          <span className="text-2xl font-bold text-primary font-mono">
            {formatMoney(totalAmount).vndFormatted}
          </span>
        </div>
        <Button
          className="w-full h-12 text-base font-semibold shadow-lg shadow-primary/20"
          size="lg"
          disabled={totalCount === 0 || isPending}
          onClick={onConfirm}
        >
          {isPending ? "Đang xử lý..." : "Xác nhận thêm"}
        </Button>
      </div>
    </div>
  );
}

function CartRow({ name, price, qty, onUp, onDown }: any) {
  return (
    <div className="group flex items-center justify-between p-3 bg-background rounded-xl border shadow-sm transition-all hover:border-primary/30">
      <div className="min-w-0 flex-1 pr-3">
        <div className="font-medium text-sm truncate">{name}</div>
        <div className="text-xs text-muted-foreground">
          {formatMoney(price).vndFormatted}
        </div>
      </div>
      <div className="flex items-center gap-3 bg-muted rounded-lg p-1">
        <button
          onClick={onDown}
          className="h-6 w-6 flex items-center justify-center rounded-md bg-background shadow-sm hover:text-destructive transition-colors"
        >
          <Minus className="h-3 w-3" />
        </button>
        <span className="w-4 text-center text-sm font-semibold tabular-nums">
          {qty}
        </span>
        <button
          onClick={onUp}
          className="h-6 w-6 flex items-center justify-center rounded-md bg-primary text-primary-foreground shadow-sm hover:bg-primary/90 transition-colors"
        >
          <Plus className="h-3 w-3" />
        </button>
      </div>
    </div>
  );
}
