"use client";

import { Plus, UtensilsCrossed } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { Badge } from "~/components/ui/badge";
import { Separator } from "~/components/ui/separator";
import { useState } from "react";
import AddServiceDialog from "~/features/order-dialog";
import { ServiceOrderItem } from "./service-order-item";
import { useServiceOrderStore } from "~/store/service-order.store";

export function ServiceOrder() {
  const [openServiceDialog, setOpenServiceDialog] = useState(false);

  // Get services and actions from global store
  const services = useServiceOrderStore((s) => s.services);
  const removeById = useServiceOrderStore((s) => s.removeById);

  const handleConfirmServices = () => {
    // Services are already in the global store when dialog confirms
    // Just close the dialog
    setOpenServiceDialog(false);
  };

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
              {services.map((service) => (
                <ServiceOrderItem
                  key={service.itemId}
                  service={service}
                  onRemove={() => removeById(service.itemId)}
                />
              ))}
            </div>

            <Separator />

            {/* Service Total */}
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
