import { useMemo, useState } from "react";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { Input } from "~/components/ui/input";
import { RotateCcw, Search } from "lucide-react";
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
import { useDebounceCallback } from "usehooks-ts";

interface AddServiceDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm?: () => void;
  customerName?: string;
  checkinDate?: Date | string;
  checkoutDate?: Date | string;
}

export default function AddServiceDialog({
  open,
  onOpenChange,
  onConfirm,
  customerName,
  checkinDate,
  checkoutDate,
}: AddServiceDialogProps) {
  const [activeTab, setActiveTab] = useState<"service" | "menu">("service");
  const [searchText, setSearchText] = useState("");

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
    setSearchText("");
    onOpenChange(false);
  };

  const handleClearAll = () => {
    clear();
  };

  const filteredServiceItems = useMemo(() => {
    const filtered = filterServices(serviceItems);
    if (!searchText) return filtered;
    return filtered.filter((item) =>
      item.name.toLowerCase().includes(searchText.toLowerCase())
    );
  }, [filterServices, serviceItems, searchText]);

  const filteredMenuItems = useMemo(() => {
    const filtered = filterMenuItems(menuItems || []);
    if (!searchText) return filtered;
    return filtered.filter((item) =>
      item.name.toLowerCase().includes(searchText.toLowerCase())
    );
  }, [filterMenuItems, menuItems, searchText]);

  const totalSelected = orderServices.length;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl max-h-[80vh] overflow-y-auto p-0 bg-accent gap-2">
        <DialogHeader className="p-6 pb-4">
          <DialogTitle>Chọn dịch vụ & món ăn</DialogTitle>
          <DialogDescription>
            Chọn các dịch vụ và món ăn cho booking. Điều chỉnh số lượng và chi
            tiết trong phần đơn hàng.
          </DialogDescription>
          <div className="flex items-center gap-3">
            <Select
              value={activeTab}
              onValueChange={(v) => {
                setActiveTab(v as "service" | "menu");
                setSearchText("");
              }}
            >
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="service">Dịch vụ</SelectItem>
                <SelectItem value="menu">Menu</SelectItem>
              </SelectContent>
            </Select>

            {activeTab === "service" ? (
              <Select
                value={serviceFilters.typeCode}
                onValueChange={(code) => updateServiceFilter("typeCode", code)}
              >
                <SelectTrigger className="w-52">
                  <SelectValue placeholder="Tất cả loại dịch vụ" />
                </SelectTrigger>
                <SelectContent>
                  {serviceTypes.map((type) => (
                    <SelectItem key={type.id} value={type.code}>
                      {type.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            ) : (
              <Select
                value={menuFilters.categoryCode}
                onValueChange={(code) => updateMenuFilter("categoryCode", code)}
              >
                <SelectTrigger className="w-52">
                  <SelectValue placeholder="Tất cả danh mục" />
                </SelectTrigger>
                <SelectContent>
                  {menuCategories.map((category) => (
                    <SelectItem key={category.id} value={category.code}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
            <div className=" flex items-center gap-2">
              <Input
                startAddon={
                  <Search className="h-4 w-4 text-muted-foreground" />
                }
                placeholder="Tìm kiếm..."
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
              />
              <Button
                variant="outline"
                onClick={() => {
                  resetMenuFilters();
                  resetServiceFilters();
                  setSearchText("");
                }}
              >
                <RotateCcw />
                Đặt lại{" "}
              </Button>
            </div>
          </div>
        </DialogHeader>

        {/* Main Content Grid */}
        <div className="px-4 flex-1 ">
          <div className="grid md:grid-cols-10 grid-cols-1 gap-4 h-full">
            <div className="md:col-span-6 col-span-12 bg-card border rounded-2xl flex flex-col gap-4 h-full">
              {activeTab === "service" ? (
                <ServiceList
                  services={filteredServiceItems}
                  isSelected={isSelected}
                  getQuantity={getQuantity}
                  onToggleSelect={(id) => toggleSelectItem(id, "ServiceItem")}
                  onQuantityChange={handleQuantityChange}
                />
              ) : (
                <MenuList
                  menuItems={filteredMenuItems}
                  isSelected={isSelected}
                  getQuantity={getQuantity}
                  onToggleSelect={(id) => toggleSelectItem(id, "MenuItem")}
                  onQuantityChange={handleQuantityChange}
                />
              )}
            </div>

            <div className="md:col-span-4 col-span-12 overflow-y-auto">
              <OrderDetail
                customerName={customerName}
                checkinDate={checkinDate}
                checkoutDate={checkoutDate}
              />
            </div>
          </div>
        </div>

        <DialogFooter
          className="border-t p-4 pt-0
         flex items-center justify-between"
        >
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
