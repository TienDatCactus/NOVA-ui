import {
  Search,
  Utensils,
  Wrench,
  ShoppingCart,
  Plus,
  Minus,
  X,
  Trash2,
  ShoppingBasketIcon,
} from "lucide-react";
import { useMemo, useState } from "react";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import { Card } from "~/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog";
import { Input } from "~/components/ui/input";
import { ScrollArea } from "~/components/ui/scroll-area";
import { Separator } from "~/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";
import { cn, formatMoney } from "~/lib/utils";
import { useMenuCategories } from "~/routes/menu/container/menu-categories/query.hooks";
import { useMenuList } from "~/routes/menu/container/menu/query.hooks";
import { useServices } from "~/routes/services/container/services/query.hooks";
import { useServiceTypes } from "~/routes/services/container/service-types/query.hooks";
import type { MenuListItemDto } from "~/services/api/menu/dto";
import type { ServiceItem } from "~/services/api/services/dto";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";

interface AddCompletedChargesDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: (data: any) => void;
  isAdding?: boolean;
  bookingRoomId?: string;
}

export default function AddCompletedChargesDialog({
  open,
  onOpenChange,
  onConfirm,
  isAdding,
  bookingRoomId,
}: AddCompletedChargesDialogProps) {
  const [activeTab, setActiveTab] = useState<"pos" | "service">("pos");
  const [selectedCategoryCode, setSelectedCategoryCode] = useState<
    string | null
  >(null);
  const [selectedServiceType, setSelectedServiceType] = useState<string | null>(
    null
  );
  const [searchText, setSearchText] = useState("");

  const [selectedPOSItems, setSelectedPOSItems] = useState<
    Map<string, { item: MenuListItemDto; quantity: number }>
  >(new Map());
  const [selectedServiceItems, setSelectedServiceItems] = useState<
    Map<string, { item: ServiceItem; quantity: number }>
  >(new Map());

  // Queries
  const { data: menuCategories = [] } = useMenuCategories({}, true);
  const { data: serviceTypes = [] } = useServiceTypes({}, { enabled: true });
  const { data: menuItems = [] } = useMenuList({
    categoryCode: selectedCategoryCode || undefined,
  });
  const { data: serviceItems = [] } = useServices({
    typeCode: selectedServiceType || undefined,
  });

  // Filtering Logic
  const filterItems = (items: any[]) => {
    if (!searchText) return items;
    const lower = searchText.toLowerCase();
    return items.filter(
      (i) =>
        i.name.toLowerCase().includes(lower) ||
        i.description?.toLowerCase().includes(lower)
    );
  };

  const filteredMenuItems = useMemo(
    () => filterItems(menuItems),
    [menuItems, searchText]
  );
  const filteredServiceItems = useMemo(
    () => filterItems(serviceItems),
    [serviceItems, searchText]
  );

  // Calculations
  const calculateTotal = (map: Map<string, any>, priceKey: string) => {
    return Array.from(map.values()).reduce(
      (sum, { item, quantity }) => sum + item[priceKey] * quantity,
      0
    );
  };

  const totalPOSAmount = useMemo(
    () => calculateTotal(selectedPOSItems, "price"),
    [selectedPOSItems]
  );
  const totalServiceAmount = useMemo(
    () => calculateTotal(selectedServiceItems, "basePrice"),
    [selectedServiceItems]
  );
  const totalAmount = totalPOSAmount + totalServiceAmount;
  const totalItemsCount = selectedPOSItems.size + selectedServiceItems.size;

  // Handlers
  const updateQuantity = (
    map: Map<string, any>,
    setMap: Function,
    id: string,
    delta: number,
    itemData?: any
  ) => {
    const newMap = new Map(map);
    const existing = newMap.get(id);

    if (existing) {
      const newQty = existing.quantity + delta;
      if (newQty <= 0) newMap.delete(id);
      else newMap.set(id, { ...existing, quantity: newQty });
    } else if (delta > 0 && itemData) {
      newMap.set(id, { item: itemData, quantity: 1 });
    }
    setMap(newMap);
  };

  const handleConfirm = () => {
    if (totalItemsCount === 0) return;
    onConfirm({
      posItems: Array.from(selectedPOSItems.values()).map(
        ({ item, quantity }) => ({ menuItemId: item.itemId, quantity })
      ),
      serviceItems: Array.from(selectedServiceItems.values()).map(
        ({ item, quantity }) => ({
          serviceItemId: item.serviceItemId,
          quantity,
        })
      ),
      bookingRoomId,
      source: "Staff",
    });
    handleCancel();
  };

  const handleCancel = () => {
    setSelectedPOSItems(new Map());
    setSelectedServiceItems(new Map());
    setSearchText("");
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[90vw] h-[90vh] flex flex-col p-0 gap-0 overflow-hidden">
        {/* Header */}
        <DialogHeader className="px-6 py-4 border-b flex flex-row items-center justify-between space-y-0 bg-muted/10">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <ShoppingCart className="h-6 w-6 text-primary" />
            </div>
            <div>
              <DialogTitle>Thêm khoản thu</DialogTitle>
              <p className="text-sm text-muted-foreground">
                Chọn món ăn hoặc dịch vụ để tính phí vào phòng
              </p>
            </div>
          </div>
          <div className="flex items-center gap-4 bg-card border px-4 py-2 rounded-lg shadow-sm">
            <div className="text-right">
              <p className="text-xs text-muted-foreground uppercase font-bold tracking-wider">
                Tổng cộng
              </p>
              <p className="text-xl font-bold text-primary">
                {formatMoney(totalAmount).vndFormatted}
              </p>
            </div>
          </div>
        </DialogHeader>

        <div className="flex flex-1 overflow-hidden">
          {/* LEFT: Main Content (Tabs & Grid) */}
          <div className="flex-1 flex flex-col border-r bg-muted/5">
            <div className="p-4 pb-0">
              <Tabs
                value={activeTab}
                onValueChange={(v) => setActiveTab(v as any)}
                className="w-full"
              >
                <TabsList className="w-full grid grid-cols-2 h-12">
                  <TabsTrigger value="pos" className="gap-2 text-base">
                    <Utensils className="h-4 w-4" /> Đồ ăn & Uống
                  </TabsTrigger>
                  <TabsTrigger value="service" className="gap-2 text-base">
                    <Wrench className="h-4 w-4" /> Dịch vụ Khác
                  </TabsTrigger>
                </TabsList>
              </Tabs>

              <div className="mt-4 flex gap-3">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Tìm kiếm nhanh..."
                    className="pl-9 bg-background"
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
                  onValueChange={(value) => {
                    if (value === "all") {
                      setSelectedCategoryCode(null);
                      setSelectedServiceType(null);
                    } else {
                      if (activeTab === "pos") {
                        setSelectedCategoryCode(value);
                      } else {
                        setSelectedServiceType(value);
                      }
                    }
                  }}
                >
                  <SelectTrigger className="w-[200px]">
                    <SelectValue placeholder="Chọn danh mục" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tất cả</SelectItem>
                    {(activeTab === "pos" ? menuCategories : serviceTypes).map(
                      (cat: any) => (
                        <SelectItem key={cat.code} value={cat.code}>
                          {cat.name}
                        </SelectItem>
                      )
                    )}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <ScrollArea className="flex-1 p-4">
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {(activeTab === "pos"
                  ? filteredMenuItems
                  : filteredServiceItems
                ).map((item: any) => {
                  const id =
                    activeTab === "pos" ? item.itemId : item.serviceItemId;
                  const price =
                    activeTab === "pos" ? item.price : item.basePrice;
                  const map =
                    activeTab === "pos"
                      ? selectedPOSItems
                      : selectedServiceItems;
                  const qty = map.get(id)?.quantity || 0;

                  return (
                    <Card
                      key={id}
                      className={cn(
                        "group relative flex flex-col justify-between overflow-hidden transition-all hover:shadow-md cursor-pointer border-2",
                        qty > 0
                          ? "border-primary bg-primary/5"
                          : "border-transparent hover:border-muted"
                      )}
                      onClick={() =>
                        updateQuantity(
                          map,
                          activeTab === "pos"
                            ? setSelectedPOSItems
                            : setSelectedServiceItems,
                          id,
                          1,
                          item
                        )
                      }
                    >
                      <div className="p-4 space-y-2">
                        <div className="flex justify-between items-start">
                          <h4 className="font-semibold line-clamp-2 text-sm min-h-[2.5em]">
                            {item.name}
                          </h4>
                          {qty > 0 && (
                            <Badge className="ml-2 shrink-0">{qty}</Badge>
                          )}
                        </div>
                        <p className="text-primary font-bold">
                          {formatMoney(price).vndFormatted}
                        </p>
                      </div>
                      {/* Hover Actions (Desktop) or Always Visible if Qty > 0 */}
                      <div
                        className={cn(
                          "flex items-center justify-between p-2 bg-background/80 backdrop-blur-sm border-t transition-opacity",
                          qty > 0
                            ? "opacity-100"
                            : "opacity-0 group-hover:opacity-100"
                        )}
                      >
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-8 w-8 text-destructive hover:bg-destructive/10"
                          onClick={(e) => {
                            e.stopPropagation();
                            updateQuantity(
                              map,
                              activeTab === "pos"
                                ? setSelectedPOSItems
                                : setSelectedServiceItems,
                              id,
                              -1
                            );
                          }}
                        >
                          <Minus className="h-4 w-4" />
                        </Button>
                        <span className="text-sm font-medium w-8 text-center">
                          {qty}
                        </span>
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-8 w-8 text-primary hover:bg-primary/10"
                          onClick={(e) => {
                            e.stopPropagation();
                            updateQuantity(
                              map,
                              activeTab === "pos"
                                ? setSelectedPOSItems
                                : setSelectedServiceItems,
                              id,
                              1,
                              item
                            );
                          }}
                        >
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>
                    </Card>
                  );
                })}
              </div>
            </ScrollArea>
          </div>

          {/* RIGHT: Cart Summary */}
          <div className="w-[350px] overflow-y-auto flex flex-col bg-card border-l shadow-xl z-2 px-2">
            <div className="p-4 border-b bg-muted/10">
              <h3 className="font-semibold flex items-center gap-2">
                <ShoppingBasketIcon className="h-4 w-4" />
                Đã chọn ({totalItemsCount})
              </h3>
            </div>

            {totalItemsCount === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center opacity-50 space-y-4 py-10">
                <div className="bg-muted p-4 rounded-full">
                  <ShoppingCart className="h-8 w-8" />
                </div>
                <p>Chưa có mục nào được chọn</p>
              </div>
            ) : (
              <div className="space-y-4">
                {/* POS Group */}
                {selectedPOSItems.size > 0 && (
                  <div className="space-y-2">
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider pl-1">
                      Đồ ăn & Uống
                    </p>
                    {Array.from(selectedPOSItems.values()).map(
                      ({ item, quantity }) => (
                        <CartItemRow
                          key={item.itemId}
                          name={item.name}
                          price={item.price}
                          quantity={quantity}
                          onUpdate={(d) =>
                            updateQuantity(
                              selectedPOSItems,
                              setSelectedPOSItems,
                              item.itemId,
                              d
                            )
                          }
                        />
                      )
                    )}
                  </div>
                )}
                {/* Service Group */}
                {selectedServiceItems.size > 0 && (
                  <div className="space-y-2">
                    {selectedPOSItems.size > 0 && <Separator />}
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider pl-1 mt-2">
                      Dịch vụ
                    </p>
                    {Array.from(selectedServiceItems.values()).map(
                      ({ item, quantity }) => (
                        <CartItemRow
                          key={item.serviceItemId}
                          name={item.name}
                          price={item.basePrice}
                          quantity={quantity}
                          onUpdate={(d) =>
                            updateQuantity(
                              selectedServiceItems,
                              setSelectedServiceItems,
                              item.serviceItemId,
                              d
                            )
                          }
                        />
                      )
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Footer Actions */}
            <div className="p-4 border-t bg-background space-y-3">
              <div className="flex justify-between items-center text-lg font-bold">
                <span>Tổng tiền:</span>
                <span className="text-primary">
                  {formatMoney(totalAmount).vndFormatted}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <Button variant="outline" onClick={handleCancel}>
                  Hủy bỏ
                </Button>
                <Button
                  onClick={handleConfirm}
                  disabled={totalItemsCount === 0 || isAdding}
                  className="shadow-md"
                >
                  {isAdding ? "Đang xử lý..." : "Xác nhận"}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// Helper Component for Cart Row
function CartItemRow({
  name,
  price,
  quantity,
  onUpdate,
}: {
  name: string;
  price: number;
  quantity: number;
  onUpdate: (d: number) => void;
}) {
  return (
    <div className="flex items-start justify-between gap-2 p-2 rounded-md hover:bg-muted/50 transition-colors group">
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium truncate">{name}</p>
        <p className="text-xs text-muted-foreground">
          {formatMoney(price).vndFormatted}
        </p>
      </div>
      <div className="flex items-center gap-1">
        <Button
          size="icon"
          variant="ghost"
          className="h-6 w-6"
          onClick={() => onUpdate(-1)}
        >
          <Minus className="h-3 w-3" />
        </Button>
        <span className="w-6 text-center text-sm font-mono">{quantity}</span>
        <Button
          size="icon"
          variant="ghost"
          className="h-6 w-6"
          onClick={() => onUpdate(1)}
        >
          <Plus className="h-3 w-3" />
        </Button>
      </div>
    </div>
  );
}

// Helper icon
