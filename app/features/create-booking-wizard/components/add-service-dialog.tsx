import { Check, ImageOff, Search, Sparkles, Utensils } from "lucide-react";
import { useMemo, useState } from "react";

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
import { ScrollArea } from "~/components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { Skeleton } from "~/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";
import { cn, formatMoney } from "~/lib/utils";
import { useMenuCategories } from "~/routes/menu/container/menu-categories/query.hooks";
import { useMenuList } from "~/routes/menu/container/menu/query.hooks";
import { useServiceTypes } from "~/routes/services/container/service-types/query.hooks";
import useServiceFilters from "~/routes/services/container/services/filter.hooks";

import { useServices } from "~/routes/services/container/services/query.hooks";

interface AddServiceDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAddService: (
    serviceId: string,
    itemType?: "ServiceItem" | "MenuItem"
  ) => void;
  selectedServiceIds: string[];
  checkinDate?: Date | string;
  checkoutDate?: Date | string;
}

export default function AddServiceDialog({
  open,
  onOpenChange,
  onAddService,
  selectedServiceIds,
}: AddServiceDialogProps) {
  const [activeTab, setActiveTab] = useState<"services" | "menu">("services");
  const [searchText, setSearchText] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");

  // Services data
  const { filters, updateFilter, filterServices } = useServiceFilters();

  const { data: serviceItems = [], isPending: isServicesLoading } = useServices(
    {
      includeInactive: filters.activeFilter !== "active",
      typeCode: filters.typeCode,
    }
  );

  const { data: menuItems = [], isPending: isMenuLoading } = useMenuList({
    categoryCode: categoryFilter,
  });

  // Client-side search filtering
  const filteredServices = filterServices(serviceItems);

  const filteredMenuItems = useMemo(() => {
    return menuItems.filter((item) => {
      const matchesSearch =
        searchText === "" ||
        item.name.toLowerCase().includes(searchText.toLowerCase()) ||
        item.code.toLowerCase().includes(searchText.toLowerCase()) ||
        (item.description &&
          item.description.toLowerCase().includes(searchText.toLowerCase()));
      return matchesSearch;
    });
  }, [menuItems, searchText]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[85vh] p-0 gap-0 overflow-y-auto outline-none">
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
            <div className="p-6">
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
                      service.serviceItemId
                    );
                    const hasImage =
                      service.imageUrls && service.imageUrls.length > 0;

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
                            : "border-border bg-card hover:bg-muted/40 hover:border-primary/30"
                        )}
                      >
                        {/* Thumbnail Image */}
                        <div className="shrink-0 relative h-20 w-20 rounded-lg overflow-hidden border bg-muted">
                          {hasImage ? (
                            <img
                              src={service.imageUrls![0]}
                              alt={service.name}
                              className="h-full w-full object-cover transition-transform group-hover:scale-105"
                            />
                          ) : (
                            <div className="h-full w-full flex items-center justify-center bg-muted/50 text-muted-foreground/30">
                              <ImageOff className="h-6 w-6" />
                            </div>
                          )}

                          {/* Unit Badge (Overlay on Image) */}
                          <div className="absolute bottom-0 left-0 right-0 bg-black/40 backdrop-blur-[2px] p-1 text-center">
                            <p className="text-[10px] font-medium text-white truncate">
                              {service.unitName}
                            </p>
                          </div>
                        </div>

                        {/* Content Info */}
                        <div className="flex-1 min-w-0 pt-0.5 space-y-1">
                          <div className="flex items-start justify-between gap-2">
                            <h4
                              className={cn(
                                "font-semibold text-sm truncate pr-4",
                                isSelected ? "text-primary" : "text-foreground"
                              )}
                            >
                              {service.name}
                            </h4>

                            {/* Checkmark Badge if selected */}
                            {isSelected && (
                              <div className="absolute top-3 right-3 h-5 w-5 rounded-full bg-primary text-primary-foreground flex items-center justify-center shadow-sm animate-in zoom-in-50">
                                <Check className="h-3 w-3" />
                              </div>
                            )}
                          </div>

                          <p className="text-xs text-muted-foreground line-clamp-2 min-h-[2.5em]">
                            {service.description || "Không có mô tả chi tiết."}
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
            <div className="p-6">
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
                    const isSelected = selectedServiceIds.includes(
                      menuItem.itemId
                    );
                    const hasImage =
                      menuItem.imageUrls && menuItem.imageUrls.length > 0;

                    return (
                      <button
                        key={menuItem.itemId}
                        type="button"
                        onClick={() =>
                          onAddService(menuItem.itemId, "MenuItem")
                        }
                        className={cn(
                          "group relative flex items-start gap-4 rounded-xl border p-3 text-left transition-all duration-200 outline-none",
                          isSelected
                            ? "border-primary bg-primary/5 shadow-[0_0_0_1px_hsl(var(--primary))]"
                            : "border-border bg-card hover:bg-muted/40 hover:border-primary/30"
                        )}
                      >
                        {/* Thumbnail Image */}
                        <div className="shrink-0 relative h-20 w-20 rounded-lg overflow-hidden border bg-muted">
                          {hasImage ? (
                            <img
                              src={menuItem.imageUrls![0]}
                              alt={menuItem.name}
                              className="h-full w-full object-cover transition-transform group-hover:scale-105"
                            />
                          ) : (
                            <div className="h-full w-full flex items-center justify-center bg-muted/50 text-muted-foreground/30">
                              <Utensils className="h-6 w-6" />
                            </div>
                          )}

                          {/* Unit Badge (Overlay on Image) */}
                          <div className="absolute bottom-0 left-0 right-0 bg-black/40 backdrop-blur-[2px] p-1 text-center">
                            <p className="text-[10px] font-medium text-white truncate">
                              {menuItem.unitName || "F&B"}
                            </p>
                          </div>
                        </div>

                        {/* Content Info */}
                        <div className="flex-1 min-w-0 pt-0.5 space-y-1">
                          <div className="flex items-start justify-between gap-2">
                            <h4
                              className={cn(
                                "font-semibold text-sm truncate pr-4",
                                isSelected ? "text-primary" : "text-foreground"
                              )}
                            >
                              {menuItem.name}
                            </h4>

                            {/* Checkmark Badge if selected */}
                            {isSelected && (
                              <div className="absolute top-3 right-3 h-5 w-5 rounded-full bg-primary text-primary-foreground flex items-center justify-center shadow-sm animate-in zoom-in-50">
                                <Check className="h-3 w-3" />
                              </div>
                            )}
                          </div>

                          <p className="text-xs text-muted-foreground line-clamp-2 min-h-[2.5em]">
                            {menuItem.description || "Không có mô tả chi tiết."}
                          </p>

                          <div className="flex items-center gap-2 pt-1">
                            <span className="text-sm font-bold font-mono text-foreground">
                              {formatMoney(menuItem.price).vndFormatted}
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
        </Tabs>

        {/* === FOOTER === */}
        <DialogFooter className="border-t bg-muted/20 px-6 py-4 flex items-center justify-between sm:justify-between">
          <div className="text-xs text-muted-foreground">
            {selectedServiceIds.length > 0 ? (
              <span className="text-primary font-medium flex items-center gap-2">
                <Badge variant="default" className="h-5 px-1.5 rounded-sm">
                  {selectedServiceIds.length}
                </Badge>
                dịch vụ đã chọn
              </span>
            ) : (
              <span>Chưa chọn dịch vụ nào</span>
            )}
          </div>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Xong
          </Button>
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
