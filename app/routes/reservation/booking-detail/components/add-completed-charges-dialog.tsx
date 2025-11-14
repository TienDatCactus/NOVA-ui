import { Search, Utensils, Info, Wrench } from "lucide-react";
import { useMemo, useState } from "react";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import { Card } from "~/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Counter } from "~/components/ui/shadcn-io/button-group/advanced/counter";
import { Skeleton } from "~/components/ui/skeleton";
import { Alert, AlertDescription } from "~/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";
import { formatMoney } from "~/lib/utils";
import { useMenuCategories } from "~/routes/menu/container/menu-categories/query.hooks";
import { useMenuList } from "~/routes/menu/container/menu/query.hooks";
import type { MenuListItemDto } from "~/services/api/menu/dto";
import type {} from "~/services/api/services/dto";
import type { BookingSchema } from "~/services/api/booking/booking.schema";
import type z from "zod";

interface AddCompletedChargesDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: (data: {
    posItems?: z.infer<
      typeof BookingSchema.StaffAddCompletedChargesRequestSchema.shape.posItems
    >;
    serviceItems?: z.infer<
      typeof BookingSchema.StaffAddCompletedChargesRequestSchema.shape.serviceItems
    >;
  }) => void;
  isAdding?: boolean;
  bookingRoomId?: string; // Optional: for room-specific charges
}

