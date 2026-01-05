import { zodResolver } from "@hookform/resolvers/zod";
import { AlignLeft, DollarSign, Hash, Plus, Save, Tag, X } from "lucide-react";
import { useEffect } from "react";
import { useFieldArray, useForm } from "react-hook-form";
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
import { Separator } from "~/components/ui/separator";
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
  const { data: serviceItemDetail } = useServiceDetail(service.serviceItemId, {
    enabled: open && !!service.serviceItemId,
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
      translations: [{ languageCode: "vi", name: "", description: "" }],
      basePrice: 0,
    },
  });

  const {
    fields: translationFields,
    append: appendTranslation,
    remove: removeTranslation,
  } = useFieldArray({
    control: form.control,
    name: "translations",
  });

  const handleAddTranslation = () => {
    appendTranslation({ languageCode: "en", name: "", description: "" });
  };

  const handleRemoveTranslation = (index: number) => {
    if (translationFields.length > 1) {
      removeTranslation(index);
    }
  };

  useEffect(() => {
    if (serviceItemDetail) {
      form.reset({
        serviceTypeId: serviceItemDetail.serviceTypeId,
        unitId: serviceItemDetail.unitId,
        code: serviceItemDetail.code,
        translations: serviceItemDetail.translations,
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
      <SheetContent className="sm:max-w-2xl bg-card overflow-y-auto p-0 flex flex-col gap-0 ">
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            className="flex flex-col h-full"
          >
            {/* === HEADER === */}
            <SheetHeader className="px-6 py-4 border-b shrink-0 ">
              <SheetTitle className="text-xl flex items-center gap-2">
                Chỉnh sửa dịch vụ
              </SheetTitle>
              <SheetDescription>
                Cập nhật thông tin cho{" "}
                <span className="font-semibold text-foreground">
                  {service?.translations?.find((t) => t.languageCode === "vi")
                    ?.name ||
                    service?.translations?.[0]?.name ||
                    ""}
                </span>
                .
              </SheetDescription>
            </SheetHeader>

            {/* === BODY === */}
            <div className="p-6 space-y-8">
              {/* Section 1: Identity */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-xs font-bold text-muted-foreground uppercase tracking-wider">
                  <Tag className="w-3.5 h-3.5" /> Định danh
                </div>

                {/* Translations Section */}
                <div className="space-y-4">
                  {translationFields.map((field, index) => (
                    <div
                      key={field.id}
                      className="space-y-4 p-4 border rounded-lg bg-muted/10"
                    >
                      <div className="flex items-center justify-between">
                        <h4 className="text-sm font-semibold flex items-center gap-2">
                          <span className="w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-bold">
                            {index + 1}
                          </span>
                          Ngôn ngữ:{" "}
                          {(translationFields[index] as any).languageCode ===
                          "vi"
                            ? "Tiếng Việt"
                            : (translationFields[index] as any).languageCode ===
                                "en"
                              ? "English"
                              : (
                                  (translationFields[index] as any)
                                    .languageCode || ""
                                ).toUpperCase()}
                        </h4>
                        {translationFields.length > 1 && (
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => handleRemoveTranslation(index)}
                            disabled={isPending}
                            className="h-8 px-2 text-destructive hover:text-destructive hover:bg-destructive/10"
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        )}
                      </div>

                      <FormField
                        control={form.control}
                        name={`translations.${index}.languageCode`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Mã ngôn ngữ</FormLabel>
                            <FormControl>
                              <Input
                                placeholder="vi, en, fr, de..."
                                className="font-mono uppercase"
                                maxLength={5}
                                {...field}
                                disabled={isPending || index === 0}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name={`translations.${index}.name`}
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
                                disabled={isPending}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name={`translations.${index}.description`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="flex items-center gap-1.5">
                              <AlignLeft className="w-3.5 h-3.5 text-muted-foreground" />
                              Mô tả
                            </FormLabel>
                            <FormControl>
                              <Textarea
                                {...field}
                                value={field.value ?? ""}
                                placeholder="Mô tả chi tiết về dịch vụ (quy trình, lưu ý...)"
                                className="resize-none min-h-[120px]"
                                disabled={isPending}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  ))}

                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleAddTranslation}
                    disabled={isPending}
                    className="w-full"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Thêm ngôn ngữ khác
                  </Button>
                </div>

                <div className="grid gap-4">
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
                              <SelectTrigger className="w-full relative">
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
                          Đơn giá <span className="text-destructive">*</span>
                        </FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            className="font-semibold text-right"
                            {...field}
                            onChange={(e) =>
                              field.onChange(Number(e.target.value))
                            }
                            endAddon={
                              <span className="text-xs font-bold text-muted-foreground">
                                VND
                              </span>
                            }
                          />
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
                            <SelectTrigger className="w-full ">
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

              <FormField
                control={form.control}
                name="active"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <div className="border-input has-data-[state=checked]:border-primary/50 relative flex w-full items-start gap-2 rounded-md border p-4 shadow-xs outline-none">
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                          className="scale-75"
                          id="service-type-active-switch"
                        />
                        <div className="grid grow gap-2">
                          <FormLabel
                            className="text-xs font-medium cursor-pointer flex-col items-start mb-0 pb-0"
                            htmlFor="service-type-active-switch"
                          >
                            <p>
                              {field.value
                                ? "Đang hoạt động"
                                : "Ngưng hoạt động"}
                            </p>
                            <p className="text-muted-foreground text-xs">
                              Chọn "Ngưng hoạt động" để ẩn dịch vụ này khỏi hệ
                              thống.
                            </p>
                          </FormLabel>
                        </div>
                      </div>
                    </FormControl>
                  </FormItem>
                )}
              />
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
