import { format } from "date-fns";
import {
  Check,
  Coffee,
  ConciergeBell,
  Plus,
  Sparkles,
  Utensils,
} from "lucide-react";
import { useState } from "react";
import { type UseFormReturn } from "react-hook-form";
import type z from "zod";

import { Button } from "~/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog";
import { ScrollArea } from "~/components/ui/scroll-area";
import { Separator } from "~/components/ui/separator";
import { OrderSchema } from "~/services/api/orders/order.schema";

import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "~/components/ui/empty";
import { BreakfastSelection } from "../fragments/breakfast-selection";
import { ServiceOrderTable } from "../fragments/service-order-table";
import AddServiceDialog from "./add-service-dialog";
import { Badge } from "~/components/ui/badge";

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
  const nights = (() => {
    if (!checkinDate || !checkoutDate) return 0;
    const diff = checkoutDate.getTime() - checkinDate.getTime();
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  })();

  const handleAddService = (
    serviceId: string,
    itemType: "ServiceItem" | "MenuItem" = "ServiceItem"
  ) => {
    const exists = services.find(
      (s: ServiceOrderItem) => s.itemId === serviceId
    );

    if (exists) {
      const updated = services.filter(
        (s: ServiceOrderItem) => s.itemId !== serviceId
      );
      form.setValue("serviceOrder.services", updated, { shouldValidate: true });
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
        quantity: 1,
        scheduledDate: defaultDate,
        note: "",
      };

      form.setValue("serviceOrder.services", [...services, newService], {
        shouldValidate: true,
      });
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

  const hasDates = checkinDate && checkoutDate;

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-4xl h-[85vh] p-0 gap-0 overflow-hidden bg-background/95 backdrop-blur-sm">
          {/* Header */}
          <DialogHeader className="px-6 py-5 border-b bg-background/50 z-10 shrink-0">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary shadow-sm ring-1 ring-primary/20">
                <ConciergeBell className="h-6 w-6" />
              </div>
              <div className="space-y-1">
                <DialogTitle className="text-xl">
                  Dịch vụ & Tiện ích
                </DialogTitle>
                <DialogDescription className="flex items-center gap-2 text-xs">
                  <Badge
                    variant="outline"
                    className="font-normal text-muted-foreground bg-background/50"
                  >
                    <Coffee className="h-3 w-3 mr-1" /> Bữa sáng
                  </Badge>
                  <Badge
                    variant="outline"
                    className="font-normal text-muted-foreground bg-background/50"
                  >
                    <Sparkles className="h-3 w-3 mr-1" /> Spa & Laundry
                  </Badge>
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          {/* Scrollable Content */}
          <ScrollArea className="flex-1">
            <div className="flex flex-col gap-8 p-6 md:p-8">
              {/* 1. Breakfast Section */}
              <section className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-semibold flex items-center gap-2">
                      <Utensils className="h-4 w-4 text-orange-500" />
                      Lịch trình Bữa sáng
                    </h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      Quản lý các suất ăn sáng theo ngày lưu trú.
                    </p>
                  </div>
                  {/* Optional: Add summary badge e.g. "5 days selected" */}
                </div>

                <div className="rounded-xl border bg-card p-1 shadow-sm overflow-hidden">
                  <BreakfastSelection
                    isBreakfastAll={isBreakfastAll}
                    onToggleAll={handleBreakfastToggleAll}
                    checkinDate={checkinDate || new Date()}
                    checkoutDate={checkoutDate || new Date()}
                    nights={nights}
                  />
                </div>
              </section>

              <Separator />

              {/* 2. Services Section */}
              <section className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-semibold flex items-center gap-2">
                      <Sparkles className="h-4 w-4 text-purple-500" />
                      Dịch vụ bổ sung
                    </h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      Spa, Giặt ủi, Minibar, Xe đưa đón...
                    </p>
                  </div>
                  <Button
                    size="sm"
                    onClick={() => setAddServiceDialogOpen(true)}
                    disabled={!hasDates}
                    className="gap-2 shadow-sm"
                  >
                    <Plus className="h-4 w-4" /> Thêm dịch vụ
                  </Button>
                </div>

                {services.length > 0 ? (
                  <div className="rounded-xl border bg-card shadow-sm overflow-hidden">
                    <ServiceOrderTable
                      services={services}
                      onRemove={handleRemoveService}
                      onUpdate={handleUpdateService}
                      checkinDate={checkinDate}
                      checkoutDate={checkoutDate}
                    />
                  </div>
                ) : (
                  <div className="rounded-xl border border-dashed bg-muted/30 p-8">
                    <Empty>
                      <EmptyHeader>
                        <EmptyMedia className="bg-background border shadow-sm">
                          <Sparkles className="h-6 w-6 text-muted-foreground" />
                        </EmptyMedia>
                        <EmptyTitle>Chưa có dịch vụ nào</EmptyTitle>
                        <EmptyDescription>
                          {hasDates
                            ? "Khách hàng chưa yêu cầu dịch vụ thêm."
                            : "Vui lòng chọn ngày lưu trú trước khi thêm dịch vụ."}
                        </EmptyDescription>
                      </EmptyHeader>
                      {hasDates && (
                        <EmptyContent>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setAddServiceDialogOpen(true)}
                          >
                            Thêm ngay
                          </Button>
                        </EmptyContent>
                      )}
                    </Empty>
                  </div>
                )}
              </section>
            </div>
          </ScrollArea>

          {/* Footer */}
          <div className="px-6 py-4 border-t bg-muted/5 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Check className="h-3.5 w-3.5 text-emerald-500" />
              <span>Tự động lưu thay đổi</span>
            </div>
            <Button
              onClick={() => onOpenChange(false)}
              className="min-w-[120px]"
            >
              Đóng
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Add Service Dialog */}
      <AddServiceDialog
        open={addServiceDialogOpen}
        onOpenChange={setAddServiceDialogOpen}
        onAddService={handleAddService}
        selectedServiceIds={services.map((s: ServiceOrderItem) => s.itemId)}
      />
    </>
  );
}
