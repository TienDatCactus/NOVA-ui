import { useEffect } from "react";
import type z from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Loader2,
  Save,
  Package,
  Tags,
  DollarSign,
  Archive,
  Activity,
} from "lucide-react";

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
import { Button } from "~/components/ui/button";
import { Switch } from "~/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { ScrollArea } from "~/components/ui/scroll-area";
import { Separator } from "~/components/ui/separator";
import { Badge } from "~/components/ui/badge";

import { FormSchema } from "~/services/schema/forms.schema";
import { useUnits } from "~/routes/units/container/unit-query.hooks";
import { useItemCategories } from "../../item-categories/container/query.hooks";
import {
  useStockItemDetail,
  useUpdateStockItem,
} from "../container/query.hooks";
import { onError } from "~/lib/utils";

export type UpdateItemFormData = z.infer<
  typeof FormSchema.UpdateItemFormSchema
>;

interface EditItemDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  itemId: string;
}

export default function EditItemDialog({
  open,
  onOpenChange,
  itemId,
}: EditItemDialogProps) {
  // --- Data Fetching ---
  const { data: item } = useStockItemDetail(itemId, undefined, {
    enabled: open,
  });
  const { data: categories = [] } = useItemCategories({
    includeInactive: true,
  });
  const { data: units = [] } = useUnits({ includeInactive: true });

  const { mutate: updateItem, isPending: isSubmitting } = useUpdateStockItem();

  // --- Form Setup ---
  const form = useForm<UpdateItemFormData>({
    resolver: zodResolver(FormSchema.UpdateItemFormSchema),
    mode: "onChange",
    defaultValues: {
      name: "",
      description: "",
      categoryId: "",
      unitId: "",
      unitCost: 0,
      unitPrice: 0,
      minStock: 0,
      maxStock: 0,
      isActive: true,
    },
  });

  // --- Effect: Sync Data to Form ---
  useEffect(() => {
    if (item) {
      form.reset({
        name: item.name,
        description: item.description ?? "",
        categoryId: item.categoryId,
        unitId: item.unitId,
        unitCost: item.unitCost,
        unitPrice: item.unitPrice,
        minStock: item.minStock ?? 0,
        maxStock: item.maxStock ?? 0,
        isActive: item.isActive,
      });
    }
  }, [item, form]);

  const onSubmit = (data: UpdateItemFormData) => {
    updateItem({ id: itemId, data }, { onSuccess: () => onOpenChange(false) });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto p-0 flex flex-col gap-0 ">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit, onError)}>
            {/* === Header === */}
            <DialogHeader className="px-6 py-4 border-b bg-muted/10 shrink-0">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <DialogTitle className="text-lg">
                    Chỉnh sửa hàng hóa
                  </DialogTitle>
                  <DialogDescription className="flex items-center gap-2">
                    <Package className="h-3.5 w-3.5" />
                    <span>Mã SKU:</span>
                    <Badge
                      variant="secondary"
                      className="font-mono text-xs px-1.5 py-0"
                    >
                      {item?.code || "..."}
                    </Badge>
                  </DialogDescription>
                </div>

                {/* Status Switch positioned in Header for visibility */}
                <FormField
                  control={form.control}
                  name="isActive"
                  render={({ field }) => (
                    <FormItem className="flex items-center gap-2 space-y-0 bg-background border px-3 py-1.5 rounded-full shadow-sm">
                      <Activity
                        className={`h-3.5 w-3.5 ${field.value ? "text-green-600" : "text-muted-foreground"}`}
                      />
                      <FormLabel className="text-xs font-medium cursor-pointer mb-0 pb-0">
                        {field.value ? "Đang hoạt động" : "Ngừng kinh doanh"}
                      </FormLabel>
                      <FormControl>
                        <Switch
                          className="scale-75 origin-right"
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>
            </DialogHeader>

            {/* === Body (Scrollable) === */}
            <div className="flex-1 flex flex-col  min-h-0">
              <ScrollArea className="flex-1">
                <div className="p-6 space-y-8">
                  {/* Section 1: Identity & Classification */}
                  <div className="space-y-4">
                    <FormField
                      control={form.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>
                            Tên hàng hóa{" "}
                            <span className="text-destructive">*</span>
                          </FormLabel>
                          <FormControl>
                            <Input
                              className="font-medium"
                              placeholder="VD: Sữa tươi Vinamilk"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="categoryId"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="flex items-center gap-1.5">
                              <Tags className="h-3.5 w-3.5 text-muted-foreground" />{" "}
                              Danh mục{" "}
                              <span className="text-destructive">*</span>
                            </FormLabel>
                            <Select
                              key={field.value || "category-select"}
                              onValueChange={field.onChange}
                              value={field.value}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Chọn danh mục" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {categories.map((cat) => (
                                  <SelectItem key={cat.id} value={cat.id}>
                                    {cat.name}
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
                            <FormLabel className="flex items-center gap-1.5">
                              <Package className="h-3.5 w-3.5 text-muted-foreground" />{" "}
                              Đơn vị tính{" "}
                              <span className="text-destructive">*</span>
                            </FormLabel>
                            <Select
                              key={field.value || "unit-select"}
                              onValueChange={field.onChange}
                              value={field.value}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Chọn đơn vị" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {units.map((unit) => (
                                  <SelectItem key={unit.id} value={unit.id}>
                                    {unit.name} ({unit.code})
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <FormField
                      control={form.control}
                      name="description"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Mô tả chi tiết</FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="Ghi chú về đặc điểm, quy cách đóng gói..."
                              className="resize-none min-h-[80px]"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <Separator />

                  {/* Section 2: Metrics Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Left: Pricing */}
                    <div className="space-y-4">
                      <h4 className="font-semibold text-sm text-foreground">
                        Thiết lập giá
                      </h4>

                      <div className="grid gap-4">
                        <FormField
                          control={form.control}
                          name="unitCost"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-xs text-muted-foreground">
                                Giá vốn (Nhập)
                              </FormLabel>
                              <FormControl>
                                <div className="relative">
                                  <Input
                                    type="number"
                                    className="pr-12 font-mono"
                                    {...field}
                                    onChange={(e) =>
                                      field.onChange(
                                        parseFloat(e.target.value) || 0
                                      )
                                    }
                                  />
                                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground font-medium">
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
                          name="unitPrice"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-xs text-muted-foreground">
                                Giá bán (Niêm yết)
                              </FormLabel>
                              <FormControl>
                                <div className="relative">
                                  <Input
                                    type="number"
                                    className="pr-12 font-mono"
                                    {...field}
                                    onChange={(e) =>
                                      field.onChange(
                                        parseFloat(e.target.value) || 0
                                      )
                                    }
                                  />
                                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground font-medium">
                                    VND
                                  </span>
                                </div>
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </div>

                    {/* Right: Inventory */}
                    <div className="space-y-4">
                      <h4 className="font-semibold text-sm text-foreground">
                        Định mức tồn kho
                      </h4>

                      <div className="grid grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="minStock"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-xs text-muted-foreground">
                                Tối thiểu
                              </FormLabel>
                              <FormControl>
                                <Input
                                  type="number"
                                  className="font-mono"
                                  {...field}
                                  onChange={(e) =>
                                    field.onChange(
                                      parseFloat(e.target.value) || 0
                                    )
                                  }
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="maxStock"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-xs text-muted-foreground">
                                Tối đa
                              </FormLabel>
                              <FormControl>
                                <Input
                                  type="number"
                                  className="font-mono"
                                  {...field}
                                  onChange={(e) =>
                                    field.onChange(
                                      parseFloat(e.target.value) || 0
                                    )
                                  }
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                      <div className="bg-muted/30 p-3 rounded text-xs text-muted-foreground leading-relaxed">
                        Hệ thống sẽ cảnh báo khi tồn kho chạm các ngưỡng này để
                        hỗ trợ việc nhập hàng kịp thời.
                      </div>
                    </div>
                  </div>
                </div>
              </ScrollArea>
            </div>

            {/* === Footer === */}
          </form>
        </Form>
        <DialogFooter className="p-6 border-t bg-background shrink-0">
          <Button
            type="button"
            variant="ghost"
            onClick={() => onOpenChange(false)}
            disabled={isSubmitting}
          >
            Hủy bỏ
          </Button>
          <Button
            onClick={form.handleSubmit(onSubmit)}
            disabled={isSubmitting}
            className="min-w-[120px]"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Lưu thay đổi
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" /> Cập nhật
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
