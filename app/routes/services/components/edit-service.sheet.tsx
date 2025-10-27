import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import type z from "zod";
import { Button } from "~/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "~/components/ui/sheet";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "~/components/ui/form";
import { Input } from "~/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { Textarea } from "~/components/ui/textarea";
import { Switch } from "~/components/ui/switch";
import useServiceSchema from "~/services/schema/service.schema";
import { useMemo, useEffect } from "react";
import type { ServiceItem } from "~/services/api/services/dto";
import { useUnits } from "~/routes/units/container/unit-query.hooks";
import { useUpdateService } from "../container/service-mutation.hooks";
import { useServices } from "../container/service-query.hooks";

const { UpdateServiceItemRequestSchema } = useServiceSchema();

type UpdateServiceFormData = z.infer<typeof UpdateServiceItemRequestSchema>;

interface EditServiceSheetProps {
  open: boolean;
  onClose: () => void;
  service: ServiceItem | null;
}

export default function EditServiceSheet({
  open,
  onClose,
  service,
}: EditServiceSheetProps) {
  const form = useForm({
    resolver: zodResolver(UpdateServiceItemRequestSchema),
    defaultValues: {
      code: "",
      name: "",
      description: "",
      serviceTypeId: "",
      unitId: "",
      basePrice: 0,
      active: true,
    },
  });

  const { mutate: updateService, isPending } = useUpdateService();
  const { data: units } = useUnits();
  const { data: servicesData } = useServices();

  // Extract unique service types
  const serviceTypes = useMemo(() => {
    if (!servicesData) return [];
    return servicesData.map((group) => ({
      id: group.serviceTypeId,
      name: group.typeName,
      code: group.typeCode,
    }));
  }, [servicesData]);

  // Populate form when service changes
  useEffect(() => {
    if (service) {
      form.reset({
        code: service.code,
        name: service.name,
        description: service.description || "",
        serviceTypeId: (service as any).serviceTypeId || "",
        unitId: (service as any).unitId || "",
        basePrice: service.basePrice,
        active: service.active,
      });
    }
  }, [service, form]);

  const handleSubmit = (data: UpdateServiceFormData) => {
    if (!service) return;

    updateService(
      { id: service.serviceItemId, data },
      {
        onSuccess: () => {
          onClose();
        },
      }
    );
  };

  const handleClose = () => {
    form.reset();
    onClose();
  };

  return (
    <Sheet open={open} onOpenChange={handleClose}>
      <SheetContent className="sm:max-w-[600px] px-4 overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Chỉnh sửa dịch vụ</SheetTitle>
          <SheetDescription>
            Cập nhật thông tin cho dịch vụ. Nhấn lưu khi hoàn tất.
          </SheetDescription>
        </SheetHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            className="space-y-4 mt-6"
          >
            {/* Service Type */}
            <FormField
              control={form.control}
              name="serviceTypeId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Loại dịch vụ <span className="text-destructive">*</span>
                  </FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Chọn loại dịch vụ" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {serviceTypes.map((type) => (
                        <SelectItem key={type.id} value={type.id}>
                          {type.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Code */}
            <FormField
              control={form.control}
              name="code"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Mã dịch vụ <span className="text-destructive">*</span>
                  </FormLabel>
                  <FormControl>
                    <Input placeholder="VD: SPA001, FOOD001" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Name */}
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Tên dịch vụ <span className="text-destructive">*</span>
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder="VD: Massage body, Bữa sáng buffet"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Description */}
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Mô tả</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Mô tả chi tiết về dịch vụ..."
                      className="resize-none"
                      rows={3}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              {/* Unit */}
              <FormField
                control={form.control}
                name="unitId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Đơn vị tính <span className="text-destructive">*</span>
                    </FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Chọn đơn vị" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {units?.map((unit) => (
                          <SelectItem key={unit.id} value={unit.id}>
                            {unit.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Base Price */}
              <FormField
                control={form.control}
                name="basePrice"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Đơn giá (VNĐ) <span className="text-destructive">*</span>
                    </FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="0"
                        {...field}
                        onChange={(e) => field.onChange(Number(e.target.value))}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Active Status */}
            <FormField
              control={form.control}
              name="active"
              render={({ field }) => (
                <FormItem className="flex items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base">
                      Trạng thái hoạt động
                    </FormLabel>
                    <FormDescription>
                      Tắt nếu muốn tạm ngừng cung cấp dịch vụ này
                    </FormDescription>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />

            <SheetFooter className="gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={handleClose}
                disabled={isPending}
              >
                Hủy
              </Button>
              <Button type="submit" disabled={isPending}>
                {isPending ? "Đang lưu..." : "Lưu thay đổi"}
              </Button>
            </SheetFooter>
          </form>
        </Form>
      </SheetContent>
    </Sheet>
  );
}
