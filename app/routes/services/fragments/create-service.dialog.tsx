import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, type SubmitHandler } from "react-hook-form";
import type z from "zod";
import { Button } from "~/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog";
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
import { Textarea } from "~/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { Switch } from "~/components/ui/switch";
import useServiceSchema from "~/services/schema/service.schema";
import { useCreateService } from "../container/useServiceMutation";
import { useServiceTypes, useUnits } from "../container/useServiceQuery";
import { Loader2 } from "lucide-react";

const { CreateServiceRequestSchema } = useServiceSchema();

type CreateServiceFormData = z.infer<typeof CreateServiceRequestSchema>;

interface CreateServiceDialogProps {
  open: boolean;
  onClose: () => void;
}

export default function CreateServiceDialog({
  open,
  onClose,
}: CreateServiceDialogProps) {
  const form = useForm<CreateServiceFormData>({
    resolver: zodResolver(CreateServiceRequestSchema),
    defaultValues: {
      serviceTypeId: "",
      unitId: "",
      code: "",
      name: "",
      description: "",
      basePrice: 0,
      active: true,
    },
  });

  const { mutate, isPending } = useCreateService();
  const { data: serviceTypes, isPending: isLoadingServiceTypes } =
    useServiceTypes();
  const { data: units, isPending: isLoadingUnits } = useUnits();

  const handleSubmit: SubmitHandler<CreateServiceFormData> = (data) => {
    mutate(data, {
      onSuccess: () => {
        form.reset();
        onClose();
      },
    });
  };

  const handleClose = () => {
    form.reset();
    onClose();
  };

  const isLoading = isLoadingServiceTypes || isLoadingUnits;

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Tạo dịch vụ mới</DialogTitle>
          <DialogDescription>
            Điền thông tin chi tiết cho dịch vụ mới. Các trường có dấu * là bắt
            buộc.
          </DialogDescription>
        </DialogHeader>

        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(handleSubmit)}
              className="space-y-4"
            >
              {/* Row 1: Service Type + Unit */}
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="serviceTypeId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Loại dịch vụ *</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Chọn loại dịch vụ" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {serviceTypes?.map((type) => (
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
                      <FormLabel>Đơn vị tính *</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
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
              </div>

              {/* Row 2: Code + Price */}
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="code"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Mã dịch vụ *</FormLabel>
                      <FormControl>
                        <Input placeholder="VD: SPA001" {...field} />
                      </FormControl>
                      <FormDescription className="text-xs">
                        Mã định danh duy nhất
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="basePrice"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Giá cơ bản (VNĐ) *</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="0"
                          min="0"
                          step="1000"
                          value={field.value || 0}
                          onChange={(e) => {
                            const value = e.target.value;
                            field.onChange(
                              value === "" ? 0 : parseFloat(value)
                            );
                          }}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Row 3: Name */}
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tên dịch vụ *</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="VD: Massage toàn thân 90 phút"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Row 4: Description */}
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Mô tả</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Mô tả chi tiết về dịch vụ..."
                        className="resize-none min-h-[100px]"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription className="text-xs">
                      Thông tin bổ sung (tùy chọn)
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Row 5: Active Status */}
              <FormField
                control={form.control}
                name="active"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">
                        Trạng thái hoạt động
                      </FormLabel>
                      <FormDescription>
                        Dịch vụ có thể được sử dụng ngay sau khi tạo
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

              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleClose}
                  disabled={isPending}
                >
                  Hủy
                </Button>
                <Button type="submit" disabled={isPending}>
                  {isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Đang tạo...
                    </>
                  ) : (
                    "Tạo dịch vụ"
                  )}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        )}
      </DialogContent>
    </Dialog>
  );
}
