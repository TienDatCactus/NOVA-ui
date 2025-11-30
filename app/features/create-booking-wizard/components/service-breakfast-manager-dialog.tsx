import { format } from "date-fns";
import { Coffee, Plus, Sparkles, Utensils } from "lucide-react";
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

import { BreakfastSelection } from "../fragments/breakfast-selection";
import { ServiceOrderTable } from "../fragments/service-order-table";
import AddServiceDialog from "./add-service-dialog";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "~/components/ui/empty";

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
  const breakfastDates = form.watch("breakfastDates") || [];
  const services = form.watch("serviceOrder.services") || [];

  // === LOGIC ===
  const nights = (() => {
    if (!checkinDate || !checkoutDate) return 0;
    const diff = checkoutDate.getTime() - checkinDate.getTime();
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  })();

  const handleAddService = (serviceId: string) => {
    const exists = services.find(
      (s: ServiceOrderItem) => s.itemId === serviceId
    );

    if (exists) {
      // Logic: Toggle off if exists (optional, or just ignore)
      const updated = services.filter(
        (s: ServiceOrderItem) => s.itemId !== serviceId
      );
      form.setValue("serviceOrder.services", updated, { shouldValidate: true });
    } else {
      // Logic: Add new
      const defaultDate = checkinDate
        ? format(checkinDate, "yyyy-MM-dd")
        : format(new Date(), "yyyy-MM-dd");

      const newService: ServiceOrderItem = {
        itemType: "ServiceItem",
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
    if (value) {
      form.setValue("breakfastDates", [], { shouldValidate: true });
    }
  };

  const handleBreakfastDatesChange = (dates: Date[]) => {
    form.setValue("breakfastDates", dates, { shouldValidate: true });
  };

  const hasDates = checkinDate && checkoutDate;

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-3xl p-0 gap-0 outline-none overflow-hidden">
          {/* === HEADER === */}
          <DialogHeader className="px-6 py-5 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/5 text-primary ring-1 ring-inset ring-primary/10">
                <Utensils className="h-5 w-5" />
              </div>
              <div className="space-y-1">
                <DialogTitle className="text-xl font-semibold tracking-tight">
                  Dịch vụ & Tiện ích
                </DialogTitle>
                <DialogDescription className="text-xs uppercase tracking-wider font-mono">
                  Quản lý Bữa sáng • Spa • Giặt ủi • Di chuyển
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          {/* === BODY === */}
          <ScrollArea className="max-h-[75vh]">
            <div className="flex flex-col gap-8 p-6">
              {/* SECTION 1: BREAKFAST */}
              <div className="space-y-4">
                <div className="flex-1 space-y-1">
                  <h3 className="text-sm font-semibold text-foreground">
                    Lịch trình Bữa sáng
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Chọn các ngày khách hàng đặt kèm bữa sáng.
                  </p>
                </div>

                {/* Indented Content */}
                <div className="rounded-xl border border-border bg-card/50 p-4 shadow-sm">
                  <BreakfastSelection
                    isBreakfastAll={isBreakfastAll}
                    breakfastDates={breakfastDates}
                    onToggleAll={handleBreakfastToggleAll}
                    onSelectDates={handleBreakfastDatesChange}
                    checkinDate={checkinDate || new Date()}
                    checkoutDate={checkoutDate || new Date()}
                    nights={nights}
                  />
                </div>
              </div>

              <Separator className="opacity-50" />

              {/* SECTION 2: SERVICES */}
              <div className="space-y-4">
                <div className="flex items-center justify-between gap-4">
                  <div className="space-y-1">
                    <h3 className="text-sm font-semibold text-foreground">
                      Dịch vụ bổ sung
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      Spa, đưa đón sân bay, hoặc các yêu cầu đặc biệt.
                    </p>
                  </div>

                  {/* Action Button: Visible here for quick access */}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setAddServiceDialogOpen(true)}
                    disabled={!hasDates}
                    className="h-8 gap-2 border-dashed border-border hover:border-primary hover:bg-primary/5 hover:text-primary transition-all"
                  >
                    <Plus className="h-3.5 w-3.5" />
                    <span className="hidden sm:inline">Thêm dịch vụ</span>
                    <span className="sm:hidden">Thêm</span>
                  </Button>
                </div>

                {/* Indented Content */}
                <div>
                  {services.length > 0 ? (
                    <div className="overflow-hidden rounded-xl border border-border shadow-sm">
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
                      <EmptyHeader>
                        <EmptyMedia variant={"icon"}>
                          <Plus className="h-5 w-5" />
                        </EmptyMedia>
                        <EmptyTitle>Chưa có dịch vụ nào</EmptyTitle>
                        <EmptyDescription>
                          {hasDates
                            ? "Nhấn để thêm dịch vụ vào đơn đặt phòng"
                            : "Vui lòng chọn ngày nhận/trả phòng trước"}
                        </EmptyDescription>
                      </EmptyHeader>
                      <EmptyContent>
                        <Button
                          variant="outline"
                          onClick={() =>
                            hasDates && setAddServiceDialogOpen(true)
                          }
                        >
                          Thêm dịch vụ
                        </Button>
                      </EmptyContent>
                    </Empty>
                  )}
                </div>
              </div>
            </div>
          </ScrollArea>

          {/* === FOOTER === */}
          <div className="flex items-center justify-between border-t bg-muted/20 px-6 py-4">
            <div className="flex items-center gap-2 text-[10px] text-muted-foreground uppercase tracking-wider font-medium">
              <span className="block h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Auto-saving
            </div>
            <Button
              onClick={() => onOpenChange(false)}
              className="min-w-[100px]"
            >
              Hoàn tất
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
