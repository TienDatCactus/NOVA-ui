import { useState } from "react";
import { type UseFormReturn } from "react-hook-form";
import { Coffee, Sparkles, X } from "lucide-react";

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

import { BreakfastSelection } from "../fragments/breakfast-selection";
import AddServiceDialog from "./add-service-dialog";
import { ServiceOrderTable } from "../fragments/service-order-table";
import type z from "zod";
import { OrderSchema } from "~/services/api/orders/order.schema";
import { format } from "date-fns";

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

  // Watch form data
  const checkinDate = form.watch("dateRange.from");
  const checkoutDate = form.watch("dateRange.to");
  const isBreakfastAll = form.watch("isBreakfastAll") || false;
  const breakfastDates = form.watch("breakfastDates") || [];
  const services = form.watch("serviceOrder.services") || [];

  // Calculate nights
  const nights = (() => {
    if (!checkinDate || !checkoutDate) return 0;
    const diff = checkoutDate.getTime() - checkinDate.getTime();
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  })();

  // Handlers
  const handleAddService = (serviceId: string) => {
    const exists = services.find(
      (s: ServiceOrderItem) => s.itemId === serviceId
    );

    if (exists) {
      // Remove
      const updated = services.filter(
        (s: ServiceOrderItem) => s.itemId !== serviceId
      );
      form.setValue("serviceOrder.services", updated, { shouldValidate: true });
    } else {
      // Add with default scheduled date (checkin date)
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

  const handleBreakfastToggleAll = (value: boolean) => {
    form.setValue("isBreakfastAll", value, { shouldValidate: true });
    if (value) {
      form.setValue("breakfastDates", [], { shouldValidate: true });
    }
  };

  const handleBreakfastDatesChange = (dates: Date[]) => {
    form.setValue("breakfastDates", dates, { shouldValidate: true });
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-4xl max-h-[85vh] p-0 gap-0">
          <DialogHeader className="px-6 pt-6 pb-4">
            <DialogTitle className="text-xl">Dịch vụ & Bữa sáng</DialogTitle>
            <DialogDescription>
              Quản lý bữa sáng và các dịch vụ bổ sung cho đặt phòng
            </DialogDescription>
          </DialogHeader>

          <ScrollArea className="flex-1 px-6">
            <div className="space-y-6 pb-6">
              {/* === BREAKFAST SECTION === */}
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Coffee className="h-5 w-5 text-primary" />
                  <h3 className="font-semibold text-base">Bữa sáng</h3>
                </div>
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

              <Separator />

              {/* === SERVICES SECTION === */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Sparkles className="h-5 w-5 text-primary" />
                    <h3 className="font-semibold text-base">Dịch vụ bổ sung</h3>
                  </div>
                  <Button
                    size="sm"
                    onClick={() => setAddServiceDialogOpen(true)}
                    disabled={!checkinDate || !checkoutDate}
                  >
                    Thêm dịch vụ
                  </Button>
                </div>

                {services.length > 0 ? (
                  <ServiceOrderTable
                    services={services}
                    onRemove={handleRemoveService}
                  />
                ) : (
                  <p className="text-sm text-muted-foreground text-center py-8 border rounded-lg border-dashed">
                    Chưa chọn dịch vụ nào
                  </p>
                )}
              </div>
            </div>
          </ScrollArea>

          <div className="px-6 py-4 border-t bg-muted/30 flex items-center justify-between">
            <p className="text-xs text-muted-foreground">
              Các thay đổi được lưu tự động
            </p>
            <Button variant="default" onClick={() => onOpenChange(false)}>
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
        checkinDate={checkinDate}
        checkoutDate={checkoutDate}
      />
    </>
  );
}
