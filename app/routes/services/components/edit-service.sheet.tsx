import { zodResolver } from "@hookform/resolvers/zod";
import { Power } from "lucide-react";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import type z from "zod";
import { Button } from "~/components/ui/button";
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
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "~/components/ui/sheet";
import { Switch } from "~/components/ui/switch";
import { Textarea } from "~/components/ui/textarea";
import { useUnits } from "~/routes/units/container/unit-query.hooks";
import type { ServiceItem } from "~/services/api/services/dto";
import { ServiceSchema } from "~/services/api/services/service.schema";
import { useServiceTypes } from "../container/service-types/query.hooks";
import { useUpdateService } from "../container/services/mutation.hooks";
import { useServiceDetail } from "../container/services/query.hooks";

const { UpdateServiceItemRequestSchema } = ServiceSchema;

type UpdateServiceFormData = z.infer<typeof UpdateServiceItemRequestSchema>;

interface EditServiceSheetProps {
  open: boolean;
  onClose: () => void;
  service: ServiceItem;
}

export default function EditServiceSheet({
  open,
  onClose,
  service,
}: EditServiceSheetProps) {
  const form = useForm({
    resolver: zodResolver(UpdateServiceItemRequestSchema),
  });
  const { data: serviceItemDetail } = useServiceDetail(service.serviceItemId, {
    enabled: open,
  });
  const { mutate: updateService, isPending } = useUpdateService();
  const { data: units } = useUnits();
  const { data: serviceTypesData } = useServiceTypes();

  useEffect(() => {
    if (serviceItemDetail) {
      form.reset({
        serviceTypeId: serviceItemDetail.serviceTypeId,
        unitId: serviceItemDetail.unitId,
        code: serviceItemDetail.code,
        name: serviceItemDetail.name,
        description: serviceItemDetail.description,
        basePrice: serviceItemDetail.basePrice,
        active: serviceItemDetail.active,
      });
    }
  }, [serviceItemDetail, form]);

  const handleSubmit = (data: UpdateServiceFormData) => {
    if (!service) return;
    updateService({ id: service.serviceItemId, data });
    handleClose();
  };

  const handleClose = () => {
    form.reset();
    onClose();
  };

  return (
    <Sheet open={open} onOpenChange={handleClose}>
      <SheetContent className="sm:max-w-[600px] p-0 flex flex-col gap-0">
        <SheetHeader className="p-6 pb-4 border-b">
          <SheetTitle>Chỉnh sửa dịch vụ</SheetTitle>
          <SheetDescription>
            Cập nhật thông tin cho dịch vụ. Nhấn lưu khi hoàn tất.
          </SheetDescription>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto p-6">
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(handleSubmit)}
              className="space-y-4"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="serviceTypeId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        Loại dịch vụ <span className="text-destructive">*</span>
                      </FormLabel>
                      <Select
                        {...field}
                        onValueChange={field.onChange}
                        value={field.value}
                      >
                        <FormControl>
                          <SelectTrigger className="w-full" size="lg">
                            <SelectValue placeholder="Chọn loại dịch vụ" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {serviceTypesData!.map((type) => (
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
                <FormField
                  control={form.control}
                  name="unitId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        Đơn vị tính <span className="text-destructive">*</span>
                      </FormLabel>
                      <Select
                        {...field}
                        onValueChange={field.onChange}
                        value={field.value}
                      >
                        <FormControl>
                          <SelectTrigger className="w-full" size="lg">
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
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
              </div>

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

              <FormField
                control={form.control}
                name="active"
                render={({ field }) => (
                  <FormItem className=" has-data-[state=checked]:border-primary/50 relative flex w-full items-start gap-2 rounded-md border-2 border-dashed p-4 shadow-xs outline-none">
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                        className="order-1 h-4 w-6 after:absolute after:inset-0 [&_span]:size-3 data-[state=checked]:[&_span]:translate-x-2.5 data-[state=checked]:[&_span]:rtl:-translate-x-2.5"
                      />
                    </FormControl>
                    <div className="flex grow items-center gap-3">
                      <Power />
                      <div className="grid grow gap-2">
                        <FormLabel className="text-base">
                          Trạng thái hoạt động
                        </FormLabel>
                        <FormDescription>
                          Tắt nếu muốn tạm ngừng cung cấp dịch vụ này
                        </FormDescription>
                      </div>
                    </div>
                  </FormItem>
                )}
              />
            </form>
          </Form>
        </div>
        <SheetFooter className="p-6 pt-4 border-t gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={handleClose}
            disabled={isPending}
          >
            Hủy
          </Button>
          <Button
            type="submit"
            onClick={form.handleSubmit(handleSubmit)}
            disabled={isPending}
          >
            {isPending ? "Đang lưu..." : "Lưu thay đổi"}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
