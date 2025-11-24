import { useState, useMemo } from "react";
import { type UseFormReturn } from "react-hook-form";
import { AlertCircle, Plus, UtensilsCrossed } from "lucide-react";

import { Button } from "~/components/ui/button";
import { Card, CardContent } from "~/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "~/components/ui/alert";
import { Badge } from "~/components/ui/badge";
import { Separator } from "~/components/ui/separator";
import AddServiceDialog from "~/features/order-dialog";

import { useServiceOrderStore } from "~/store/service-order.store";

interface ServiceQuickAddWidgetProps {
  form: UseFormReturn<any>;
}

export function ServiceQuickAddWidget({ form }: ServiceQuickAddWidgetProps) {
  // 1. WATCH FORM DATA
  const checkinDate = form.watch("dateRange.from");
  const checkoutDate = form.watch("dateRange.to");
  const guestFullName = form.watch("guestFullName");
  const bookingType = form.watch("bookingType");

  // 2. GLOBAL STORE
  const services = useServiceOrderStore((s) => s.services);

  // 3. STATE
  const [serviceDialogOpen, setServiceDialogOpen] = useState(false);

  // 4. VALIDATION LOGIC (Check date range)
  const invalidServices = useMemo(() => {
    if (!checkinDate || !checkoutDate) return [];

    const start = new Date(checkinDate);
    const end = new Date(checkoutDate);

    return services.filter((service) => {
      if (!service.scheduledDate) return false;
      const scheduledDate = new Date(service.scheduledDate);
      // Reset hours để so sánh ngày chuẩn xác hơn
      start.setHours(0, 0, 0, 0);
      end.setHours(23, 59, 59, 999);
      return scheduledDate < start || scheduledDate > end;
    });
  }, [services, checkinDate, checkoutDate]);

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
            trú. Vui lòng kiểm tra lại bên giỏ hàng.
          </AlertDescription>
        </Alert>
      )}

      {/* Quick Add Bar */}
      <Card className="shadow-sm border-dashed hover:border-primary/50 transition-colors">
        <CardContent className="p-4 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
              <UtensilsCrossed className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h3 className="font-medium text-sm text-foreground">
                Dịch vụ bổ sung
              </h3>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <span>Ăn uống, Spa, Giặt ủi...</span>
                {services.length > 0 && (
                  <Badge variant="secondary" className="h-5 px-1.5">
                    Đã chọn {services.length}
                  </Badge>
                )}
              </div>
            </div>
          </div>

          <Button
            onClick={() => setServiceDialogOpen(true)}
            disabled={!checkinDate || !checkoutDate}
            className="shrink-0"
          >
            <Plus className="h-4 w-4 mr-2" />
            Thêm dịch vụ
          </Button>
        </CardContent>
      </Card>

      {/* Dialog Logic - Giữ nguyên nhưng ẩn khỏi UI chính */}
      <AddServiceDialog
        open={serviceDialogOpen}
        onOpenChange={setServiceDialogOpen}
        onConfirm={() => setServiceDialogOpen(false)}
        customerName={guestFullName || "Khách lẻ"}
        checkinDate={checkinDate}
        checkoutDate={checkoutDate}
      />
    </div>
  );
}
