import { CableCar, Notebook, Search } from "lucide-react";
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
import { Textarea } from "~/components/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { Badge } from "~/components/ui/badge";
import { formatMoney } from "~/lib/utils";
import { useServices } from "~/routes/services/container/services/query.hooks";
import { useServiceTypes } from "~/routes/services/container/service-types/query.hooks";
import { Skeleton } from "~/components/ui/skeleton";
import { Counter } from "~/components/ui/shadcn-io/button-group/advanced/counter";
import type { ServiceItem } from "~/services/api/services/dto";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "~/components/ui/popover";

interface AddServiceOrderDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: (
    serviceItemId: string,
    quantity: number,
    unitPrice: number,
    scheduledAt?: string,
    note?: string
  ) => void;
  isAdding: boolean;
  hasMultipleRooms: boolean;
}

export default function AddServiceOrderDialog({
  open,
  onOpenChange,
  onConfirm,
  isAdding,
}: AddServiceOrderDialogProps) {
  const [selectedTypeCode, setSelectedTypeCode] = useState<string | null>(null);
  const [searchText, setSearchText] = useState("");
  const [selectedService, setSelectedService] = useState<ServiceItem | null>(
    null
  );
  const [quantity, setQuantity] = useState(1);
  const [scheduledAt, setScheduledAt] = useState<string>(
    new Date().toISOString()
  );
  const [note, setNote] = useState<string>("");

  const { data: serviceTypes = [], isPending: isLoadingServiceTypes } =
    useServiceTypes({});

  const { data: allServices = [], isPending: isLoadingServices } = useServices({
    typeCode: selectedTypeCode || undefined,
  });

  const filteredServices = useMemo(() => {
    if (!searchText) return allServices;
    const lower = searchText.toLowerCase();
    return allServices.filter(
      (item) =>
        item.name.toLowerCase().includes(lower) ||
        item.code.toLowerCase().includes(lower) ||
        item.description?.toLowerCase().includes(lower)
    );
  }, [allServices, searchText]);

  const handleConfirm = () => {
    if (!selectedService || quantity < 1) return;

    onConfirm(
      selectedService.serviceItemId,
      quantity,
      selectedService.basePrice,
      scheduledAt || undefined,
      note || undefined
    );

    // Reset form
    setSelectedService(null);
    setQuantity(1);
    setScheduledAt(new Date().toISOString());
    setNote("");
    setSearchText("");
    setSelectedTypeCode(null);
    onOpenChange(false);
  };

  const handleCancel = () => {
    setSelectedService(null);
    setQuantity(1);
    setScheduledAt("");
    setNote("");
    setSearchText("");
    setSelectedTypeCode(null);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CableCar className="h-5 w-5" />
            Thêm dịch vụ
          </DialogTitle>
          <DialogDescription>
            Chọn dịch vụ và số lượng để thêm vào đơn
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-12 gap-2 py-4">
          {/* Left: Service Types */}
          <div className="col-span-3 space-y-2">
            <Label className="text-sm font-semibold">Loại dịch vụ</Label>
            <div>
              {isLoadingServiceTypes ? (
                <div className="space-y-2">
                  {[...Array(5)].map((_, i) => (
                    <Skeleton key={i} className="h-10 w-full" />
                  ))}
                </div>
              ) : (
                <div className="space-y-1">
                  <Button
                    type="button"
                    variant={selectedTypeCode === null ? "secondary" : "ghost"}
                    className="w-full justify-start"
                    onClick={() => setSelectedTypeCode(null)}
                  >
                    Tất cả
                  </Button>
                  {serviceTypes.map((type) => (
                    <Button
                      key={type.id}
                      type="button"
                      variant={
                        selectedTypeCode === type.code ? "secondary" : "ghost"
                      }
                      className="w-full justify-start"
                      onClick={() => setSelectedTypeCode(type.code)}
                    >
                      {type.name}
                    </Button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Middle: Service List */}
          <div className="col-span-6 space-y-2 max-h-[50vh] flex flex-col">
            <div className="space-y-2">
              <Label className="text-sm font-semibold">Tìm kiếm dịch vụ</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Tìm kiếm dịch vụ..."
                  value={searchText}
                  onChange={(e) => setSearchText(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>
            <div className="flex-1 p-2 overflow-y-auto">
              {isLoadingServices ? (
                <div className="space-y-2">
                  {[...Array(6)].map((_, i) => (
                    <Skeleton key={i} className="h-20 w-full" />
                  ))}
                </div>
              ) : filteredServices.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center py-12">
                  <CableCar className="h-12 w-12 text-muted-foreground mb-2" />
                  <p className="text-sm text-muted-foreground">
                    Không tìm thấy dịch vụ nào
                  </p>
                </div>
              ) : (
                <div className="space-y-2">
                  {filteredServices.map((item) => (
                    <Card
                      key={item.serviceItemId}
                      className={`p-3 cursor-pointer transition-all hover:shadow-md ${
                        selectedService?.serviceItemId === item.serviceItemId
                          ? "border-primary bg-primary/5"
                          : ""
                      }`}
                      onClick={() => setSelectedService(item)}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <p className="font-medium text-sm truncate">
                              {item.name}
                            </p>
                            {!item.active && (
                              <Badge variant="destructive" className="text-xs">
                                Ngưng
                              </Badge>
                            )}
                          </div>
                          <p className="text-xs text-muted-foreground mt-1">
                            Mã: {item.code} • {item.unitName}
                          </p>
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
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Right: Selected Service & Details */}
          <div className="col-span-3 space-y-4">
            <Label className="text-sm font-semibold">Dịch vụ đã chọn</Label>
            {selectedService ? (
              <div className="space-y-4">
                <Card className="p-4 space-y-2 gap-2">
                  <CardHeader className="p-0">
                    <CardTitle className="font-medium text-sm">
                      {selectedService.name}
                    </CardTitle>
                    <CardDescription className="text-xs text-muted-foreground mt-1">
                      {formatMoney(selectedService.basePrice).vndFormatted}
                    </CardDescription>
                  </CardHeader>

                  <div className="space-y-2">
                    <Label className="text-xs">Số lượng</Label>
                    <div className="flex items-center gap-2">
                      <Counter
                        value={quantity}
                        onChange={(value) =>
                          setQuantity(Math.max(1, value || 1))
                        }
                      />
                    </div>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button variant={"outline"}>
                          <Notebook />
                          Ghi chú
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="flex flex-col gap-2">
                        <div className="space-y-2">
                          <Label htmlFor="scheduledAt" className="text-xs">
                            Thời gian thực hiện
                          </Label>

                          <Input
                            id="scheduledAt"
                            type="datetime-local"
                            value={scheduledAt}
                            onChange={(e) => setScheduledAt(e.target.value)}
                            className="text-xs"
                          />
                          <p className="text-xs text-muted-foreground">
                            Để trống nếu thực hiện ngay
                          </p>
                        </div>

                        {/* Note */}
                        <div className="space-y-2">
                          <Label htmlFor="note" className="text-xs">
                            Ghi chú
                          </Label>
                          <Textarea
                            id="note"
                            value={note}
                            onChange={(e) => setNote(e.target.value)}
                            placeholder="Ghi chú đặc biệt..."
                            rows={3}
                            className="text-xs"
                          />
                        </div>
                      </PopoverContent>
                    </Popover>
                  </div>
                </Card>

                {/* Total */}
                <Card className="p-3 bg-primary/10">
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs">
                      <span className="text-muted-foreground">Đơn giá:</span>
                      <span>
                        {formatMoney(selectedService.basePrice).vndFormatted}
                      </span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-muted-foreground">Số lượng:</span>
                      <span>{quantity}</span>
                    </div>
                    <div className="flex justify-between text-sm font-semibold pt-1 border-t border-primary/20">
                      <span>Tổng:</span>
                      <span className="text-primary">
                        {
                          formatMoney(selectedService.basePrice * quantity)
                            .vndFormatted
                        }
                      </span>
                    </div>
                  </div>
                </Card>
              </div>
            ) : (
              <Card className="p-4">
                <div className="flex flex-col items-center justify-center h-40 text-center">
                  <CableCar className="h-8 w-8 text-muted-foreground mb-2" />
                  <p className="text-xs text-muted-foreground">
                    Chọn dịch vụ từ danh sách
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
            disabled={!selectedService || isAdding}
          >
            {isAdding ? "Đang thêm..." : "Thêm dịch vụ"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
