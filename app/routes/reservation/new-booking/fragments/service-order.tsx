"use client";

import { Plus, UtensilsCrossed, Trash2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { Badge } from "~/components/ui/badge";
import { Separator } from "~/components/ui/separator";
import { formatMoney } from "~/lib/utils";
import { useState } from "react";
import AddServiceDialog from "~/features/service-order-dialog";
import type z from "zod";
import useServiceSchema from "~/services/schema/service.schema";

const { ServiceOrderItemSchema } = useServiceSchema();
type ServiceOrderItemDto = z.infer<typeof ServiceOrderItemSchema>;

interface ServiceOrderProps {
  services?: ServiceOrderItemDto[];
  onAddServices?: (services: ServiceOrderItemDto[]) => void;
  onRemoveService?: (index: number) => void;
}

export function ServiceOrder({
  services = [],
  onAddServices,
  onRemoveService,
}: ServiceOrderProps) {
  const [openServiceDialog, setOpenServiceDialog] = useState(false);

  const handleConfirmServices = (newServices: ServiceOrderItemDto[]) => {
    onAddServices?.(newServices);
  };

  const serviceTotal = 0;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <UtensilsCrossed className="h-5 w-5" />
            Dịch vụ kèm theo
          </CardTitle>
          <Badge variant="secondary" className="text-xs">
            Tùy chọn
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Add Service Button */}
        <Button
          type="button"
          variant="outline"
          className="w-full"
          onClick={() => setOpenServiceDialog(true)}
        >
          <Plus className="h-4 w-4 mr-2" />
          Thêm dịch vụ
        </Button>
        <AddServiceDialog
          open={openServiceDialog}
          onOpenChange={setOpenServiceDialog}
          onConfirm={handleConfirmServices}
        />
        {/* Services List */}
        {services.length > 0 ? (
          <>
            <Separator />
            <div className="space-y-3">
              <h4 className="font-semibold text-sm">
                Dịch vụ đã chọn ({services.length})
              </h4>
              {services.map((service, index) => (
                <div
                  key={index}
                  className="flex items-start justify-between p-3 rounded-md border bg-muted/30"
                >
                  <div className="flex-1 space-y-1">
                    <p className="font-medium text-sm">{service.itemType}</p>
                    <p className="text-xs text-muted-foreground">
                      Số lượng: {service.quantity}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Ngày thực hiện: {service.scheduledDate}
                    </p>
                    {service.note && (
                      <p className="text-xs text-muted-foreground italic">
                        Ghi chú: {service.note}
                      </p>
                    )}
                  </div>

                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 shrink-0"
                    onClick={() => onRemoveService?.(index)}
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                    <span className="sr-only">Xóa dịch vụ</span>
                  </Button>
                </div>
              ))}
            </div>

            <Separator />

            {/* Service Total */}
            <div className="flex justify-between items-center p-3 bg-muted/50 rounded-lg">
              <span className="font-medium text-sm">Tổng tiền dịch vụ</span>
              <span className="font-bold text-primary">
                {formatMoney(serviceTotal).vndFormatted}
              </span>
            </div>
          </>
        ) : (
          <div className="text-center py-8 text-sm text-muted-foreground">
            <UtensilsCrossed className="h-12 w-12 mx-auto mb-2 opacity-20" />
            <p>Chưa có dịch vụ nào</p>
            <p className="text-xs mt-1">
              Nhấn "Thêm dịch vụ" để đặt dịch vụ kèm theo
            </p>
          </div>
        )}

        <p className="text-xs text-muted-foreground">
          * Dịch vụ sẽ được tính chung vào tổng hóa đơn
        </p>
      </CardContent>
    </Card>
  );
}
