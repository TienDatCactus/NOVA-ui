import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import type { ServicesBreakfastFormData } from "~/services/types/forms.types";
import { useCreateBookingStore } from "~/store/create-booking.store";
import { useServiceOrderStore } from "~/store/service-order.store";

import { Button } from "~/components/ui/button";
import { Form } from "~/components/ui/form";
import { onError, useCalculateNights } from "~/lib/utils";
import { FormSchema } from "~/services/schema/forms.schema";
import AddServiceDialog from "~/features/order-dialog";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Badge } from "~/components/ui/badge";
import { Separator } from "~/components/ui/separator";
import { Coffee, UtensilsCrossed, Plus, AlertCircleIcon } from "lucide-react";
import { ServiceOrderItem } from "../fragments/service-order-item";
import { BreakfastSelection } from "../fragments/breakfast-selection";
import { Alert, AlertDescription, AlertTitle } from "~/components/ui/alert";

interface ServicesBreakfastStepProps {
  onNext: () => void;
  formRef?: React.RefObject<HTMLFormElement | null>;
}

export function ServicesBreakfastStep({
  onNext,
  formRef,
}: ServicesBreakfastStepProps) {
  const { data: storeData, setData } = useCreateBookingStore();
  const { ServicesBreakfastFormSchema } = FormSchema;
  const [serviceDialogOpen, setServiceDialogOpen] = useState(false);

  // Get services from global store
  const services = useServiceOrderStore((s) => s.services);
  const removeById = useServiceOrderStore((s) => s.removeById);

  const form = useForm<ServicesBreakfastFormData>({
    resolver: zodResolver(ServicesBreakfastFormSchema),
    defaultValues: {
      isBreakfastAll: storeData.isBreakfastAll ?? false,
      breakfastDates: storeData.breakfastDates
        ? storeData.breakfastDates.map((d) =>
            d instanceof Date ? d : new Date(d)
          )
        : [],
      checkinDate: storeData.checkinDate,
      checkoutDate: storeData.checkoutDate,
    },
  });

  const nights = useCalculateNights({
    checkinDate: storeData.checkinDate,
    checkoutDate: storeData.checkoutDate,
  });

  // Sync form with store
  useEffect(() => {
    form.reset({
      isBreakfastAll: storeData.isBreakfastAll ?? false,
      breakfastDates: storeData.breakfastDates
        ? storeData.breakfastDates.map((d) =>
            d instanceof Date ? d : new Date(d)
          )
        : [],
      checkinDate: storeData.checkinDate,
      checkoutDate: storeData.checkoutDate,
    });
  }, [storeData, form]);

  const onSubmit = (data: ServicesBreakfastFormData) => {
    // Validate service order dates are within booking range
    if (
      services.length > 0 &&
      storeData.checkinDate &&
      storeData.checkoutDate
    ) {
      const checkinDate = new Date(storeData.checkinDate);
      const checkoutDate = new Date(storeData.checkoutDate);

      const invalidServices = services.filter((service) => {
        if (!service.scheduledDate) return false; // Optional field
        const scheduledDate = new Date(service.scheduledDate);
        return scheduledDate < checkinDate || scheduledDate > checkoutDate;
      });

      if (invalidServices.length > 0) {
        toast.error(
          "Ngày thực hiện dịch vụ phải nằm trong khoảng thời gian lưu trú (từ ngày nhận phòng đến ngày trả phòng)"
        );
        return;
      }
    }

    setData({
      isBreakfastAll: data.isBreakfastAll,
      breakfastDates: data.breakfastDates?.map((i) => new Date(i)) || [],
    });

    toast.success("Đã lưu thông tin bữa sáng và dịch vụ");
    onNext();
  };

  const hasBreakfast =
    form.watch("isBreakfastAll") ||
    (form.watch("breakfastDates") || []).length > 0;

  // Check for invalid service dates
  const getInvalidServices = () => {
    if (!storeData.checkinDate || !storeData.checkoutDate) return [];

    const checkinDate = new Date(storeData.checkinDate);
    const checkoutDate = new Date(storeData.checkoutDate);

    return services.filter((service) => {
      if (!service.scheduledDate) return false;
      const scheduledDate = new Date(service.scheduledDate);
      return scheduledDate < checkinDate || scheduledDate > checkoutDate;
    });
  };

  const invalidServices = getInvalidServices();

  const handleConfirmServices = () => {
    // Services are already in the global store when dialog confirms
    setServiceDialogOpen(false);
  };

  return (
    <Form {...form}>
      <form
        ref={formRef}
        onSubmit={form.handleSubmit(onSubmit, onError)}
        className="space-y-6"
      >
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Breakfast Selection */}
          <div>
            {storeData.checkinDate && storeData.checkoutDate && (
              <BreakfastSelection
                isBreakfastAll={form.watch("isBreakfastAll") || false}
                breakfastDates={form.watch("breakfastDates") || []}
                onToggleAll={(value) => form.setValue("isBreakfastAll", value)}
                onSelectDates={(dates) =>
                  form.setValue("breakfastDates", dates)
                }
                checkinDate={storeData.checkinDate}
                checkoutDate={storeData.checkoutDate}
                nights={nights}
              />
            )}
          </div>

          {/* Services Selection */}
          <div>
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
                  onClick={() => setServiceDialogOpen(true)}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Thêm dịch vụ
                </Button>
                <AddServiceDialog
                  open={serviceDialogOpen}
                  onOpenChange={setServiceDialogOpen}
                  onConfirm={handleConfirmServices}
                  customerName={storeData.guestFullName}
                />

                {/* Services List */}
                {services.length > 0 ? (
                  <>
                    <Separator />
                    <div className="space-y-3">
                      <h4 className="font-semibold text-sm">
                        Dịch vụ đã chọn ({services.length})
                      </h4>

                      {/* Validation Warning */}
                      {invalidServices.length > 0 && (
                        <Alert variant="destructive">
                          <AlertCircleIcon />
                          <AlertTitle>
                            Có {invalidServices.length} dịch vụ có ngày thực
                            hiện nằm ngoài khoảng thời gian lưu trú
                          </AlertTitle>
                          <AlertDescription>
                            <p className="text-xs text-destructive/80 mt-1">
                              Vui lòng chỉnh sửa hoặc xóa các dịch vụ này trước
                              khi tiếp tục
                            </p>
                          </AlertDescription>
                        </Alert>
                      )}

                      <div className="space-y-2 max-h-[300px] overflow-y-auto p-2">
                        {services.map((service) => {
                          const isInvalid = invalidServices.some(
                            (inv) => inv.itemId === service.itemId
                          );

                          return (
                            <div
                              key={service.itemId}
                              className={
                                isInvalid
                                  ? "ring-2 ring-destructive rounded-md"
                                  : ""
                              }
                            >
                              <ServiceOrderItem
                                service={service}
                                onRemove={() => removeById(service.itemId)}
                              />
                            </div>
                          );
                        })}
                      </div>
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

                <Separator />

                <p className="text-xs text-muted-foreground">
                  * Dịch vụ sẽ được tính chung vào tổng hóa đơn
                </p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Summary Info */}
        <div className="flex items-center justify-center gap-4 p-4 rounded-lg bg-muted/30">
          <div className="flex items-center gap-2">
            <Coffee className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-medium">
              {hasBreakfast
                ? form.watch("isBreakfastAll")
                  ? `Bữa sáng: Tất cả ${nights} ngày`
                  : `Bữa sáng: ${(form.watch("breakfastDates") || []).length} ngày`
                : "Không có bữa sáng"}
            </span>
          </div>
          <div className="h-4 w-px bg-border" />
          <div className="flex items-center gap-2">
            <UtensilsCrossed className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-medium">
              Dịch vụ: {services.length} món
            </span>
          </div>
        </div>
      </form>
    </Form>
  );
}
