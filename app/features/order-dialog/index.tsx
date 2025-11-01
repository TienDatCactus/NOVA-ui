import { zodResolver } from "@hookform/resolvers/zod";
import { RotateCcw, Search, X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useFieldArray, useForm } from "react-hook-form";
import z from "zod";

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
import Image from "~/components/ui/image";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { RadioGroup, RadioGroupItem } from "~/components/ui/radio-group";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";
import { cn, formatMoney } from "~/lib/utils";
import useServiceFilters from "~/routes/services/container/service-filter.hooks";
import { useServices } from "~/routes/services/container/service-query.hooks";
import { useServiceTypes } from "~/routes/services/container/service-types-query.hooks";
import { OrderSchema } from "~/services/schema/order.schema";

const { ServiceOrderItemSchema, ServiceOrderSchema } = OrderSchema;
type ServiceOrderItemDto = z.infer<typeof ServiceOrderItemSchema>;
type ServiceOrderDto = z.infer<typeof ServiceOrderSchema>;

interface AddServiceDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm?: (services: ServiceOrderItemDto[]) => void;
}

export default function AddServiceDialog({
  open,
  onOpenChange,
  onConfirm,
}: AddServiceDialogProps) {
  const [activeTab, setActiveTab] = useState<"service" | "menu">("service");
  const { data: serviceTypes = [] } = useServiceTypes();
  // const { data: menuCategories = [] } = useMenuCategories();
  const {
    updateFilter: updateServiceFilter,
    filterServices,
    resetFilters: resetServiceFilters,
    filters: serviceFilters,
  } = useServiceFilters();

  const form = useForm<ServiceOrderDto>({
    resolver: zodResolver(ServiceOrderSchema),
    defaultValues: { services: [], payment: null },
  });

  const { fields, append, remove, update } = useFieldArray({
    control: form.control,
    name: "services",
  });

  const { data: serviceItems = [] } = useServices({
    typeCode: serviceFilters.typeCode,
  });

  // const {
  //   filters: menuFilters,
  //   updateFilter: updateMenuFilter,
  //   filterMenuItems,
  //   resetFilters: resetMenuFilters,
  // } = useMenuFilter();
  // const { data: menuItems } = useMenuList();

  useEffect(() => {
    if (activeTab === "service") {
      // updateMenuFilter("searchText", "");
    } else {
      updateServiceFilter("searchText", "");
    }
  }, [activeTab]);

  const isSelected = (itemId: string) => {
    return (form.getValues("services") || []).some((s) => s.itemId === itemId);
  };

  const toggleSelectItem = (itemId: string, itemType: string) => {
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

  const filteredServiceItems = useMemo(() => {
    return filterServices(serviceItems);
  }, [serviceItems, serviceFilters]);
  // const filteredMenuItems = useMemo(() => {
  //   return filterMenuItems(menuItems || []);
  // }, [menuItems, menuFilters]);

  const totalSelected = form.getValues("services")?.length || 0;

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        if (!v) form.reset();
        onOpenChange(v);
      }}
    >
      <DialogContent className="max-w-[90vw] p-0  bg-white">
        <DialogHeader className="p-6 border-b">
          <DialogTitle>Thêm món ăn / dịch vụ</DialogTitle>
          <DialogDescription>
            Chọn từ Thực đơn hoặc Dịch vụ, chỉnh số lượng và ghi chú.
          </DialogDescription>
        </DialogHeader>

        <div className="px-6 grid gap-4 flex-1 max-h-[70vh] overflow-y-auto">
          <div className="grid md:grid-cols-12 grid-cols-1 gap-4">
            <div className="col-span-3 border rounded-lg p-4 h-[60vh] overflow-y-auto">
              <Tabs
                defaultValue={activeTab}
                onValueChange={(v) => {
                  setActiveTab(v as "service" | "menu");
                }}
                className="gap-4"
              >
                <TabsList className="w-full">
                  <TabsTrigger
                    value={"services"}
                    className="flex items-center gap-1 px-2.5 sm:px-3"
                  >
                    Dịch vụ{" "}
                    <Badge className="h-5 min-w-5 rounded-full px-1 tabular-nums">
                      {filteredServiceItems.length}
                    </Badge>
                  </TabsTrigger>
                  <TabsTrigger
                    value={"menu"}
                    className="flex items-center gap-1 px-2.5 sm:px-3"
                  >
                    Menu
                    <Badge className="h-5 min-w-5 rounded-full px-1 tabular-nums">
                      {/* {filteredMenuItems.length} */}
                    </Badge>
                  </TabsTrigger>
                </TabsList>
                <TabsContent value={"services"} className="space-y-4">
                  <div className="flex justify-end">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        resetServiceFilters();
                      }}
                    >
                      <RotateCcw /> Đặt lại
                    </Button>
                  </div>
                  <RadioGroup
                    className="w-full max-w-96 justify-items-center sm:grid-cols-2"
                    value={serviceFilters.typeCode}
                    onValueChange={(value) => {
                      updateServiceFilter("typeCode", value);
                    }}
                  >
                    {serviceTypes.map((t) => (
                      <div className="border-input shadow-s has-data-[state=checked]:border-primary/50 relative flex w-full max-w-50  items-center gap-3 rounded-md border p-4 cursor-pointer outline-none">
                        <RadioGroupItem
                          value={t.code}
                          id={t.id}
                          className="order-1 size-5 after:absolute after:inset-0 [&_svg]:size-3"
                          aria-describedby={`${t.id}-description`}
                          aria-label="plan-radio-basic"
                        />
                        <div className="grid grow gap-2">
                          <Label
                            htmlFor={`${t.id}-1`}
                            className="text-start line-clamp-1"
                          >
                            {t.name}
                          </Label>
                          <p
                            id={`${t.id}-description`}
                            className="text-muted-foreground text-start text-xs line-clamp-2"
                          >
                            {t.description}
                          </p>
                        </div>
                      </div>
                    ))}
                  </RadioGroup>
                </TabsContent>
                <TabsContent value={"menu"}>
                  <div className="flex justify-end">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        // resetMenuFilters();
                      }}
                    >
                      <RotateCcw /> Đặt lại
                    </Button>
                  </div>
                  <RadioGroup
                    className="w-full max-w-96 justify-items-center sm:grid-cols-2"
                    // value={menuFilters.categoryCode}
                    onValueChange={(value) => {
                      updateServiceFilter("typeCode", value);
                    }}
                  >
                    {/* {menuCategories.map((m) => (
                      <div className="border-input shadow-s has-data-[state=checked]:border-primary/50 relative flex w-full max-w-50  items-center gap-3 rounded-md border p-4 cursor-pointer outline-none">
                        <RadioGroupItem
                          value={m.code}
                          id={m.id}
                          className="order-1 size-5 after:absolute after:inset-0 [&_svg]:size-3"
                          aria-describedby={`${m.id}-description`}
                          aria-label="plan-radio-basic"
                        />
                        <div className="grid grow gap-2">
                          <Label
                            htmlFor={`${m.id}-1`}
                            className="text-start line-clamp-1"
                          >
                            {m.name}
                          </Label>
                        </div>
                      </div>
                    ))} */}
                  </RadioGroup>
                </TabsContent>
              </Tabs>
            </div>

            <div className="col-span-6 space-y-4">
              <div className="flex items-center justify-end">
                <Input
                  placeholder={
                    activeTab === "service"
                      ? "Tìm kiếm dịch vụ"
                      : "Tìm kiếm món ăn"
                  }
                  onChange={(e) => {
                    if (activeTab === "service")
                      updateServiceFilter("searchText", e.target.value);
                    // else updateMenuFilter("searchText", e.target.value);
                  }}
                  className="w-60"
                  endAddon={<Search />}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-0 h-[60vh] overflow-y-auto">
                {activeTab === "service" &&
                  (serviceItems.length === 0 ? (
                    <div className="text-center text-muted-foreground col-span-2">
                      Không có dịch vụ
                    </div>
                  ) : (
                    filteredServiceItems.map((item: any) => (
                      <Card
                        key={item.serviceItemId}
                        className={cn(
                          "p-3 border cursor-pointer",
                          isSelected(item.serviceItemId) &&
                            "ring-2 ring-primary"
                        )}
                        onClick={() =>
                          toggleSelectItem(item.serviceItemId, "service")
                        }
                      >
                        <div className="space-y-2">
                          <div className="h-28 bg-muted rounded-md flex items-center justify-center">
                            <Image
                              src={item.imageUrl || ""}
                              alt={item.name}
                              className="h-full w-full object-cover rounded-md"
                            />
                          </div>
                          <div>
                            <p className="font-medium">{item.name}</p>
                            <p className="text-xs text-muted-foreground line-clamp-2">
                              {item.description}
                            </p>
                            <p className="text-sm font-semibold text-primary mt-1">
                              {item.basePrice
                                ? formatMoney(item.basePrice).vndFormatted
                                : ""}
                            </p>
                          </div>
                        </div>
                      </Card>
                    ))
                  ))
                  // ) : filteredMenuItems.length === 0 ? (
                  //   <div className="text-center text-muted-foreground col-span-2">
                  //     Không có món ăn
                  //   </div>
                  // ) : (
                  //   filteredMenuItems?.map((item: any) => (
                  //     <Card
                  //       key={item.itemId}
                  //       className={cn(
                  //         "p-3 border cursor-pointer",
                  //         isSelected(item.itemId) && "ring-2 ring-primary"
                  //       )}
                  //       onClick={() => toggleSelectItem(item.itemId, "menu")}
                  //     >
                  //       <div className="space-y-2">
                  //         <div className="h-28 bg-muted rounded-md flex items-center justify-center">
                  //           {" "}
                  //         </div>
                  //         <div>
                  //           <p className="font-medium">{item.name}</p>
                  //           <p className="text-xs text-muted-foreground line-clamp-2">
                  //             {item.description}
                  //           </p>
                  //           <p className="text-sm font-semibold text-primary mt-1">
                  //             {item.price
                  //               ? formatMoney(item.price).vndFormatted
                  //               : ""}
                  //           </p>
                  //         </div>
                  //       </div>
                  //     </Card>
                  //   ))
                }
              </div>
            </div>

            <div className="col-span-3 border rounded-lg p-4 h-[60vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">
                  Đã chọn ({totalSelected})
                </h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    form.reset();
                  }}
                >
                  Xóa tất cả
                </Button>
              </div>

              <div className="space-y-3">
                {fields.length === 0 ? (
                  <div className="text-sm text-muted-foreground">
                    Chưa có sản phẩm nào được chọn
                  </div>
                ) : (
                  fields.map((f, idx) => (
                    <Card key={f.id} className="p-3">
                      <div className="flex items-start gap-3">
                        <div className="flex-1">
                          <p className="font-medium">
                            {(f.itemType === "service" &&
                              serviceItems.find(
                                (s: any) => s.serviceItemId === f.itemId
                              )?.name) ||
                              f.itemId}
                            {/* // : menuItems?.find(
                              //     (m: any) => m.itemId === f.itemId
                              //   )?.categoryName || f.itemId} */}
                          </p>
                          <div className="flex items-center gap-2 mt-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                const val = Math.max(
                                  1,
                                  (form.getValues(`services.${idx}.quantity`) ||
                                    1) - 1
                                );
                                form.setValue(`services.${idx}.quantity`, val);
                              }}
                            >
                              -
                            </Button>
                            <div className="px-3">
                              {form.getValues(`services.${idx}.quantity`)}
                            </div>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                const val =
                                  (form.getValues(`services.${idx}.quantity`) ||
                                    1) + 1;
                                form.setValue(`services.${idx}.quantity`, val);
                              }}
                            >
                              +
                            </Button>
                            <Input
                              type="date"
                              value={form.getValues(
                                `services.${idx}.scheduledDate`
                              )}
                              onChange={(e) =>
                                form.setValue(
                                  `services.${idx}.scheduledDate`,
                                  e.target.value
                                )
                              }
                              className="ml-2"
                            />
                          </div>
                          <div className="mt-2">
                            <Label className="text-xs">Ghi chú</Label>
                            {/* <Input
                              value={form.getValues(`services.${idx}.note`)}
                              onChange={(e) =>
                                form.setValue(
                                  `services.${idx}.note`,
                                  e.target.value
                                )
                              }
                            /> */}
                          </div>
                        </div>
                        <div className="shrink-0">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => remove(idx)}
                          >
                            <X />
                          </Button>
                        </div>
                      </div>
                    </Card>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>

        <DialogFooter className="border-t p-6 flex items-center justify-between">
          <div>
            <Button
              variant="outline"
              onClick={() => {
                onOpenChange(false);
                form.reset();
              }}
            >
              Hủy
            </Button>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              onClick={() => {
                form.reset();
              }}
            >
              <RotateCcw />
              Đặt lại
            </Button>
            <Button onClick={handleConfirm} disabled={fields.length === 0}>
              Xác nhận ({fields.length})
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
