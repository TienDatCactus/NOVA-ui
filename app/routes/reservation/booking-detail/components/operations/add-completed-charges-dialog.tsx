import { Search, Utensils, Info, Wrench, Check } from "lucide-react";
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
import { useServices } from "~/routes/services/container/services/query.hooks";
import type { MenuListItemDto } from "~/services/api/menu/dto";
import type { ServiceItem } from "~/services/api/services/dto";
import { useServiceTypes } from "~/routes/services/container/service-types/query.hooks";

interface AddCompletedChargesDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: (data: {
    posItems?: Array<{ menuItemId: string; quantity: number }>;
    serviceItems?: Array<{ serviceItemId: string; quantity: number }>;
    bookingRoomId?: string;
    source?: string;
  }) => void;
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

  const { data: menuCategories = [], isPending: isLoadingCategories } =
    useMenuCategories({}, true);
  const { data: serviceTypes = [], isPending: isLoadingServiceTypes } =
    useServiceTypes({}, { enabled: true });

  const { data: menuItems = [], isPending: isLoadingMenu } = useMenuList({
    categoryCode: selectedCategoryCode || undefined,
  });

  const { data: serviceItems = [], isPending: isLoadingServices } = useServices(
    {
      typeCode: selectedServiceType || undefined,
    }
  );

  // Filtered items based on search
  const filteredMenuItems = useMemo(() => {
    if (!searchText) return menuItems;
    const lower = searchText.toLowerCase();
    return menuItems.filter(
      (item) =>
        item.name.toLowerCase().includes(lower) ||
        item.description?.toLowerCase().includes(lower)
    );
  }, [menuItems, searchText]);

  const filteredServiceItems = useMemo(() => {
    if (!searchText) return serviceItems;
    const lower = searchText.toLowerCase();
    return serviceItems.filter(
      (item) =>
        item.name.toLowerCase().includes(lower) ||
        item.description?.toLowerCase().includes(lower)
    );
  }, [serviceItems, searchText]);

  // Calculate totals
  const totalPOSCount = useMemo(() => {
    return Array.from(selectedPOSItems.values()).reduce(
      (sum, { quantity }) => sum + quantity,
      0
    );
  }, [selectedPOSItems]);

  const totalServiceCount = useMemo(() => {
    return Array.from(selectedServiceItems.values()).reduce(
      (sum, { quantity }) => sum + quantity,
      0
    );
  }, [selectedServiceItems]);

  const totalPOSAmount = useMemo(() => {
    return Array.from(selectedPOSItems.values()).reduce(
      (sum, { item, quantity }) => sum + item.price * quantity,
      0
    );
  }, [selectedPOSItems]);

  const totalServiceAmount = useMemo(() => {
    return Array.from(selectedServiceItems.values()).reduce(
      (sum, { item, quantity }) => sum + item.basePrice * quantity,
      0
    );
  }, [selectedServiceItems]);

  const totalItemsCount = selectedPOSItems.size + selectedServiceItems.size;

  // Handlers for POS items
  const handleTogglePOSItem = (item: MenuListItemDto) => {
    const newSelectedItems = new Map(selectedPOSItems);
    if (newSelectedItems.has(item.itemId)) {
      newSelectedItems.delete(item.itemId);
    } else {
      newSelectedItems.set(item.itemId, { item, quantity: 1 });
    }
    setSelectedPOSItems(newSelectedItems);
  };

  const handleUpdatePOSQuantity = (itemId: string, quantity: number) => {
    const newSelectedItems = new Map(selectedPOSItems);
    const existing = newSelectedItems.get(itemId);
    if (existing) {
      if (quantity <= 0) {
        newSelectedItems.delete(itemId);
      } else {
        newSelectedItems.set(itemId, { ...existing, quantity });
      }
      setSelectedPOSItems(newSelectedItems);
    }
  };

  const handleToggleServiceItem = (item: ServiceItem) => {
    const newSelectedItems = new Map(selectedServiceItems);
    if (newSelectedItems.has(item.serviceItemId)) {
      newSelectedItems.delete(item.serviceItemId);
    } else {
      newSelectedItems.set(item.serviceItemId, { item, quantity: 1 });
    }
    setSelectedServiceItems(newSelectedItems);
  };

  const handleUpdateServiceQuantity = (itemId: string, quantity: number) => {
    const newSelectedItems = new Map(selectedServiceItems);
    const existing = newSelectedItems.get(itemId);
    if (existing) {
      if (quantity <= 0) {
        newSelectedItems.delete(itemId);
      } else {
        newSelectedItems.set(itemId, { ...existing, quantity });
      }
      setSelectedServiceItems(newSelectedItems);
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
        serviceItemId: item.serviceItemId,
        quantity,
      })
    );

    onConfirm({
      posItems: posItems.length > 0 ? posItems : undefined,
      serviceItems: serviceItems.length > 0 ? serviceItems : undefined,
      bookingRoomId: bookingRoomId,
      source: "Staff",
    });

    handleCancel();
  };

  const handleCancel = () => {
    setSelectedPOSItems(new Map());
    setSelectedServiceItems(new Map());
    setSearchText("");
    setSelectedCategoryCode(null);
    setActiveTab("pos");
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Utensils className="h-5 w-5" />
            Thêm phí hoàn thành (Completed Charges)
          </DialogTitle>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Món ăn:</span>
            <span className="font-semibold">
              {totalPOSCount} món - {formatMoney(totalPOSAmount).vndFormatted}
            </span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Dịch vụ:</span>
            <span className="font-semibold">
              {totalServiceCount} dịch vụ -{" "}
              {formatMoney(totalServiceAmount).vndFormatted}
            </span>
          </div>
        </DialogHeader>

        <Tabs
          value={activeTab}
          onValueChange={(v) => setActiveTab(v as "pos" | "service")}
          className="flex-1 flex flex-col "
        >
          <TabsList className="grid w-full max-w-md grid-cols-2">
            <TabsTrigger value="pos" className="flex items-center gap-2">
              <Utensils className="h-4 w-4" />
              Đồ ăn/Đồ uống ({selectedPOSItems.size})
            </TabsTrigger>
            <TabsTrigger value="service" className="flex items-center gap-2">
              <Wrench className="h-4 w-4" />
              Dịch vụ ({selectedServiceItems.size})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="pos" className="flex-1 mt-4">
            <div className="grid grid-cols-12 gap-4 overflow-y-auto">
              {/* Categories */}
              <div className="col-span-3 space-y-2 px-2">
                <Label className="text-sm font-semibold">Danh mục</Label>
                {isLoadingCategories ? (
                  <div className="space-y-2">
                    {[...Array(5)].map((_, i) => (
                      <Skeleton key={i} className="h-10 w-full" />
                    ))}
                  </div>
                ) : (
                  <div className="space-y-1 ">
                    <Button
                      type="button"
                      variant={
                        selectedCategoryCode === null ? "default" : "ghost"
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
                            ? "default"
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

              {/* Menu Items */}
              <div className="col-span-6 space-y-2 flex flex-col ">
                <div className="space-y-2">
                  <Label className="text-sm font-semibold">Chọn món</Label>
                  <div className="relative">
                    <Input
                      placeholder="Tìm kiếm món ăn..."
                      value={searchText}
                      onChange={(e) => setSearchText(e.target.value)}
                      startAddon={<Search />}
                    />
                  </div>
                </div>
                <div className="h-[40vh] overflow-y-auto space-y-2 p-2">
                  {isLoadingMenu ? (
                    [...Array(6)].map((_, i) => (
                      <Skeleton key={i} className="h-20 w-full" />
                    ))
                  ) : filteredMenuItems.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-center py-12">
                      <Utensils className="h-12 w-12 text-muted-foreground mb-2" />
                      <p className="text-sm text-muted-foreground">
                        Không tìm thấy món ăn nào
                      </p>
                    </div>
                  ) : (
                    filteredMenuItems.map((item) => {
                      const isSelected = selectedPOSItems.has(item.itemId);
                      const selectedData = selectedPOSItems.get(item.itemId);

                      return (
                        <Card
                          key={item.itemId}
                          className={`p-3 cursor-pointer transition-all hover:shadow-md ${
                            isSelected ? "border-primary bg-primary/5" : ""
                          }`}
                          onClick={() => handleTogglePOSItem(item)}
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
                                    <Check className="h-4 w-4" />{" "}
                                    {selectedData?.quantity}
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
                    })
                  )}
                </div>
              </div>

              {/* Selected POS Items */}
              <div className="col-span-3 space-y-2 flex flex-col ">
                <Label className="text-sm font-semibold">
                  Món đã chọn ({selectedPOSItems.size})
                </Label>
                <div className="h-[40vh] overflow-y-auto space-y-2">
                  {selectedPOSItems.size > 0 ? (
                    <>
                      {Array.from(selectedPOSItems.values()).map(
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
                                  handleUpdatePOSQuantity(
                                    item.itemId,
                                    value || 0
                                  )
                                }
                              />
                            </div>
                            <div className="pt-2 border-t">
                              <p className="text-xs font-semibold text-primary">
                                {
                                  formatMoney(item.price * quantity)
                                    .vndFormatted
                                }
                              </p>
                            </div>
                          </Card>
                        )
                      )}
                    </>
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
            </div>
          </TabsContent>

          <TabsContent value="service" className="flex-1 mt-4">
            <div className="grid grid-cols-12 gap-4 ">
              <div className="col-span-3 space-y-2  px-2">
                <Label className="text-sm font-semibold">Loại dịch vụ</Label>
                {isLoadingServiceTypes ? (
                  <div className="space-y-2">
                    {[...Array(3)].map((_, i) => (
                      <Skeleton key={i} className="h-10 w-full" />
                    ))}
                  </div>
                ) : (
                  <div className="space-y-1">
                    <Button
                      type="button"
                      variant={
                        selectedServiceType === null ? "default" : "ghost"
                      }
                      className="w-full justify-start text-sm"
                      onClick={() => setSelectedServiceType(null)}
                    >
                      Tất cả dịch vụ
                    </Button>
                    {serviceTypes.map((type) => (
                      <Button
                        key={type.code}
                        type="button"
                        variant={
                          selectedServiceType === type.code
                            ? "default"
                            : "ghost"
                        }
                        className="w-full justify-start text-sm"
                        onClick={() => setSelectedServiceType(type.code)}
                      >
                        {type.name}
                      </Button>
                    ))}
                  </div>
                )}
              </div>
              {/* Service Items List */}
              <div className="col-span-6 space-y-2 flex flex-col ">
                <div className="space-y-2">
                  <Label className="text-sm font-semibold">Chọn dịch vụ</Label>
                  <div className="relative">
                    <Input
                      placeholder="Tìm kiếm dịch vụ..."
                      value={searchText}
                      onChange={(e) => setSearchText(e.target.value)}
                      startAddon={<Search />}
                    />
                  </div>
                </div>
                <div className="h-[40vh] overflow-y-auto space-y-2 p-2">
                  {isLoadingServices ? (
                    [...Array(6)].map((_, i) => (
                      <Skeleton key={i} className="h-20 w-full" />
                    ))
                  ) : filteredServiceItems.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-center py-12">
                      <Wrench className="h-12 w-12 text-muted-foreground mb-2" />
                      <p className="text-sm text-muted-foreground">
                        Không tìm thấy dịch vụ nào
                      </p>
                    </div>
                  ) : (
                    filteredServiceItems.map((item) => {
                      const isSelected = selectedServiceItems.has(
                        item.serviceItemId
                      );
                      const selectedData = selectedServiceItems.get(
                        item.serviceItemId
                      );

                      return (
                        <Card
                          key={item.serviceItemId}
                          className={`p-3 cursor-pointer transition-all hover:shadow-md ${
                            isSelected ? "border-primary bg-primary/5" : ""
                          }`}
                          onClick={() => handleToggleServiceItem(item)}
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
                                    Ngừng cung cấp
                                  </Badge>
                                )}
                                {isSelected && (
                                  <Badge variant="default" className="text-xs">
                                    <Check className="h-4 w-4" />{" "}
                                    {selectedData?.quantity}
                                  </Badge>
                                )}
                              </div>
                              {item.description && (
                                <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                                  {item.description}
                                </p>
                              )}
                              <p className="text-sm font-semibold text-primary mt-2">
                                {formatMoney(item.basePrice).vndFormatted}
                              </p>
                            </div>
                          </div>
                        </Card>
                      );
                    })
                  )}
                </div>
              </div>

              {/* Selected Service Items */}
              <div className="col-span-3 space-y-2 flex flex-col ">
                <Label className="text-sm font-semibold">
                  Dịch vụ đã chọn ({selectedServiceItems.size})
                </Label>
                <div className="h-[40vh] overflow-y-auto space-y-2">
                  {selectedServiceItems.size > 0 ? (
                    <>
                      {Array.from(selectedServiceItems.values()).map(
                        ({ item, quantity }) => (
                          <Card
                            key={item.serviceItemId}
                            className="p-3 space-y-2"
                          >
                            <div>
                              <p className="font-medium text-xs">{item.name}</p>
                              <p className="text-xs text-muted-foreground">
                                {formatMoney(item.basePrice).vndFormatted}
                              </p>
                            </div>
                            <div className="flex items-center justify-between gap-2">
                              <Label className="text-xs">SL:</Label>
                              <Counter
                                value={quantity}
                                onChange={(value) =>
                                  handleUpdateServiceQuantity(
                                    item.serviceItemId,
                                    value || 0
                                  )
                                }
                              />
                            </div>
                            <div className="pt-2 border-t">
                              <p className="text-xs font-semibold text-primary">
                                {
                                  formatMoney(item.basePrice * quantity)
                                    .vndFormatted
                                }
                              </p>
                            </div>
                          </Card>
                        )
                      )}
                    </>
                  ) : (
                    <Card className="p-4">
                      <div className="flex flex-col items-center justify-center h-40 text-center">
                        <Wrench className="h-8 w-8 text-muted-foreground mb-2" />
                        <p className="text-xs text-muted-foreground">
                          Chưa chọn dịch vụ nào
                        </p>
                      </div>
                    </Card>
                  )}
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={handleCancel}>
            Hủy
          </Button>
          <Button
            type="button"
            onClick={handleConfirm}
            disabled={totalItemsCount === 0 || isAdding}
          >
            {isAdding ? "Đang thêm..." : `Thêm ${totalItemsCount} item`}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
