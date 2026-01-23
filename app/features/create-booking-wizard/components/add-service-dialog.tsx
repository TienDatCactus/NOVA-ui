import { Check, Search, Sparkles, Utensils } from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";

import { Badge } from "~/components/ui/badge";
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
import { Counter } from "~/components/ui/shadcn-io/button-group/advanced/counter";
import { Skeleton } from "~/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";
import { cn, formatMoney } from "~/lib/utils";
import { useMenuList } from "~/routes/menu/container/menu/query.hooks";
import useServiceFilters from "~/routes/services/container/services/filter.hooks";

import { useServices } from "~/routes/services/container/services/query.hooks";

interface AddServiceDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAddService: (
    serviceId: string,
    itemType?: "ServiceItem" | "MenuItem",
    quantity?: number,
  ) => void;
  selectedServiceIds: string[];
  existingServices?: Array<{
    itemId: string;
    itemType: "ServiceItem" | "MenuItem";
    quantity: number;
  }>;
  checkinDate?: Date | string;
  checkoutDate?: Date | string;
}

export default function AddServiceDialog({
  open,
  onOpenChange,
  onAddService,
  selectedServiceIds,
  existingServices,
}: AddServiceDialogProps) {
  const [activeTab, setActiveTab] = useState<"services" | "menu">("services");
  const [searchText, setSearchText] = useState("");
  const [menuQuantities, setMenuQuantities] = useState<Record<string, number>>(
    {},
  );
  const [selectedMenuItems, setSelectedMenuItems] = useState<Set<string>>(
    new Set(),
  );

  // Lấy quantity từ existingServices nếu có, nếu không thì lấy từ menuQuantities hoặc mặc định là 1
  const getMenuQuantity = (itemId: string) => {
    const existing = existingServices?.find(
      (s) => s.itemId === itemId && s.itemType === "MenuItem",
    );
    if (existing) return existing.quantity;
    return menuQuantities[itemId] ?? 1;
  };

  const updateMenuQuantity = (itemId: string, quantity: number) => {
    setMenuQuantities((prev) => ({ ...prev, [itemId]: quantity }));
  };

  // Services data
  const { filters, updateFilter, filterServices } = useServiceFilters();

  const { data: serviceItems = [], isPending: isServicesLoading } = useServices(
    {
      includeInactive: filters.activeFilter !== "active",
      typeCode: filters.typeCode,
    },
  );

  const { data: menuItems = [], isPending: isMenuLoading } = useMenuList();

  const filteredServices = filterServices(serviceItems);

  const filteredMenuItems = useMemo(() => {
    return menuItems.filter((item) => {
      const name =
        item.translations?.find((t) => t.languageCode === "vi")?.name ||
        item.translations?.[0]?.name ||
        "";
      const description =
        item.translations?.find((t) => t.languageCode === "vi")?.description ||
        item.translations?.[0]?.description ||
        "";
      const matchesSearch =
        searchText === "" ||
        name.toLowerCase().includes(searchText.toLowerCase()) ||
        item.code.toLowerCase().includes(searchText.toLowerCase()) ||
        (description &&
          description.toLowerCase().includes(searchText.toLowerCase()));
      return matchesSearch;
    });
  }, [menuItems, searchText]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[85vh] p-0 gap-0 ">
        {/* === HEADER === */}
        <DialogHeader className="px-6 py-4 border-b bg-muted/20">
          <DialogTitle>Thêm Dịch Vụ & F&B</DialogTitle>
          <DialogDescription className="mt-0.5">
            Chọn tiện ích bổ sung hoặc món ăn cho đơn đặt phòng
          </DialogDescription>
        </DialogHeader>

        {/* === TABS === */}
        <Tabs
          value={activeTab}
          onValueChange={(v) => setActiveTab(v as any)}
          className="flex-1"
        >
          <div className="px-6 pt-4 border-b">
            <TabsList className="w-full grid grid-cols-2">
              <TabsTrigger value="services" className="gap-2">
                <Sparkles className="h-4 w-4" />
                Dịch vụ
              </TabsTrigger>
              <TabsTrigger value="menu" className="gap-2">
                <Utensils className="h-4 w-4" />
                F&B Menu
              </TabsTrigger>
            </TabsList>
          </div>

          {/* === SERVICES TAB === */}
          <TabsContent value="services" className="mt-0">
            {/* === TOOLBAR === */}
            <div className="p-4 border-b flex items-center gap-2 bg-background sticky top-0 z-10">
              <Input
                value={filters.searchText}
                startAddon={
                  <Search className="h-4 w-4 text-muted-foreground" />
                }
                placeholder="Tìm theo tên hoặc mã dịch vụ..."
                onChange={(e) => updateFilter("searchText", e.target.value)}
              />
            </div>

            {/* === CONTENT GRID === */}
            <div className="p-6 overflow-y-auto max-h-80">
              {isServicesLoading ? (
                <ServiceListSkeleton />
              ) : filteredServices.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 text-center text-muted-foreground">
                  <div className="h-12 w-12 rounded-full bg-muted/50 flex items-center justify-center mb-3">
                    <Search className="h-5 w-5 opacity-50" />
                  </div>
                  <p>Không tìm thấy dịch vụ nào phù hợp.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {filteredServices.map((service) => {
                    const isSelected = selectedServiceIds.includes(
                      service.serviceItemId,
                    );
                    return (
                      <button
                        key={service.serviceItemId}
                        type="button"
                        onClick={() =>
                          onAddService(service.serviceItemId, "ServiceItem")
                        }
                        className={cn(
                          "group relative flex items-start gap-4 rounded-xl border p-3 text-left transition-all duration-200 outline-none",
                          isSelected
                            ? "border-primary bg-primary/5 shadow-[0_0_0_1px_hsl(var(--primary))]"
                            : "border-border bg-card hover:bg-muted/40 hover:border-primary/30",
                        )}
                      >
                        {/* Content Info */}
                        <div className="flex-1 min-w-0 pt-0.5 space-y-1">
                          <div className="flex items-start justify-between gap-2">
                            <h4
                              className={cn(
                                "font-semibold text-sm truncate pr-4",
                                isSelected ? "text-primary" : "text-foreground",
                              )}
                            >
                              {service.translations?.find(
                                (t) => t.languageCode === "vi",
                              )?.name ||
                                service.translations?.[0]?.name ||
                                ""}
                            </h4>
                            {isSelected && (
                              <div className="absolute top-3 right-3 h-5 w-5 rounded-full bg-primary text-primary-foreground flex items-center justify-center shadow-sm animate-in zoom-in-50">
                                <Check className="h-3 w-3" />
                              </div>
                            )}
                          </div>

                          <p className="text-xs text-muted-foreground line-clamp-2 min-h-[2.5em]">
                            {service.translations?.find(
                              (t) => t.languageCode === "vi",
                            )?.description ||
                              service.translations?.[0]?.description ||
                              "Không có mô tả chi tiết."}
                          </p>
                          <div className="flex items-center gap-2 pt-1">
                            <span className="text-sm font-bold font-mono text-foreground">
                              {formatMoney(service.basePrice).vndFormatted}
                            </span>
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </TabsContent>

          {/* === MENU TAB === */}
          <TabsContent value="menu" className="mt-0">
            {/* === TOOLBAR === */}
            <div className="p-4 border-b flex items-center gap-2 bg-background sticky top-0 z-10">
              <Input
                value={searchText}
                startAddon={
                  <Search className="h-4 w-4 text-muted-foreground" />
                }
                placeholder="Tìm theo tên món ăn..."
                onChange={(e) => setSearchText(e.target.value)}
              />
            </div>

            {/* === CONTENT GRID === */}
            <div className="p-6 overflow-y-auto max-h-80">
              {isMenuLoading ? (
                <ServiceListSkeleton />
              ) : filteredMenuItems.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 text-center text-muted-foreground">
                  <div className="h-12 w-12 rounded-full bg-muted/50 flex items-center justify-center mb-3">
                    <Search className="h-5 w-5 opacity-50" />
                  </div>
                  <p>Không tìm thấy món ăn nào phù hợp.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {filteredMenuItems.map((menuItem) => {
                    const isSelected =
                      selectedMenuItems.has(menuItem.itemId) ||
                      selectedServiceIds.includes(menuItem.itemId);

                    const isAvailable = menuItem.maxQuantityAvailable! > 0;
                    const currentQuantity = getMenuQuantity(menuItem.itemId);
                    const maxAvailable = menuItem.maxQuantityAvailable ?? 0;

                    return (
                      <div
                        key={menuItem.itemId}
                        className={cn(
                          "group relative flex flex-col gap-3 rounded-xl border p-3 transition-all duration-200",
                          isSelected
                            ? "border-primary bg-primary/5 shadow-[0_0_0_1px_hsl(var(--primary))]"
                            : "border-border bg-card hover:bg-muted/40 hover:border-primary/30",
                          !isAvailable ? "opacity-50" : "",
                        )}
                      >
                        <button
                          type="button"
                          disabled={!isAvailable}
                          onClick={() => {
                            // Toggle selection
                            setSelectedMenuItems((prev) => {
                              const next = new Set(prev);
                              if (next.has(menuItem.itemId)) {
                                next.delete(menuItem.itemId);
                              } else {
                                next.add(menuItem.itemId);
                              }
                              return next;
                            });
                          }}
                          className="flex items-start gap-4 text-left w-full"
                        >
                          {/* Content Info */}
                          <div className="flex-1 min-w-0 pt-0.5 space-y-1">
                            <div className="flex items-start justify-between gap-2">
                              <h4
                                className={cn(
                                  "font-semibold text-sm truncate pr-4",
                                  isSelected
                                    ? "text-primary"
                                    : "text-foreground",
                                )}
                              >
                                {menuItem.translations?.find(
                                  (t) => t.languageCode === "vi",
                                )?.name ||
                                  menuItem.translations?.[0]?.name ||
                                  ""}
                              </h4>

                              {/* Checkmark Badge if selected */}
                              {isSelected && (
                                <div className="absolute top-3 right-3 h-5 w-5 rounded-full bg-primary text-primary-foreground flex items-center justify-center shadow-sm animate-in zoom-in-50">
                                  <Check className="h-3 w-3" />
                                </div>
                              )}
                            </div>

                            <p className="text-xs text-muted-foreground line-clamp-2 min-h-[2.5em]">
                              {menuItem.translations?.find(
                                (t) => t.languageCode === "vi",
                              )?.description ||
                                menuItem.translations?.[0]?.description ||
                                "Không có mô tả chi tiết."}
                            </p>

                            <div className="flex items-center gap-2 pt-1">
                              <span className="text-sm font-bold font-mono text-foreground">
                                {formatMoney(menuItem.price).vndFormatted}
                              </span>
                            </div>
                          </div>
                        </button>

                        {/* Quantity Counter - only show if item is available */}
                        {isAvailable && (
                          <div className="flex items-center justify-between pt-2 border-t">
                            <span className="text-xs text-muted-foreground">
                              Số lượng
                              {maxAvailable < 999 && (
                                <span className="ml-1 text-primary font-medium">
                                  (Còn {maxAvailable})
                                </span>
                              )}
                            </span>
                            <Counter
                              value={currentQuantity}
                              className="w-40"
                              onChange={(value) => {
                                if (value > maxAvailable) {
                                  const name =
                                    menuItem.translations?.find(
                                      (t) => t.languageCode === "vi",
                                    )?.name ||
                                    menuItem.translations?.[0]?.name ||
                                    "";
                                  toast.error(
                                    `Chỉ còn ${maxAvailable} ${name}`,
                                    {
                                      description: "Vượt quá số lượng khả dụng",
                                    },
                                  );
                                  return;
                                }
                                updateMenuQuantity(menuItem.itemId, value);
                              }}
                              minValue={1}
                              maxValue={maxAvailable}
                            />
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>

        {/* === FOOTER === */}
        <DialogFooter className="border-t bg-muted/20 px-6 py-4 flex items-center justify-between sm:justify-between">
          <div className="text-xs text-muted-foreground">
            {activeTab === "menu" && selectedMenuItems.size > 0 ? (
              <span className="text-primary font-medium flex items-center gap-2">
                <Badge variant="default" className="h-5 px-1.5 rounded-sm">
                  {selectedMenuItems.size}
                </Badge>
                món đã chọn
              </span>
            ) : selectedServiceIds.length > 0 ? (
              <span className="text-primary font-medium flex items-center gap-2">
                <Badge variant="default" className="h-5 px-1.5 rounded-sm">
                  {selectedServiceIds.length}
                </Badge>
                dịch vụ đã thêm
              </span>
            ) : (
              <span>Chưa chọn dịch vụ nào</span>
            )}
          </div>
          <div className="flex gap-2">
            {activeTab === "menu" && selectedMenuItems.size > 0 && (
              <Button
                onClick={() => {
                  // Validate and add all selected menu items
                  let hasError = false;
                  selectedMenuItems.forEach((itemId) => {
                    const menuItem = filteredMenuItems.find(
                      (m) => m.itemId === itemId,
                    );
                    if (menuItem) {
                      const quantity = getMenuQuantity(itemId);
                      const maxAvailable = menuItem.maxQuantityAvailable ?? 0;

                      if (quantity > maxAvailable) {
                        const name =
                          menuItem.translations?.find(
                            (t) => t.languageCode === "vi",
                          )?.name ||
                          menuItem.translations?.[0]?.name ||
                          "";
                        toast.error(
                          `${name}: Chỉ còn ${maxAvailable} khả dụng`,
                          { description: "Vui lòng giảm số lượng." },
                        );
                        hasError = true;
                      } else {
                        onAddService(itemId, "MenuItem", quantity);
                      }
                    }
                  });

                  if (!hasError) {
                    setSelectedMenuItems(new Set());
                    setMenuQuantities({});
                    onOpenChange(false);
                  }
                }}
                className="min-w-[100px]"
              >
                <Check className="mr-2 h-4 w-4" />
                Thêm món
              </Button>
            )}
            <Button
              variant="outline"
              onClick={() => {
                setSelectedMenuItems(new Set());
                setMenuQuantities({});
                onOpenChange(false);
              }}
            >
              {activeTab === "menu" && selectedMenuItems.size > 0
                ? "Hủy"
                : "Đóng"}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// === LOADING SKELETON ===
function ServiceListSkeleton() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      {[1, 2, 3, 4, 5, 6].map((i) => (
        <div key={i} className="flex items-start gap-4 rounded-xl border p-3">
          <Skeleton className="h-20 w-20 rounded-lg shrink-0" />
          <div className="flex-1 space-y-2 pt-1">
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-3 w-full" />
            <Skeleton className="h-3 w-1/2" />
          </div>
        </div>
      ))}
    </div>
  );
}
