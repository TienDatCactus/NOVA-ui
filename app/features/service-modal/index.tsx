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

interface ServiceModalProps {
  open: boolean;
  toggle: () => void;
}
export default function ServiceModal({ open, toggle }: ServiceModalProps) {
  const tabs = ["Dịch vụ", "Thức ăn", "Đồ uống"];
  return (
    <Dialog onOpenChange={toggle} open={open}>
      <DialogContent className="w-5xl">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <UtensilsCrossed />
              Bảng Menu & Dịch vụ
            </div>
            <div className="pr-4">
              <Input startIcon={<Search />} placeholder="Tìm kiếm dịch vụ" />
            </div>
          </DialogTitle>
        </DialogHeader>
        <div className="grid grid-cols-1 md:grid-cols-8 gap-2 w-full">
          <div className="col-span-5 flex flex-col gap-4">
            <Tabs defaultValue={tabs[0]} className="w-full">
              <TabsList className="w-full">
                {tabs.map((tab) => (
                  <TabsTrigger key={tab} value={tab}>
                    {tab}
                  </TabsTrigger>
                ))}
              </TabsList>
              <TabsContent value="account">
                Make changes to your account here.
              </TabsContent>
              <TabsContent value="password">
                Change your password here.
              </TabsContent>
            </Tabs>
            <ScrollArea className="flex-1 p-2 bg-white border rounded-md">
              <ul className="grid grid-cols-3 gap-4">
                <ServiceItemGrid
                  item={{
                    id: "1",
                    name: "Service 1",
                    price: 100,
                    imageUrl: "",
                    category: "",
                  }}
                />
              </ul>
            </ScrollArea>
          </div>
          <div className="col-span-3 border rounded-md bg-white p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <div className="items-center flex  gap-2">
                <Receipt />
                <span>Danh sách đã chọn (0)</span>
              </div>
              <Badge>
                <pre>#ABC123</pre>
              </Badge>
            </div>
            <Separator className="my-4" />
            <div className="flex items-center gap-2">
              <Select>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Theme" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="light">Light</SelectItem>
                  <SelectItem value="dark">Dark</SelectItem>
                  <SelectItem value="system">System</SelectItem>
                </SelectContent>
              </Select>
              <Button className="">Lưu</Button>
            </div>
            <ScrollArea className="h-60">
              <ul>
                <ServiceItemList
                  item={{
                    id: "1",
                    name: "Service 1",
                    price: 100,
                    imageUrl: "",
                    category: "",
                    quantity: 1,
                  }}
                />
              </ul>
            </ScrollArea>
            <Separator className="my-4" />
            <div className="flex items-center justify-between">
              Tổng cộng: <span className="font-bold">0 đ</span>
            </div>
            <Button className="w-full mt-4">Hoàn tất</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
