import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import type { ServicesBreakfastFormData } from "~/services/types/forms.types";
import { useCreateBookingStore } from "~/store/create-booking.store";
import { useServiceOrderStore } from "~/store/service-order.store";

import { AlertCircle, Plus, UtensilsCrossed } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "~/components/ui/alert";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Form } from "~/components/ui/form";
import { Separator } from "~/components/ui/separator";
import AddServiceDialog from "~/features/order-dialog";
import { onError, useCalculateNights } from "~/lib/utils";
import { FormSchema } from "~/services/schema/forms.schema";
import { BreakfastSelection } from "../fragments/breakfast-selection";
import { ServiceOrderTable } from "../fragments/service-order-table";

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

  const onSubmit = (data: ServicesBreakfastFormData) => {
    if (
      services.length > 0 &&
      storeData.checkinDate &&
      storeData.checkoutDate
    ) {
      const invalidServices = getInvalidServices();

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

  const invalidServices = getInvalidServices();

  const handleConfirmServices = () => {
    setServiceDialogOpen(false);
  };

  return (
    <Form {...form}>
      <form
        ref={formRef}
        onSubmit={form.handleSubmit(onSubmit, onError)}
        className="space-y-6"
      >
        {/* Validation Warning - Top Level */}
        {invalidServices.length > 0 && (
          <Alert variant="destructive" className="shadow-sm">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>
              Có {invalidServices.length} dịch vụ nằm ngoài khoảng thời gian lưu
              trú
            </AlertTitle>
            <AlertDescription>
              Ngày thực hiện dịch vụ phải nằm trong khoảng từ ngày nhận phòng
              đến ngày trả phòng. Vui lòng chỉnh sửa hoặc xóa các dịch vụ này.
            </AlertDescription>
          </Alert>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Breakfast Selection */}
          <div className="space-y-4 h-full">
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
          <div className="space-y-4 h-full">
            <Card className="shadow-sm h-full">
              <CardHeader className="space-y-3">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <UtensilsCrossed className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <CardTitle className="text-lg">
                        Dịch vụ kèm theo
                      </CardTitle>
                      <p className="text-sm text-muted-foreground mt-1">
                        Tùy chọn thêm
                      </p>
                    </div>
                  </div>
                  {services.length > 0 && (
                    <Badge variant="default" className="text-xs font-medium">
                      {services.length} dịch vụ
                    </Badge>
                  )}
                </div>
              </CardHeader>

              <CardContent className="space-y-4">
                {/* Add Service Button */}
                <Button
                  type="button"
                  variant="outline"
                  className="w-full shadow-sm hover:shadow-md transition-shadow"
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
                  checkinDate={storeData.checkinDate}
                  checkoutDate={storeData.checkoutDate}
                />

                {/* Services List */}
                {services.length > 0 ? (
                  <>
                    <Separator />
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <h4 className="text-sm font-semibold">
                          Danh sách dịch vụ
                        </h4>
                        <Badge variant="outline" className="text-xs">
                          {services.length} món
                        </Badge>
                      </div>

                      <div className="max-h-[400px] overflow-y-auto">
                        <ServiceOrderTable
                          services={services}
                          onRemove={removeById}
                          invalidServiceIds={invalidServices.map(
                            (s) => s.itemId
                          )}
                        />
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="rounded-lg border-2 border-dashed bg-muted/30 p-8 text-center">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted mx-auto mb-3">
                      <UtensilsCrossed className="h-6 w-6 text-muted-foreground" />
                    </div>
                    <p className="text-sm font-medium mb-1">
                      Chưa có dịch vụ nào
                    </p>
                    <p className="text-xs text-muted-foreground">
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
      </form>
    </Form>
  );
}
