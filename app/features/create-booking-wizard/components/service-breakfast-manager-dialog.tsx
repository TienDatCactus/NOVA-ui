import { format } from "date-fns";
import { CheckCircle2, Coffee, Plus, UtensilsCrossed } from "lucide-react";
import { useState } from "react";
import { type UseFormReturn } from "react-hook-form";
import { toast } from "sonner";
import type z from "zod";

import { Button } from "~/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog";
import { ScrollArea } from "~/components/ui/scroll-area";
import { OrderSchema } from "~/services/api/orders/order.schema";

import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "~/components/ui/empty";
import { Label } from "~/components/ui/label";
import { Switch } from "~/components/ui/switch";
import { cn } from "~/lib/utils";
import { ServiceOrderTable } from "../fragments/service-order-table";
import AddServiceDialog from "./add-service-dialog";

const { ServiceOrderItemSchema } = OrderSchema;
type ServiceOrderItem = z.infer<typeof ServiceOrderItemSchema>;

interface ServiceBreakfastManagerDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  form: UseFormReturn<any>;
}

export default function ServiceBreakfastManagerDialog({
  open,
  onOpenChange,
  form,
}: ServiceBreakfastManagerDialogProps) {
  const [addServiceDialogOpen, setAddServiceDialogOpen] = useState(false);

  // === FORM WATCHERS ===
  const checkinDate = form.watch("dateRange.from");
  const checkoutDate = form.watch("dateRange.to");
  const isBreakfastAll = form.watch("isBreakfastAll") || false;
  const services = form.watch("serviceOrder.services") || [];

  // === LOGIC ===

  const handleAddService = (
    serviceId: string,
    itemType: "ServiceItem" | "MenuItem" = "ServiceItem",
    quantity: number = 1
  ) => {
    const exists = services.find(
      (s: ServiceOrderItem) => s.itemId === serviceId
    );

    if (exists) {
      // Update quantity if item already exists
      const updated = services.map((s: ServiceOrderItem) =>
        s.itemId === serviceId ? { ...s, quantity } : s
      );
      form.setValue("serviceOrder.services", updated, { shouldValidate: true });
      toast.success("Đã cập nhật số lượng");
    } else {
      const defaultDate = checkinDate
        ? format(
            new Date(checkinDate.getTime() + 24 * 60 * 60 * 1000),
            "yyyy-MM-dd"
          )
        : format(new Date(), "yyyy-MM-dd");

      const newService: ServiceOrderItem = {
        itemType: itemType,
        itemId: serviceId,
        quantity: quantity,
        scheduledDate: defaultDate,
        note: "",
      };

      form.setValue("serviceOrder.services", [...services, newService], {
        shouldValidate: true,
      });
      toast.success("Đã thêm dịch vụ");
    }
  };

  const handleRemoveService = (serviceId: string) => {
    const updated = services.filter(
      (s: ServiceOrderItem) => s.itemId !== serviceId
    );
    form.setValue("serviceOrder.services", updated, { shouldValidate: true });
  };

  const handleUpdateService = (
    serviceId: string,
    updates: Partial<ServiceOrderItem>
  ) => {
    const updated = services.map((s: ServiceOrderItem) =>
      s.itemId === serviceId ? { ...s, ...updates } : s
    );
    form.setValue("serviceOrder.services", updated, { shouldValidate: true });
  };

  const handleBreakfastToggleAll = (value: boolean) => {
    form.setValue("isBreakfastAll", value, { shouldValidate: true });
  };
  console.log(form.getValues("serviceOrder"));
  const hasDates = checkinDate && checkoutDate;

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-3xl p-0 gap-0 outline-none overflow-hidden sm:rounded-xl">
          {/* === HEADER === */}
          <DialogHeader className="px-6 py-5 border-b border-border/60 bg-background/95 ">
            <DialogTitle className="text-xl font-semibold tracking-tight">
              Dịch vụ & Tiện ích
            </DialogTitle>
            <DialogDescription className="text-xs uppercase tracking-wider font-medium text-muted-foreground/80">
              Quản lý Bữa sáng • Spa • Giặt ủi • Di chuyển
            </DialogDescription>
          </DialogHeader>

          <ScrollArea className="max-h-[70vh]">
            <div className="flex flex-col gap-6 p-6">
              {/* === SECTION 1: BREAKFAST === */}
              <div
                className={cn(
                  "flex flex-row items-center justify-between rounded-xl border p-5 transition-all duration-200",
                  isBreakfastAll
                    ? "border-primary/50 bg-primary/5 shadow-sm"
                    : "border-border bg-muted/20"
                )}
              >
                <div className="flex gap-4">
                  <div
                    className={cn(
                      "flex h-10 w-10 shrink-0 items-center justify-center rounded-full border",
                      isBreakfastAll
                        ? "bg-background border-primary/30 text-primary"
                        : "bg-background border-border text-muted-foreground"
                    )}
                  >
                    <Coffee className="h-5 w-5" />
                  </div>
                  <div className="space-y-1">
                    <Label
                      htmlFor="breakfast"
                      className="text-base font-medium cursor-pointer"
                    >
                      Lịch trình Bữa sáng
                    </Label>
                    <p className="text-sm text-muted-foreground leading-snug">
                      Bao gồm suất ăn sáng cho tất cả các ngày trong kỳ nghỉ.
                    </p>
                  </div>
                </div>
                <Switch
                  id="breakfast"
                  checked={isBreakfastAll}
                  onCheckedChange={handleBreakfastToggleAll}
                  className="data-[state=checked]:bg-primary"
                />
              </div>

              <div className="h-px bg-border/50" />

              {/* === SECTION 2: ADDITIONAL SERVICES === */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
                      Dịch vụ bổ sung
                      <span className="inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80">
                        {services.length}
                      </span>
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      Spa, đưa đón, hoặc các yêu cầu đặc biệt khác.
                    </p>
                  </div>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setAddServiceDialogOpen(true)}
                    disabled={!hasDates}
                    className="h-9 border-dashed shadow-sm hover:border-primary hover:bg-primary/5 hover:text-primary transition-all"
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Thêm dịch vụ
                  </Button>
                </div>

                <div className="min-h-[200px]">
                  {services.length > 0 ? (
                    <div className="overflow-hidden rounded-xl border border-border bg-card shadow-sm">
                      <ServiceOrderTable
                        services={services}
                        onRemove={handleRemoveService}
                        onUpdate={handleUpdateService}
                        checkinDate={checkinDate}
                        checkoutDate={checkoutDate}
                      />
                    </div>
                  ) : (
                    <Empty>
                      <EmptyHeader className="border-2 border-dashed border-muted-foreground/20 rounded-xl py-10">
                        <EmptyMedia
                          variant="icon"
                          className="bg-muted/50 p-3 rounded-full mb-2"
                        >
                          <UtensilsCrossed className="h-6 w-6 text-muted-foreground" />
                        </EmptyMedia>
                        <EmptyTitle className="mt-2 text-base">
                          Chưa có dịch vụ nào
                        </EmptyTitle>
                        <EmptyDescription className="max-w-[250px] mx-auto">
                          {hasDates
                            ? "Nhấn 'Thêm dịch vụ' để thiết lập tiện ích cho khách hàng."
                            : "Vui lòng chọn ngày nhận/trả phòng trước khi thêm dịch vụ."}
                        </EmptyDescription>
                        {hasDates && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setAddServiceDialogOpen(true)}
                            className="mt-4 text-primary hover:bg-primary/10 hover:text-primary"
                          >
                            Thêm ngay
                          </Button>
                        )}
                      </EmptyHeader>
                    </Empty>
                  )}
                </div>
              </div>
            </div>
          </ScrollArea>

          {/* === FOOTER === */}
          <DialogFooter className="flex flex-row items-center justify-between border-t bg-muted/20 px-6 py-4 sm:justify-between">
            <div className="flex flex-col text-sm">
              {/* Optional: Show Total Cost here if you have the data */}
              <span className="text-muted-foreground text-xs font-medium">
                Tổng tạm tính
              </span>
              <span className="font-bold text-base text-primary">
                {/* Format currency here, e.g. 1.200.000 ₫ */}
                --
              </span>
            </div>
            <div className="flex gap-2">
              <Button variant="ghost" onClick={() => onOpenChange(false)}>
                Đóng
              </Button>
              <Button
                onClick={() => onOpenChange(false)}
                className="min-w-[120px] shadow-sm"
              >
                <CheckCircle2 className="mr-2 h-4 w-4" />
                Hoàn tất
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Service Dialog */}
      <AddServiceDialog
        open={addServiceDialogOpen}
        onOpenChange={setAddServiceDialogOpen}
        onAddService={handleAddService}
        selectedServiceIds={services.map((s: ServiceOrderItem) => s.itemId)}
        existingServices={services}
      />
    </>
  );
}
