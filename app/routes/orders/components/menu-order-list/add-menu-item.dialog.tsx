import { Search, Utensils } from "lucide-react";
import { useMemo, useState } from "react";
import { Button } from "~/components/ui/button";
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
import { Skeleton } from "~/components/ui/skeleton";
import { formatMoney } from "~/lib/utils";
import { useMenuCategories } from "~/routes/menu/container/menu-categories/query.hooks";
import { useMenuList } from "~/routes/menu/container/menu/query.hooks";
import type { MenuListItemDto } from "~/services/api/menu/dto";
import { Badge } from "~/components/ui/badge";
import { Card } from "~/components/ui/card";
import { Counter } from "~/components/ui/shadcn-io/button-group/advanced/counter";
import Image from "~/components/ui/image";

interface AddMenuItemDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: (menuItemId: string, quantity: number, unitPrice: number) => void;
  isAdding?: boolean;
}

export default function AddMenuItemDialog({
  open,
  onOpenChange,
  onConfirm,
  isAdding,
}: AddMenuItemDialogProps) {
  const [selectedCategoryCode, setSelectedCategoryCode] = useState<
    string | null
  >(null);
  const [searchText, setSearchText] = useState("");
  const [selectedItem, setSelectedItem] = useState<MenuListItemDto | null>(
    null
  );
  const [quantity, setQuantity] = useState(1);

  const { data: menuCategories = [], isPending: isLoadingCategories } =
    useMenuCategories({}, true);

  const { data: menuItems = [], isPending: isLoadingMenu } = useMenuList({
    categoryCode: selectedCategoryCode || undefined,
  });

  const filteredMenuItems = useMemo(() => {
    if (!searchText) return menuItems;
    const lower = searchText.toLowerCase();
    return menuItems.filter((item) => {
      const name =
        item.translations?.find((t) => t.languageCode === "vi")?.name ||
        item.translations?.[0]?.name ||
        "";
      const description =
        item.translations?.find((t) => t.languageCode === "vi")?.description ||
        item.translations?.[0]?.description ||
        "";
      return (
        name.toLowerCase().includes(lower) ||
        description?.toLowerCase().includes(lower)
      );
    });
  }, [menuItems, searchText]);

  const handleConfirm = () => {
    if (!selectedItem) return;

    onConfirm(selectedItem.itemId, quantity, selectedItem.price);

    // Reset state after confirming
    setSelectedItem(null);
    setQuantity(1);
    setSearchText("");
    setSelectedCategoryCode(null);
  };

  const handleCancel = () => {
    setSelectedItem(null);
    setQuantity(1);
    setSearchText("");
    setSelectedCategoryCode(null);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Utensils className="h-5 w-5" />
            Thêm món vào đơn hàng
          </DialogTitle>
          <DialogDescription>
            Chọn món ăn và số lượng để thêm vào đơn hàng hiện tại
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-12 gap-4 py-4">
          {/* Left: Categories */}
          <div className="col-span-3 space-y-2">
            <Label className="text-sm font-semibold">Danh mục</Label>
            <div className="max-h-[50vh] overflow-y-auto pr-2">
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
                    className="w-full justify-start"
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
                      className="w-full justify-start"
                      onClick={() => setSelectedCategoryCode(category.code)}
                    >
                      {category.name}
                    </Button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Middle: Menu Items List */}
          <div className="col-span-6 space-y-2 flex flex-col">
            <div className="space-y-2">
              <Label className="text-sm font-semibold">Tìm kiếm món ăn</Label>
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
            <div className="flex-1 overflow-y-auto max-h-[40vh] pr-2">
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
                    {searchText
                      ? "Không tìm thấy món ăn nào"
                      : "Chưa có món ăn trong danh mục này"}
                  </p>
                </div>
              ) : (
                <div className="space-y-2">
                  {filteredMenuItems.map((item) => {
                    const isOutOfStock = item.maxQuantityAvailable === 0;
                    const isLowStock =
                      (item.maxQuantityAvailable || 0) > 0 &&
                      (item.maxQuantityAvailable || 0) <= 5;

                    return (
                      <Card
                        key={item.itemId}
                        className={`p-3 cursor-pointer transition-all hover:shadow-md ${
                          selectedItem?.itemId === item.itemId
                            ? "border-primary bg-primary/5"
                            : ""
                        } ${isOutOfStock ? "opacity-60" : ""}`}
                        onClick={() => !isOutOfStock && setSelectedItem(item)}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <p className="font-medium text-sm truncate">
                                {item.translations?.find(
                                  (t) => t.languageCode === "vi"
                                )?.name ||
                                  item.translations?.[0]?.name ||
                                  ""}
                              </p>
                              {!item.active && (
                                <Badge
                                  variant="destructive"
                                  className="text-xs"
                                >
                                  Hết món
                                </Badge>
                              )}
                              {isOutOfStock && item.active && (
                                <Badge
                                  variant="destructive"
                                  className="text-xs"
                                >
                                  Hết hàng
                                </Badge>
                              )}
                              {isLowStock && item.active && (
                                <Badge variant="warning" className="text-xs">
                                  Còn {item.maxQuantityAvailable}
                                </Badge>
                              )}
                            </div>
                            {(item.translations?.find(
                              (t) => t.languageCode === "vi"
                            )?.description ||
                              item.translations?.[0]?.description) && (
                              <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                                {item.translations?.find(
                                  (t) => t.languageCode === "vi"
                                )?.description ||
                                  item.translations?.[0]?.description}
                              </p>
                            )}
                            <p className="text-sm font-semibold text-primary mt-2">
                              {formatMoney(item.price).vndFormatted}
                            </p>
                          </div>
                          {item.imageUrls && item.imageUrls.length > 0 && (
                            <Image
                              src={item.imageUrls[0]}
                              alt={
                                item.translations?.find(
                                  (t) => t.languageCode === "vi"
                                )?.name ||
                                item.translations?.[0]?.name ||
                                ""
                              }
                              className="w-16 h-16 object-cover rounded"
                            />
                          )}
                        </div>
                      </Card>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Right: Selected Item & Quantity */}
          <div className="col-span-3 space-y-4">
            <Label className="text-sm font-semibold">Món đã chọn</Label>
            {selectedItem ? (
              <Card className="p-4 space-y-4">
                <div>
                  <p className="font-medium text-sm">
                    {selectedItem.translations?.find(
                      (t) => t.languageCode === "vi"
                    )?.name ||
                      selectedItem.translations?.[0]?.name ||
                      ""}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {formatMoney(selectedItem.price).vndFormatted}
                  </p>
                  {selectedItem.maxQuantityAvailable !== undefined && (
                    <Badge variant="secondary" className="text-xs mt-2">
                      Còn lại: {selectedItem.maxQuantityAvailable}
                    </Badge>
                  )}
                </div>

                <div className="space-y-2">
                  <Label className="text-xs">Số lượng</Label>
                  <div className="flex items-center gap-2">
                    <Counter
                      value={quantity}
                      onChange={(value) => {
                        const newValue = Math.max(1, value || 1);
                        if (
                          selectedItem.maxQuantityAvailable !== undefined &&
                          newValue > (selectedItem.maxQuantityAvailable || 0)
                        ) {
                          return; // Prevent exceeding max
                        }
                        setQuantity(newValue);
                      }}
                    />
                  </div>
                  {(selectedItem.maxQuantityAvailable || 0) !== undefined &&
                    quantity >= (selectedItem.maxQuantityAvailable || 0) && (
                      <p className="text-xs text-warning">
                        Đã đạt số lượng tối đa
                      </p>
                    )}
                </div>

                <div className="pt-2 border-t space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="text-muted-foreground">Đơn giá:</span>
                    <span>{formatMoney(selectedItem.price).vndFormatted}</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-muted-foreground">Số lượng:</span>
                    <span>{quantity}</span>
                  </div>
                  <div className="flex justify-between text-sm font-semibold pt-1 border-t">
                    <span>Tổng:</span>
                    <span className="text-primary">
                      {formatMoney(selectedItem.price * quantity).vndFormatted}
                    </span>
                  </div>
                </div>
              </Card>
            ) : (
              <Card className="p-4">
                <div className="flex flex-col items-center justify-center h-40 text-center">
                  <Utensils className="h-8 w-8 text-muted-foreground mb-2" />
                  <p className="text-xs text-muted-foreground">
                    Chọn món ăn từ danh sách bên trái
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
            disabled={!selectedItem || isAdding || !selectedItem.active}
          >
            {isAdding ? "Đang thêm..." : "Thêm món"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
