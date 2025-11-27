import { zodResolver } from "@hookform/resolvers/zod";
import {
  AlignLeft,
  DollarSign,
  Hash,
  Layers,
  Package,
  Save,
  Sparkles,
  Tag,
} from "lucide-react";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import type z from "zod";

import { Button } from "~/components/ui/button";
import {
  Form,
  FormControl,
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
import { Separator } from "~/components/ui/separator";
import { ScrollArea } from "~/components/ui/scroll-area";

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
  // --- Queries & Mutations ---
  const { data: serviceItemDetail } = useServiceDetail(service.serviceItemId, {
    enabled: open,
  });
  const { mutate: updateService, isPending } = useUpdateService();
  const { data: units } = useUnits();
  const { data: serviceTypesData } = useServiceTypes();

  // --- Form Setup ---
  const form = useForm({
    resolver: zodResolver(UpdateServiceItemRequestSchema),
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

  // Sync Data
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

  // --- Handlers ---
  const handleSubmit = (data: UpdateServiceFormData) => {
    if (!service) return;
    updateService(
      { id: service.serviceItemId, data },
      { onSuccess: handleClose }
    );
  };

  const handleClose = () => {
    form.reset();
    onClose();
  };

  return (
    <Sheet open={open} onOpenChange={handleClose}>
      <SheetContent className="sm:max-w-[600px] p-0 flex flex-col gap-0 bg-background">
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            className="flex flex-col h-full"
          >
            {/* === HEADER === */}
            <SheetHeader className="px-6 py-4 border-b shrink-0 bg-muted/5 flex flex-row items-start justify-between space-y-0">
              <div className="space-y-1">
                <SheetTitle className="text-xl flex items-center gap-2">
                  Chỉnh sửa dịch vụ
                </SheetTitle>
                <SheetDescription>
                  Cập nhật thông tin dịch vụ spa, tour, hoặc tiện ích khác.
                </SheetDescription>
              </div>

              {/* Status Toggle (Header Position) */}
              <FormField
                control={form.control}
                name="active"
                render={({ field }) => (
                  <FormItem className="flex items-center space-y-0 gap-2 bg-background border px-3 py-1.5 rounded-full shadow-sm">
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                        className="scale-75 data-[state=checked]:bg-green-600"
                      />
                    </FormControl>
                    <FormLabel className="text-xs font-medium cursor-pointer mb-0 pb-0 text-foreground">
                      {field.value ? "Hoạt động" : "Đã ẩn"}
                    </FormLabel>
                  </FormItem>
                )}
              />
            </SheetHeader>

            {/* === BODY === */}
            <div className="flex-1 overflow-hidden">
              <ScrollArea className="h-full">
                <div className="p-6 space-y-8">
                  {/* Section 1: Identity */}
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 text-xs font-bold text-muted-foreground uppercase tracking-wider">
                      <Tag className="w-3.5 h-3.5" /> Định danh
                    </div>

                    <div className="grid gap-4">
                      <FormField
                        control={form.control}
                        name="name"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>
                              Tên dịch vụ{" "}
                              <span className="text-destructive">*</span>
                            </FormLabel>
                            <FormControl>
                              <Input
                                className="text-lg font-medium"
                                placeholder="VD: Massage Body 60p"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <div className="grid grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="code"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Mã dịch vụ</FormLabel>
                              <FormControl>
                                <div className="relative">
                                  <Hash className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                                  <Input
                                    className="pl-9 font-mono"
                                    placeholder="SPA-001"
                                    {...field}
                                  />
                                </div>
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="serviceTypeId"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>
                                Loại dịch vụ{" "}
                                <span className="text-destructive">*</span>
                              </FormLabel>
                              <Select
                                onValueChange={field.onChange}
                                value={field.value}
                              >
                                <FormControl>
                                  <SelectTrigger className="pl-9 w-40 relative">
                                    <Layers className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                                    <SelectValue placeholder="Chọn loại" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  {serviceTypesData?.map((type) => (
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
                      </div>
                    </div>
                  </div>

                  <Separator />

                  {/* Section 2: Pricing & Unit */}
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 text-xs font-bold text-muted-foreground uppercase tracking-wider">
                      <DollarSign className="w-3.5 h-3.5" /> Định giá
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="basePrice"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>
                              Đơn giá{" "}
                              <span className="text-destructive">*</span>
                            </FormLabel>
                            <FormControl>
                              <div className="relative">
                                <Input
                                  type="number"
                                  className="pr-12 font-semibold text-right"
                                  {...field}
                                  onChange={(e) =>
                                    field.onChange(Number(e.target.value))
                                  }
                                />
                                <span className="absolute right-3 top-2.5 text-xs font-bold text-muted-foreground">
                                  VND
                                </span>
                              </div>
                            </FormControl>
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
                              Đơn vị tính{" "}
                              <span className="text-destructive">*</span>
                            </FormLabel>
                            <Select
                              onValueChange={field.onChange}
                              value={field.value}
                            >
                              <FormControl>
                                <SelectTrigger className="pl-9 w-40 relative">
                                  <Package className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                                  <SelectValue placeholder="Chọn ĐVT" />
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
                  </div>

                  <Separator />

                  {/* Section 3: Details */}
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 text-xs font-bold text-muted-foreground uppercase tracking-wider">
                      <AlignLeft className="w-3.5 h-3.5" /> Chi tiết
                    </div>

                    <FormField
                      control={form.control}
                      name="description"
                      render={({ field }) => (
                        <FormItem>
                          <FormControl>
                            <Textarea
                              placeholder="Mô tả chi tiết về dịch vụ (quy trình, lưu ý...)"
                              className="resize-none min-h-[120px]"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
              </ScrollArea>
            </div>

            {/* === FOOTER === */}
            <SheetFooter className="p-6 pt-4 border-t shrink-0 bg-background">
              <Button
                type="button"
                variant="outline"
                onClick={handleClose}
                disabled={isPending}
              >
                Hủy bỏ
              </Button>
              <Button
                type="submit"
                disabled={isPending}
                className="min-w-[140px]"
              >
                {isPending ? (
                  <>
                    <div className="animate-spin mr-2 h-4 w-4 border-2 border-current border-t-transparent rounded-full" />
                    Đang lưu...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-2" /> Lưu thay đổi
                  </>
                )}
              </Button>
            </SheetFooter>
          </form>
        </Form>
      </SheetContent>
    </Sheet>
  );
}
