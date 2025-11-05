import { useMemo, useState } from "react";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";
import { useMenuCategories } from "~/routes/menu/container/menu-categories/query.hooks";
import useMenuFilters from "~/routes/menu/container/menu/filter.hooks";
import { useMenuList } from "~/routes/menu/container/menu/query.hooks";
import { useServiceTypes } from "~/routes/services/container/service-types/query.hooks";
import useServiceFilters from "~/routes/services/container/services/filter.hooks";
import { useServices } from "~/routes/services/container/services/query.hooks";
import { useServiceOrderStore } from "~/store/service-order.store";
import MenuList from "./components/menu-list";
import OrderDetail from "./components/order-detail";
import ServiceList from "./components/service-list";
import FilterMenuBar from "./fragments/filter-menu.bar";
import FilterServiceBar from "./fragments/filter-service.bar";

interface AddServiceDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm?: () => void;
  bookingId?: string;
  customerName?: string;
  checkinDate?: Date | string;
  checkoutDate?: Date | string;
}

export default function AddServiceDialog({
  open,
  onOpenChange,
  onConfirm,
  bookingId,
  customerName,
}: AddServiceDialogProps) {
  const [activeTab, setActiveTab] = useState<"service" | "menu">("service");

  // Get store methods and data
  const orderServices = useServiceOrderStore((s) => s.services);
  const addItem = useServiceOrderStore((s) => s.addItem);
  const removeById = useServiceOrderStore((s) => s.removeById);
  const setQuantity = useServiceOrderStore((s) => s.setQuantity);
  const clear = useServiceOrderStore((s) => s.clear);

  // Service data & filters
  const { data: serviceTypes = [] } = useServiceTypes();
  const {
    updateFilter: updateServiceFilter,
    filterServices,
    resetFilters: resetServiceFilters,
    filters: serviceFilters,
  } = useServiceFilters();
  const { data: serviceItems = [] } = useServices({
    typeCode: serviceFilters.typeCode,
  });
  // Menu data & filters
  const { data: menuCategories = [] } = useMenuCategories({});
  const {
    filters: menuFilters,
    updateFilter: updateMenuFilter,
    filterMenuItems,
    resetFilters: resetMenuFilters,
  } = useMenuFilters();
  const { data: menuItems = [] } = useMenuList({
    categoryCode: menuFilters.categoryCode,
  });

  // Selection helpers using store
  const isSelected = (itemId: string) => {
    return orderServices.some((s) => s.itemId === itemId);
  };

  const getQuantity = (itemId: string): number => {
    const item = orderServices.find((s) => s.itemId === itemId);
    return item?.quantity || 0;
  };

  const handleQuantityChange = (itemId: string, quantity: number) => {
    if (quantity <= 0) {
      removeById(itemId);
    } else {
      setQuantity(itemId, quantity);
    }
  };

  const toggleSelectItem = (
    itemId: string,
    itemType: "MenuItem" | "ServiceItem"
  ) => {
    const exists = orderServices.some((s) => s.itemId === itemId);
    if (exists) {
      removeById(itemId);
    } else {
      const today = new Date().toISOString().slice(0, 10);
      addItem({
        itemType,
        itemId,
        quantity: 1,
        scheduledDate: today,
        note: "",
      });
    }
  };

  const handleConfirm = () => {
    onConfirm?.();
    setActiveTab("service");
    onOpenChange(false);
  };

  const handleClearAll = () => {
    clear();
  };

  const filteredServiceItems = useMemo(() => {
    return filterServices(serviceItems);
  }, [filterServices, serviceItems]);

  const filteredMenuItems = useMemo(() => {
    return filterMenuItems(menuItems || []);
  }, [filterMenuItems, menuItems]);

  const totalSelected = orderServices.length;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-full max-h-full min-h-0 overflow-y-auto p-0 bg-white">
        <DialogHeader className="p-4 pb-0">
          <DialogTitle>Menu & Dịch vụ</DialogTitle>
        </DialogHeader>
        <div className="p-4 pb-0 grid gap-4 flex-1 ">
          <div className="grid md:grid-cols-12 grid-cols-1 gap-4">
            <div className="col-span-2 ">
              <Tabs
                value={activeTab}
                onValueChange={(v) => setActiveTab(v as "service" | "menu")}
              >
                <TabsList className="w-full">
                  <TabsTrigger
                    value="service"
                    className="flex items-center gap-1 px-2.5 sm:px-3"
                  >
                    Dịch vụ
                    <Badge className="h-5 min-w-5 rounded-full px-1 tabular-nums">
                      {filteredServiceItems.length}
                    </Badge>
                  </TabsTrigger>
                  <TabsTrigger
                    value="menu"
                    className="flex items-center gap-1 px-2.5 sm:px-3"
                  >
                    Menu
                    <Badge className="h-5 min-w-5 rounded-full px-1 tabular-nums">
                      {filteredMenuItems.length}
                    </Badge>
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="service" className="space-y-4">
                  <FilterServiceBar
                    serviceTypes={serviceTypes}
                    selectedTypeCode={serviceFilters.typeCode}
                    onTypeChange={(code) =>
                      updateServiceFilter("typeCode", code)
                    }
                    onReset={resetServiceFilters}
                  />
                </TabsContent>

                <TabsContent value="menu" className="space-y-4">
                  <FilterMenuBar
                    menuCategories={menuCategories}
                    selectedCategoryCode={menuFilters.categoryCode}
                    onCategoryChange={(code) =>
                      updateMenuFilter("categoryCode", code)
                    }
                    onReset={resetMenuFilters}
                  />
                </TabsContent>
              </Tabs>
            </div>

            <div className="col-span-7 ">
              {activeTab === "service" ? (
                <ServiceList
                  services={filteredServiceItems}
                  searchText={serviceFilters.searchText}
                  onSearchChange={(text) =>
                    updateServiceFilter("searchText", text)
                  }
                  isSelected={isSelected}
                  getQuantity={getQuantity}
                  onToggleSelect={(id) => toggleSelectItem(id, "ServiceItem")}
                  onQuantityChange={handleQuantityChange}
                />
              ) : (
                <MenuList
                  menuItems={filteredMenuItems}
                  searchText={menuFilters.searchText}
                  onSearchChange={(text) =>
                    updateMenuFilter("searchText", text)
                  }
                  isSelected={isSelected}
                  getQuantity={getQuantity}
                  onToggleSelect={(id) => toggleSelectItem(id, "MenuItem")}
                  onQuantityChange={handleQuantityChange}
                />
              )}
            </div>

            <div className="col-span-3">
              <OrderDetail
                onClearAll={handleClearAll}
                bookingId={bookingId}
                customerName={customerName}
              />
            </div>
          </div>
        </div>

        <DialogFooter className="border-t p-6 flex items-center justify-between">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Hủy
          </Button>
          <Button onClick={handleConfirm} disabled={totalSelected === 0}>
            Xác nhận ({totalSelected})
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
