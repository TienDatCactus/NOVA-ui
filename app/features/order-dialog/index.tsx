import { zodResolver } from "@hookform/resolvers/zod";
import { useMemo, useState } from "react";
import { useFieldArray, useForm } from "react-hook-form";
import z from "zod";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import { Dialog, DialogContent, DialogFooter } from "~/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";
import { useMenuCategories } from "~/routes/menu/container/menu-categories/query.hooks";
import useMenuFilters from "~/routes/menu/container/menu/filter.hooks";
import { useMenuList } from "~/routes/menu/container/menu/query.hooks";
import { useServiceTypes } from "~/routes/services/container/service-types/query.hooks";
import useServiceFilters from "~/routes/services/container/services/filter.hooks";
import { useServices } from "~/routes/services/container/services/query.hooks";
import { OrderSchema } from "~/services/api/order/order.schema";
import MenuList from "./components/menu-list";
import OrderDetail from "./components/order-detail";
import ServiceList from "./components/service-list";
import FilterMenuBar from "./fragments/filter-menu.bar";
import FilterServiceBar from "./fragments/filter-service.bar";

const { ServiceOrderItemSchema, ServiceOrderSchema } = OrderSchema;
type ServiceOrderItemDto = z.infer<typeof ServiceOrderItemSchema>;
type ServiceOrderDto = z.infer<typeof ServiceOrderSchema>;

interface AddServiceDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm?: (services: ServiceOrderItemDto[]) => void;
  bookingId?: string;
  customerName?: string;
  tableName?: string;
  checkinDate?: Date | string;
  checkoutDate?: Date | string;
}

export default function AddServiceDialog({
  open,
  onOpenChange,
  onConfirm,
  bookingId,
  customerName,
  tableName,
  checkinDate,
  checkoutDate,
}: AddServiceDialogProps) {
  const [activeTab, setActiveTab] = useState<"service" | "menu">("service");

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

  // Form state
  const form = useForm<ServiceOrderDto>({
    resolver: zodResolver(ServiceOrderSchema),
    defaultValues: { services: [], payment: null },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "services",
  });

  // Selection helpers
  const isSelected = (itemId: string) => {
    return (form.getValues("services") || []).some((s) => s.itemId === itemId);
  };

  const getQuantity = (itemId: string): number => {
    const item = (form.getValues("services") || []).find(
      (s) => s.itemId === itemId
    );
    return item?.quantity || 0;
  };

  const handleQuantityChange = (itemId: string, quantity: number) => {
    const servicesArr = form.getValues("services") || [];
    const idx = servicesArr.findIndex((s) => s.itemId === itemId);
    if (idx >= 0) {
      if (quantity <= 0) {
        remove(idx);
      } else {
        form.setValue(`services.${idx}.quantity`, quantity);
      }
    }
  };

  const toggleSelectItem = (
    itemId: string,
    itemType: "MenuItem" | "ServiceItem"
  ) => {
    const servicesArr = form.getValues("services") || [];
    const idx = servicesArr.findIndex((s) => s.itemId === itemId);
    if (idx >= 0) {
      remove(idx);
    } else {
      const today = new Date().toISOString().slice(0, 10);
      append({ itemType, itemId, quantity: 1, scheduledDate: today, note: "" });
    }
  };

  const handleConfirm = () => {
    const services = form.getValues("services") || [];
    onConfirm?.(services as ServiceOrderItemDto[]);
    form.reset();
    setActiveTab("service");
    onOpenChange(false);
  };

  const handleClearAll = () => {
    form.reset();
  };

  const filteredServiceItems = useMemo(() => {
    return filterServices(serviceItems);
  }, [filterServices, serviceItems]);

  const filteredMenuItems = useMemo(() => {
    return filterMenuItems(menuItems || []);
  }, [filterMenuItems, menuItems]);

  const totalSelected = form.getValues("services")?.length || 0;

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        if (!v) form.reset();
        onOpenChange(v);
      }}
    >
      <DialogContent className="max-w-[90vw] max-h-[90vh] min-h-0 overflow-y-auto p-0 bg-white">
        <div className="p-6 pb-0 grid gap-4 flex-1 ">
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
                form={form}
                onRemoveItem={remove}
                onClearAll={handleClearAll}
                bookingId={bookingId}
                customerName={customerName}
                tableName={tableName}
                checkinDate={checkinDate}
                checkoutDate={checkoutDate}
              />
            </div>
          </div>
        </div>

        <DialogFooter className="border-t p-6 flex items-center justify-between">
          <Button
            variant="outline"
            onClick={() => {
              onOpenChange(false);
              form.reset();
            }}
          >
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
