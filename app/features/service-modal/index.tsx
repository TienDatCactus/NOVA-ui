import { Receipt, Search, Trash, UtensilsCrossed } from "lucide-react";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "~/components/ui/dialog";
import Image from "~/components/ui/image";
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
import { Counter } from "~/components/ui/shadcn-io/counter";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";
import { ServiceItemGrid, ServiceItemList } from "./fragments/service-item";
import {
  ServiceProvider,
  useServiceContext,
} from "./local-context/service-modal.context";
import { useState } from "react";
import useBookingSchema from "~/schema/booking.schema";
import type z from "zod";

export const MOCK_SERVICES = [
  {
    id: "sv1",
    name: "Dọn phòng",
    price: 200000,
    category: "Dịch vụ",
    imageUrl: "https://via.placeholder.com/168x100.png?text=Dọn+Phòng",
    description: "Dọn dẹp phòng theo yêu cầu",
    quantity: 1,
  },
  {
    id: "sv2",
    name: "Giặt ủi",
    price: 150000,
    category: "Dịch vụ",
    imageUrl: "https://via.placeholder.com/168x100.png?text=Giặt+Ủi",
    description: "Giặt ủi quần áo",
    quantity: 1,
  },
  {
    id: "sv3",
    name: "Spa",
    price: 500000,
    category: "Dịch vụ",
    imageUrl: "https://via.placeholder.com/168x100.png?text=Spa",
    description: "Dịch vụ spa và massage",
    quantity: 1,
  },
  {
    id: "food1",
    name: "Phở Bò",
    price: 75000,
    category: "Thức ăn",
    imageUrl: "https://via.placeholder.com/168x100.png?text=Phở+Bò",
    description: "Phở bò truyền thống",
    quantity: 1,
  },
  {
    id: "food2",
    name: "Bún chả",
    price: 85000,
    category: "Thức ăn",
    imageUrl: "https://via.placeholder.com/168x100.png?text=Bún+Chả",
    description: "Bún chả Hà Nội",
    quantity: 1,
  },
  {
    id: "food3",
    name: "Cơm gà",
    price: 90000,
    category: "Thức ăn",
    imageUrl: "https://via.placeholder.com/168x100.png?text=Cơm+Gà",
    description: "Cơm gà xối mỡ",
    quantity: 1,
  },
  {
    id: "drink1",
    name: "Bia",
    price: 35000,
    category: "Đồ uống",
    imageUrl: "https://via.placeholder.com/168x100.png?text=Bia",
    description: "Bia tươi",
    quantity: 1,
  },
  {
    id: "drink2",
    name: "Nước ép",
    price: 45000,
    category: "Đồ uống",
    imageUrl: "https://via.placeholder.com/168x100.png?text=Nước+Ép",
    description: "Nước ép trái cây tươi",
    quantity: 1,
  },
  {
    id: "drink3",
    name: "Cà phê",
    price: 30000,
    category: "Đồ uống",
    imageUrl: "https://via.placeholder.com/168x100.png?text=Cà+Phê",
    description: "Cà phê đen/sữa",
    quantity: 1,
  },
];

const { ServiceItemSchema, ServiceCategoryEnum } = useBookingSchema();
type ServiceItem = z.infer<typeof ServiceItemSchema>;
type ServiceCategory = z.infer<typeof ServiceCategoryEnum>;

interface ServiceModalContentProps {
  onFinish?: (services: ServiceItem[]) => void;
}

interface ServiceModalProps {
  onFinish?: (services: any[]) => void;
  open: boolean;
  toggle: () => void;
  initialServices?: any[];
}

function ServiceModalContent({ onFinish }: ServiceModalContentProps) {
  const tabs: ServiceCategory[] = ["Dịch vụ", "Thức ăn", "Đồ uống"];
  const [activeTab, setActiveTab] = useState<ServiceCategory>("Dịch vụ");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedRoom, setSelectedRoom] = useState("");

  const { selectedServices, getTotalAmount, getTotalItems, clearCart } =
    useServiceContext();

  const handleFinish = () => {
    if (onFinish) onFinish(selectedServices);
  };

  const filteredServices = MOCK_SERVICES.filter(
    (item) =>
      item.category === activeTab &&
      (searchQuery === "" ||
        item.name.toLowerCase().includes(searchQuery.toLowerCase()))
  );

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

            {tabs.map((tab) => (
              <TabsContent key={tab} value={tab}>
                <ScrollArea className="h-120 bg-white border rounded-md">
                  {filteredServices.length > 0 ? (
                    <ul className="grid p-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {filteredServices.map((item) => (
                        <ServiceItemGrid key={item.id} item={item} />
                      ))}
                    </ul>
                  ) : (
                    <div className="flex items-center justify-center h-40">
                      <p className="text-muted-foreground">
                        Không tìm thấy dịch vụ nào
                      </p>
                    </div>
                  )}
                </ScrollArea>
              </TabsContent>
            ))}
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
                <SelectItem value="101">Phòng 101</SelectItem>
                <SelectItem value="102">Phòng 102</SelectItem>
                <SelectItem value="103">Phòng 103</SelectItem>
              </SelectContent>
            </Select>
            <Button className="" variant="outline" onClick={clearCart}>
              <Trash className="w-4 h-4 mr-1" /> Xóa tất cả
            </Button>
          </div>

          <ScrollArea className="h-60 my-4">
            {selectedServices.length > 0 ? (
              <ul>
                {selectedServices.map((item) => (
                  <ServiceItemList key={item.id} item={item} />
                ))}
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
}: ServiceModalProps) {
  return (
    <Dialog onOpenChange={toggle} open={open}>
      <ServiceProvider initialServices={initialServices}>
        <DialogContent className="max-w-7xl w-full max-h-[90vh] overflow-y-auto">
          <ServiceModalContent
            onFinish={(services) => {
              if (onFinish) onFinish(services);
            }}
          />
        </DialogContent>
      </ServiceProvider>
    </Dialog>
  );
}
