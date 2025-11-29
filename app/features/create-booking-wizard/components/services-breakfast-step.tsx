import { useState, useMemo } from "react";
import { type UseFormReturn } from "react-hook-form";
import { AlertCircle, Coffee, Plus, Sparkles, Trash2 } from "lucide-react";
import { format } from "date-fns";
import { vi } from "date-fns/locale";

import { Button } from "~/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "~/components/ui/alert";
import { Badge } from "~/components/ui/badge";
import { Separator } from "~/components/ui/separator";
import AddServiceDialog from "./add-service-dialog";
import { BreakfastSelection } from "../fragments/breakfast-selection";
import { useServices } from "~/routes/services/container/services/query.hooks";
import type z from "zod";
import { OrderSchema } from "~/services/api/orders/order.schema";

const { ServiceOrderItemSchema } = OrderSchema;
type ServiceOrderItem = z.infer<typeof ServiceOrderItemSchema>;

interface ServiceQuickAddWidgetProps {
  form: UseFormReturn<any>;
}

export function ServiceQuickAddWidget({ form }: ServiceQuickAddWidgetProps) {
  // 1. WATCH FORM DATA
  const checkinDate = form.watch("dateRange.from");
  const checkoutDate = form.watch("dateRange.to");
  const bookingType = form.watch("bookingType");
  const isBreakfastAll = form.watch("isBreakfastAll") || false;
  const breakfastDates = form.watch("breakfastDates") || [];
  const services = form.watch("serviceOrder.services") || [];

  // 2. STATE
  const [serviceDialogOpen, setServiceDialogOpen] = useState(false);

  // 3. FETCH AVAILABLE SERVICES (for display names)
  const { data: availableServices = [] } = useServices({});

  // 4. CALCULATE NIGHTS
  const nights = useMemo(() => {
    if (!checkinDate || !checkoutDate) return 0;
    const diff = checkoutDate.getTime() - checkinDate.getTime();
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  }, [checkinDate, checkoutDate]);

  // 5. VALIDATION LOGIC (Check date range)
  const invalidServices = useMemo(() => {
    if (!checkinDate || !checkoutDate) return [];

    const start = new Date(checkinDate);
    const end = new Date(checkoutDate);
    start.setHours(0, 0, 0, 0);
    end.setHours(23, 59, 59, 999);

    return services.filter((service: ServiceOrderItem) => {
      if (!service.scheduledDate) return false;
      const scheduledDate = new Date(service.scheduledDate);
      return scheduledDate < start || scheduledDate > end;
    });
  }, [services, checkinDate, checkoutDate]);

  // 6. HANDLERS
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

      const newService = {
        itemType: "ServiceItem" as const,
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

  // Nếu là RoomBlock thì không hiện widget này
  if (bookingType === "RoomBlock") return null;

  return (
    <div className="space-y-4">
      {/* Validation Warning */}
      {invalidServices.length > 0 && (
        <Alert
          variant="destructive"
          className="py-2 shadow-sm animate-in fade-in"
        >
          <AlertCircle className="h-4 w-4" />
          <AlertTitle className="text-sm font-semibold">
            Lỗi ngày dịch vụ
          </AlertTitle>
          <AlertDescription className="text-xs">
            Có {invalidServices.length} dịch vụ nằm ngoài khoảng thời gian lưu
            trú. Vui lòng kiểm tra lại.
          </AlertDescription>
        </Alert>
      )}

      {/* === BREAKFAST SECTION === */}
      <BreakfastSelection
        isBreakfastAll={isBreakfastAll}
        breakfastDates={breakfastDates}
        onToggleAll={handleBreakfastToggleAll}
        onSelectDates={handleBreakfastDatesChange}
        checkinDate={checkinDate || new Date()}
        checkoutDate={checkoutDate || new Date()}
        nights={nights}
      />

      {/* === SERVICES SECTION === */}
      <Card className="shadow-sm">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" />
              <CardTitle className="text-base">Dịch vụ bổ sung</CardTitle>
              {services.length > 0 && (
                <Badge variant="secondary" className="h-5 px-2 text-xs">
                  {services.length}
                </Badge>
              )}
            </div>
            <Button
              size="sm"
              onClick={() => setServiceDialogOpen(true)}
              disabled={!checkinDate || !checkoutDate}
            >
              <Plus className="h-3.5 w-3.5 mr-1.5" />
              Thêm dịch vụ
            </Button>
          </div>
        </CardHeader>

        <CardContent className="space-y-3">
          {/* Selected Services List */}
          {services.length > 0 && (
            <div className="space-y-1.5">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Đã chọn
              </p>
              {services.map((service: ServiceOrderItem) => {
                const serviceDetail = availableServices.find(
                  (s) => s.serviceItemId === service.itemId
                );

                return (
                  <div
                    key={service.itemId}
                    className="flex items-center justify-between p-2 rounded-md border bg-background hover:bg-muted/30 transition-colors"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">
                        {serviceDetail?.name || service.itemId}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {service.scheduledDate
                          ? format(
                              new Date(service.scheduledDate),
                              "dd/MM/yyyy",
                              { locale: vi }
                            )
                          : "Chưa chọn ngày"}
                        {" · "}x{service.quantity}
                      </p>
                    </div>
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-7 w-7 shrink-0"
                      onClick={() => handleRemoveService(service.itemId)}
                    >
                      <Trash2 className="h-3.5 w-3.5 text-destructive" />
                    </Button>
                  </div>
                );
              })}
            </div>
          )}

          {services.length === 0 && (
            <p className="text-xs text-muted-foreground text-center py-4">
              Chưa chọn dịch vụ nào
            </p>
          )}
        </CardContent>
      </Card>

      {/* Add Service Dialog */}
      <AddServiceDialog
        open={serviceDialogOpen}
        onOpenChange={setServiceDialogOpen}
        onAddService={handleAddService}
        selectedServiceIds={services.map((s: ServiceOrderItem) => s.itemId)}
        checkinDate={checkinDate}
        checkoutDate={checkoutDate}
      />
    </div>
  );
}