export default function AddCompletedChargesDialog({
  open,
  onOpenChange,
  onConfirm,
  isAdding,
  bookingRoomId,
}: AddCompletedChargesDialogProps) {
  const [itemType, setItemType] = useState<"POS" | "Service">("POS");
  const [selectedCategoryCode, setSelectedCategoryCode] = useState<
    string | null
  >(null);
  const [searchText, setSearchText] = useState("");
  const [selectedPOSItems, setSelectedPOSItems] = useState<
    Map<string, { item: MenuListItemDto; quantity: number }>
  >(new Map());
  const [selectedServiceItems, setSelectedServiceItems] = useState<
    Map<string, { item: any; quantity: number }>
  >(new Map());

  const selectedItems =
    itemType === "POS" ? selectedPOSItems : selectedServiceItems;
  const setSelectedItems =
    itemType === "POS" ? setSelectedPOSItems : setSelectedServiceItems;

  const { data: menuCategories = [], isPending: isLoadingCategories } =
    useMenuCategories({}, true);

  const { data: menuItems = [], isPending: isLoadingMenu } = useMenuList({
    categoryCode: selectedCategoryCode || undefined,
  });

  const filteredMenuItems = useMemo(() => {
    if (!searchText) return menuItems;
    const lower = searchText.toLowerCase();
    return menuItems.filter(
      (item) =>
        item.name.toLowerCase().includes(lower) ||
        item.description?.toLowerCase().includes(lower)
    );
  }, [menuItems, searchText]);

  const totalItems = useMemo(() => {
    return Array.from(selectedItems.values()).reduce(
      (sum, { quantity }) => sum + quantity,
      0
    );
  }, [selectedItems]);

  const totalAmount = useMemo(() => {
    return Array.from(selectedItems.values()).reduce(
      (sum, { item, quantity }) => sum + item.price * quantity,
      0
    );
  }, [selectedItems]);

  const handleToggleItem = (item: MenuListItemDto) => {
    const newSelectedItems = new Map(selectedItems);
    if (newSelectedItems.has(item.itemId)) {
      newSelectedItems.delete(item.itemId);
    } else {
      newSelectedItems.set(item.itemId, { item, quantity: 1 });
    }
    setSelectedItems(newSelectedItems);
  };

  const handleUpdateQuantity = (itemId: string, quantity: number) => {
    const newSelectedItems = new Map(selectedItems);
    const existing = newSelectedItems.get(itemId);
    if (existing) {
      if (quantity <= 0) {
        newSelectedItems.delete(itemId);
      } else {
        newSelectedItems.set(itemId, { ...existing, quantity });
      }
      setSelectedItems(newSelectedItems);
    }
  };

  const handleConfirm = () => {
    if (selectedPOSItems.size === 0 && selectedServiceItems.size === 0) return;

    const posItems = Array.from(selectedPOSItems.values()).map(
      ({ item, quantity }) => ({
        menuItemId: item.itemId,
        quantity,
      })
    );

    const serviceItems = Array.from(selectedServiceItems.values()).map(
      ({ item, quantity }) => ({
        serviceItemId: item.itemId,
        quantity,
      })
    );

    onConfirm({
      posItems: posItems.length > 0 ? posItems : undefined,
      serviceItems: serviceItems.length > 0 ? serviceItems : undefined,
    });

    // Reset state
    setSelectedPOSItems(new Map());
    setSelectedServiceItems(new Map());
    setSearchText("");
    setSelectedCategoryCode(null);
    setItemType("POS");
    onOpenChange(false);
  };

  const handleCancel = () => {
    setSelectedPOSItems(new Map());
    setSelectedServiceItems(new Map());
    setSearchText("");
    setSelectedCategoryCode(null);
    setItemType("POS");
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Utensils className="h-5 w-5" />
            Thêm phí hoàn thành (Completed Charges)
          </DialogTitle>
          <DialogDescription>
            Thêm các món đã sử dụng nhưng chưa order trước (minibar, snacks...)
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-12 gap-4 py-2">
          {/* Left: Categories */}
          <div className="col-span-3 space-y-2">
            <Label className="text-sm font-semibold">Danh mục</Label>
            <div>
              {isLoadingCategories ? (
                <div className="space-y-2">
                  {[...Array(5)].map((_, i) => (
                    <Skeleton key={i} className="h-10 w-full" />
                  ))}
                </div>
              ) : (
                <div className="space-y-1">
                  <Button
                    type="button"
                    variant={
                      selectedCategoryCode === null ? "secondary" : "ghost"
                    }
                    className="w-full justify-start text-sm"
                    onClick={() => setSelectedCategoryCode(null)}
                  >
                    Tất cả
                  </Button>
                  {menuCategories.map((category) => (
                    <Button
                      key={category.code}
                      type="button"
                      variant={
                        selectedCategoryCode === category.code
                          ? "secondary"
                          : "ghost"
                      }
                      className="w-full justify-start text-sm"
                      onClick={() => setSelectedCategoryCode(category.code)}
                    >
                      {category.name}
                    </Button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Center: Menu Items */}
          <div className="col-span-6 space-y-2 max-h-[50vh] flex flex-col">
            <div className="space-y-2">
              <Label className="text-sm font-semibold">Chọn món</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Tìm kiếm món ăn..."
                  value={searchText}
                  onChange={(e) => setSearchText(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>
            <div className="flex-1 p-2 overflow-y-auto">
              {isLoadingMenu ? (
                <div className="space-y-2">
                  {[...Array(6)].map((_, i) => (
                    <Skeleton key={i} className="h-20 w-full" />
                  ))}
                </div>
              ) : filteredMenuItems.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center py-12">
                  <Utensils className="h-12 w-12 text-muted-foreground mb-2" />
                  <p className="text-sm text-muted-foreground">
                    Không tìm thấy món ăn nào
                  </p>
                </div>
              ) : (
                <div className="space-y-2">
                  {filteredMenuItems.map((item) => {
                    const isSelected = selectedItems.has(item.itemId);
                    const selectedData = selectedItems.get(item.itemId);

                    return (
                      <Card
                        key={item.itemId}
                        className={`p-3 cursor-pointer transition-all hover:shadow-md ${
                          isSelected ? "border-primary bg-primary/5" : ""
                        }`}
                        onClick={() => handleToggleItem(item)}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <p className="font-medium text-sm truncate">
                                {item.name}
                              </p>
                              {!item.active && (
                                <Badge
                                  variant="destructive"
                                  className="text-xs"
                                >
                                  Hết
                                </Badge>
                              )}
                              {isSelected && (
                                <Badge variant="default" className="text-xs">
                                  ✓ {selectedData?.quantity}
                                </Badge>
                              )}
                            </div>
                            {item.description && (
                              <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                                {item.description}
                              </p>
                            )}
                            <p className="text-sm font-semibold text-primary mt-2">
                              {formatMoney(item.price).vndFormatted}
                            </p>
                          </div>
                        </div>
                      </Card>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Right: Selected Items Summary */}
          <div className="col-span-3 space-y-4">
            <Label className="text-sm font-semibold">
              Món đã chọn ({selectedItems.size})
            </Label>
            {selectedItems.size > 0 ? (
              <div className="space-y-2 max-h-[50vh] overflow-y-auto">
                {Array.from(selectedItems.values()).map(
                  ({ item, quantity }) => (
                    <Card key={item.itemId} className="p-3 space-y-2">
                      <div>
                        <p className="font-medium text-xs">{item.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {formatMoney(item.price).vndFormatted}
                        </p>
                      </div>
                      <div className="flex items-center justify-between gap-2">
                        <Label className="text-xs">SL:</Label>
                        <Counter
                          value={quantity}
                          onChange={(value) =>
                            handleUpdateQuantity(item.itemId, value || 0)
                          }
                        />
                      </div>
                      <div className="pt-2 border-t">
                        <p className="text-xs font-semibold text-primary">
                          {formatMoney(item.price * quantity).vndFormatted}
                        </p>
                      </div>
                    </Card>
                  )
                )}

                {/* Total Summary */}
                <Card className="p-3 bg-muted/50 border-primary">
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs">
                      <span className="text-muted-foreground">Tổng món:</span>
                      <span className="font-semibold">{totalItems}</span>
                    </div>
                    <div className="flex justify-between text-sm font-semibold pt-1 border-t">
                      <span>Tổng tiền:</span>
                      <span className="text-primary">
                        {formatMoney(totalAmount).vndFormatted}
                      </span>
                    </div>
                  </div>
                </Card>
              </div>
            ) : (
              <Card className="p-4">
                <div className="flex flex-col items-center justify-center h-40 text-center">
                  <Utensils className="h-8 w-8 text-muted-foreground mb-2" />
                  <p className="text-xs text-muted-foreground">
                    Chưa chọn món nào
                  </p>
                </div>
              </Card>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={handleCancel}>
            Hủy
          </Button>
          <Button
            type="button"
            onClick={handleConfirm}
            disabled={selectedItems.size === 0 || isAdding}
          >
            {isAdding ? "Đang thêm..." : `Thêm ${selectedItems.size} món`}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
