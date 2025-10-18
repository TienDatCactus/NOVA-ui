import { Receipt, Search, Trash, UtensilsCrossed } from "lucide-react";
import { useState } from "react";
import type z from "zod";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import {
  Dialog,
  DialogContent,
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
import { Separator } from "~/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";
import useServiceSchema from "~/services/schema/service.schema";
import { useCreateBookingStore } from "~/store/create-booking.store";
import useMenu from "./container/useMenu";
import useServices from "./container/useServices";
import { ServiceItemGrid, ServiceItemList } from "./fragments/service-item";
import {
  ServiceProvider,
  useServiceContext,
} from "./local-context/service-modal.context";
import ServiceTab from "./components/service.tab";
import MenuTab from "./components/menu.tab";
import { MenuItemList } from "./fragments/menu-item";

const { ServiceItem2Schema, ServiceCategoryEnum } = useServiceSchema();
type ServiceItem = z.infer<typeof ServiceItem2Schema>;
type ServiceCategory = z.infer<typeof ServiceCategoryEnum>;

interface ServiceModalContentProps {
  onFinish?: (services: ServiceItem[]) => void;
}

interface ServiceModalProps {
  onFinish?: (service: ServiceItem[]) => void;
  open: boolean;
  toggle: () => void;
  initialServices?: any[];
  selectedRoomId?: string;
}

function ServiceModalContent({ onFinish }: ServiceModalContentProps) {
  const tabs: ServiceCategory[] = ["Service", "Menu"];
  const [activeTab, setActiveTab] = useState<ServiceCategory>("Service");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedRoom, setSelectedRoom] = useState("");

  const { formData } = useCreateBookingStore();
  const { selectedServices, getTotalAmount, getTotalItems, clearCart } =
    useServiceContext();

  const handleFinish = () => {
    // if (onFinish) onFinish(selectedServices);
  };

  return (
    <>
      <DialogHeader>
        <DialogTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <UtensilsCrossed />
            Bảng Menu & Dịch vụ
          </div>
          <div className="pr-4">
            <Input
              startIcon={<Search />}
              placeholder="Tìm kiếm dịch vụ"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </DialogTitle>
      </DialogHeader>
      <div className="grid grid-cols-1 w-full md:grid-cols-8 gap-2 ">
        <div className="col-span-5 flex flex-col gap-4">
          <Tabs
            defaultValue={tabs[0]}
            className="w-full"
            value={activeTab}
            onValueChange={(value) => setActiveTab(value as ServiceCategory)}
          >
            <TabsList className="w-full">
              {tabs.map((tab) => (
                <TabsTrigger key={tab} value={tab}>
                  {tab}
                </TabsTrigger>
              ))}
            </TabsList>
            <ServiceTab />
            <MenuTab />
          </Tabs>
        </div>

        <div className="col-span-3 border rounded-md bg-white p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="items-center flex gap-2">
              <Receipt className="w-5 h-5" />
              <span>Danh sách đã chọn ({getTotalItems()})</span>
            </div>
            <Badge>
              <pre>#ABC123</pre>
            </Badge>
          </div>
          <Separator className="my-4" />
          <div className="flex items-center gap-2">
            <Select value={selectedRoom} onValueChange={setSelectedRoom}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Chọn phòng" />
              </SelectTrigger>
              <SelectContent>
                {formData?.roomSelection?.rooms.map((room) => (
                  <SelectItem key={room.roomId} value={room.roomId}>
                    {room.roomName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button className="" variant="outline" onClick={clearCart}>
              <Trash className="w-4 h-4 mr-1" /> Xóa tất cả
            </Button>
          </div>

          <ScrollArea className="h-60 my-4">
            {selectedServices.length > 0 ? (
              <ul>
                {selectedServices.map((item) => {
                  if (item.type === "service") {
                    return (
                      <ServiceItemList key={item.serviceItemId} item={item} />
                    );
                  } else {
                    return <MenuItemList key={item.itemId} item={item} />;
                  }
                })}
              </ul>
            ) : (
              <div className="flex items-center justify-center h-40">
                <p className="text-muted-foreground">
                  Chưa có dịch vụ nào được chọn
                </p>
              </div>
            )}
          </ScrollArea>

          <Separator className="my-4" />

          <div className="flex items-center justify-between text-lg">
            <span>Tổng cộng:</span>
            <span className="font-bold">
              {new Intl.NumberFormat("vi-VN", {
                style: "currency",
                currency: "VND",
              }).format(getTotalAmount())}
            </span>
          </div>

          <Button
            className="w-full mt-4"
            disabled={selectedServices.length === 0 || !selectedRoom}
            onClick={handleFinish}
          >
            Hoàn tất
          </Button>
        </div>
      </div>
    </>
  );
}

export default function ServiceModal({
  open,
  toggle,
  onFinish,
  initialServices = [],
  selectedRoomId,
}: ServiceModalProps) {
  return (
    <Dialog onOpenChange={toggle} open={open}>
      <ServiceProvider initialServices={initialServices}>
        <DialogContent className="max-w-7xl w-full max-h-[90vh] overflow-y-auto">
          <ServiceModalContent
            onFinish={(services) => {
              if (onFinish) onFinish(services);
              toggle();
            }}
          />
        </DialogContent>
      </ServiceProvider>
    </Dialog>
  );
}
