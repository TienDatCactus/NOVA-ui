import { useMemo, useState } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import z from "zod";
import { X, UtensilsCrossed, Search, RotateCcw } from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog";
import { Button } from "~/components/ui/button";
import { Card } from "~/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "~/components/ui/form";
import { Checkbox } from "~/components/ui/checkbox";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";
import { cn, formatMoney } from "~/lib/utils";
import useServiceSchema from "~/services/schema/service.schema";
import { useServices } from "~/routes/services/container/service-query.hooks";
import type { ServiceItem } from "~/services/api/services/dto";
import { useServiceTypes } from "~/routes/services/container/service-types-query.hooks";
import ServiceDetailForm from "./components/service-detail-form";
import { Label } from "~/components/ui/label";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import useServiceFilters from "~/routes/services/container/service-filter.hooks";
import { Input } from "~/components/ui/input";
import Image from "~/components/ui/image";

const { ServiceOrderItemSchema, ServiceOrderSchema } = useServiceSchema();
type ServiceOrderItemDto = z.infer<typeof ServiceOrderItemSchema>;
type ServiceOrderDto = z.infer<typeof ServiceOrderSchema>;

interface AddServiceDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm?: (services: ServiceOrderItemDto[]) => void;
}

export function AddServiceDialog({
  open,
  onOpenChange,
  onConfirm,
}: AddServiceDialogProps) {
  const { data: serviceTypes } = useServiceTypes();
  const [selectedServiceId, setSelectedServiceId] = useState<string | null>(
    null
  );
  const form = useForm<ServiceOrderDto>({
    resolver: zodResolver(ServiceOrderSchema),
    defaultValues: {
      services: [],
      payment: null,
    },
  });

  const { fields, remove } = useFieldArray({
    control: form.control,
    name: "services",
  });
  const { updateFilter, filters, filterServices, resetFilters } =
    useServiceFilters();
  const { data: serviceItems } = useServices({
    typeCode: filters.typeCode !== "all" ? filters.typeCode : undefined,
  });
  const filteredServiceItems = useMemo(() => {
    return filterServices(serviceItems || []);
  }, [serviceItems, filters, filterServices]);
  const selectedService: ServiceItem | null = useMemo(() => {
    if (!selectedServiceId || !serviceItems?.length) return null;
    return (
      serviceItems.find((s) => s.serviceItemId === selectedServiceId) || null
    );
  }, [selectedServiceId, serviceItems]);

  const handleConfirmAll = () => {
    const services = form.getValues("services") || [];
    onConfirm?.(services);
    form.reset();
    setSelectedServiceId(null);
    onOpenChange(false);
  };
  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        if (!v) {
          form.reset();
          setSelectedServiceId(null);
        }
        onOpenChange(v);
      }}
    >
      <DialogContent className="max-w-[1000px] p-0 max-h-[90vh] bg-white">
        <DialogHeader className="p-6 border-b">
          <DialogTitle>Thêm dịch vụ vào đặt phòng</DialogTitle>
          <DialogDescription>
            Chọn dịch vụ từ danh sách và điền thông tin chi tiết
          </DialogDescription>
        </DialogHeader>

        <div className="px-6  grid gap-4 flex-1 max-h-[60vh] overflow-y-auto">
          <Tabs defaultValue="service" className="space-y-4">
            <TabsList>
              <TabsTrigger value="service">Dịch vụ</TabsTrigger>
              <TabsTrigger value="menu">Thực đơn</TabsTrigger>
            </TabsList>

            <TabsContent value="service" className="space-y-2">
              <div className="flex gap-2 items-end">
                <div>
                  <Label
                    id="service-types"
                    className="text-sm text-muted-foreground mb-2"
                  >
                    Danh mục dịch vụ
                  </Label>
                  <Select
                    defaultValue="all"
                    onValueChange={(value) => updateFilter("typeCode", value)}
                  >
                    <SelectTrigger
                      id="service-types"
                      className="w-60 shadow-md"
                    >
                      <SelectValue placeholder="Chọn loại dịch vụ" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        <SelectLabel>Loại dịch vụ</SelectLabel>
                        <SelectItem value="all">Tất cả</SelectItem>
                        {serviceTypes?.map((c) => (
                          <SelectItem value={c.code}>{c.name}</SelectItem>
                        ))}
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Input
                    onChange={(e) => updateFilter("searchText", e.target.value)}
                    endAddon={<Search />}
                    placeholder="Tìm kiếm dịch vụ"
                    className="shadow-md"
                  />
                </div>
                <Button variant="outline" onClick={() => resetFilters()}>
                  <RotateCcw /> Xóa
                </Button>
              </div>
              <div className="grid md:grid-cols-12 grid-cols-1 gap-4 h-[500px]">
                <div className="col-span-4 border rounded-lg p-3 overflow-y-auto">
                  <h3 className="font-semibold text-sm mb-3">Chọn dịch vụ</h3>
                  {filteredServiceItems?.length === 0 ? (
                    <p className="text-sm text-muted-foreground text-center py-8">
                      Không có dịch vụ
                    </p>
                  ) : (
                    <div className="space-y-2">
                      {filteredServiceItems?.map((item) => {
                        const isSelected =
                          selectedServiceId === item.serviceItemId;
                        return (
                          <Card
                            key={item.serviceItemId}
                            className={cn(
                              "p-0 border cursor-pointer transition-all hover:shadow-md",
                              isSelected &&
                                "ring-2 ring-primary border-primary bg-accent/30"
                            )}
                            onClick={() =>
                              setSelectedServiceId(item.serviceItemId)
                            }
                          >
                            <div className="p-3 space-y-2">
                              <div className="w-full h-24 bg-muted rounded-md flex items-center justify-center">
                                {/* <Image
                                  src={item. || ""}
                                  alt={item.name}
                                  className="object-cover w-full h-full rounded-md"
                                /> */}
                              </div>
                              <div>
                                <p className="font-medium text-sm">
                                  {item.name}
                                </p>
                                <p className="text-xs text-muted-foreground line-clamp-2">
                                  {item.description}
                                </p>
                              </div>
                              {item.basePrice ? (
                                <p className="text-sm font-semibold text-primary">
                                  {formatMoney(item.basePrice).vndFormatted}
                                </p>
                              ) : null}
                            </div>
                          </Card>
                        );
                      })}
                    </div>
                  )}
                </div>

                <div className="col-span-4">
                  {selectedService ? (
                    <ServiceDetailForm
                      form={form}
                      selectedService={selectedService}
                      onCancel={() => setSelectedServiceId(null)}
                      onSuccess={() => setSelectedServiceId(null)}
                    />
                  ) : (
                    <div className="border rounded-lg p-8 text-center">
                      <UtensilsCrossed className="h-12 w-12 mx-auto mb-3 text-muted-foreground/30" />
                      <p className="text-sm text-muted-foreground">
                        Chọn một dịch vụ từ danh sách bên trái để bắt đầu
                      </p>
                    </div>
                  )}
                </div>
                <div
                  className="border rounded-lg p-4 col-span-4 h-fit
                 overflow-y-auto "
                >
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-semibold text-sm">
                      Dịch vụ đã thêm ({fields.length})
                    </h3>
                  </div>

                  {fields.length === 0 ? (
                    <div className="text-center py-6">
                      <p className="text-sm text-muted-foreground">
                        Chưa có dịch vụ nào được thêm
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {fields.map((field, index) => {
                        const serviceItem = serviceItems?.find(
                          (s) => s.serviceItemId === field.itemId
                        );
                        return (
                          <Card
                            key={field.id}
                            className="p-3 bg-muted/30 border"
                          >
                            <div className="flex items-start justify-between gap-3">
                              <div className="flex-1 space-y-1">
                                <p className="font-medium text-sm">
                                  {serviceItem?.name || field.itemType}
                                </p>
                                <div className="flex gap-4 text-xs text-muted-foreground">
                                  <span>SL: {field.quantity}</span>
                                  <span>Ngày: {field.scheduledDate}</span>
                                </div>
                                {field.note && (
                                  <p className="text-xs text-muted-foreground italic">
                                    {field.note}
                                  </p>
                                )}
                              </div>
                              <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                className="h-7 w-7 shrink-0"
                                onClick={() => remove(index)}
                              >
                                <X className="h-4 w-4 text-destructive" />
                              </Button>
                            </div>
                          </Card>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            </TabsContent>

            {/* Menu Tab (empty placeholder) */}
            <TabsContent value="menu" className="space-y-4">
              <div className="border rounded-lg p-6 text-center text-sm text-muted-foreground">
                Nội dung Thực đơn sẽ được bổ sung sau.
              </div>
            </TabsContent>
          </Tabs>
        </div>

        <DialogFooter className="border-t p-6">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Hủy
          </Button>
          <Button onClick={handleConfirmAll} disabled={fields.length === 0}>
            Xác nhận ({fields.length} dịch vụ)
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default AddServiceDialog;
