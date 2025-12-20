import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Package, Save, Tags } from "lucide-react";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import type z from "zod";

import { Badge } from "~/components/ui/badge";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { Switch } from "~/components/ui/switch";
import { Textarea } from "~/components/ui/textarea";

import { onError } from "~/lib/utils";
import { useUnits } from "~/routes/units/container/unit-query.hooks";
import { FormSchema } from "~/services/schema/forms.schema";
import { useItemCategories } from "../../item-categories/container/query.hooks";
import {
  useStockItemDetail,
  useUpdateStockItem,
} from "../container/query.hooks";

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
      <DialogContent className="max-w-3xl max-h-[90vh] p-0 gap-0 overflow-hidden flex flex-col">
        {/* === Header === */}
        <DialogHeader className="px-6 py-4 border-b bg-muted/10 shrink-0">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <DialogTitle className="text-lg">Chỉnh sửa hàng hóa</DialogTitle>
              <DialogDescription className="flex items-center gap-2">
                <Package className="h-3.5 w-3.5" />
                <span>Mã SKU:</span>
                <Badge
                  variant="secondary"
                  className="font-mono text-xs px-1.5 py-0 bg-background border"
                >
                  {item?.code || "..."}
                </Badge>
              </DialogDescription>
            </div>

            {/* Status Switch (Floating right in header) */}
          </div>
        </DialogHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit, onError)}
            className="flex-1 overflow-y-auto flex flex-col md:flex-row min-h-0"
          >
            {" "}
            {/* LEFT COLUMN: Identity Details */}
            <div className="flex-1 p-6 space-y-5">
              {/* Product Name */}
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Tên hàng hóa <span className="text-destructive">*</span>
                    </FormLabel>
                    <FormControl>
                      <Input
                        className="font-medium text-base"
                        placeholder="VD: Sữa tươi Vinamilk"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              {/* Category & Unit Grid */}
              <div className="grid grid-cols-2 gap-5">
                <FormField
                  control={form.control}
                  name="categoryId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-1.5 text-muted-foreground">
                        <Tags className="h-3.5 w-3.5" /> Danh mục
                      </FormLabel>
                      <Select {...field}>
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
                      <FormLabel className="flex items-center gap-1.5 text-muted-foreground">
                        <Package className="h-3.5 w-3.5" /> Đơn vị tính
                      </FormLabel>
                      <Select {...field}>
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
              {/* Description */}
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Mô tả chi tiết</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Ghi chú về đặc điểm, quy cách đóng gói..."
                        className="resize-none min-h-[100px]"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />{" "}
              <FormField
                control={form.control}
                name="isActive"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4 bg-muted/30">
                    <div className="space-y-0.5">
                      <FormLabel className="">Trạng thái hoạt động</FormLabel>
                      <FormDescription className="text-xs">
                        Bật để danh mục có thể được sử dụng trong hệ thống
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
            </div>
            {/* RIGHT COLUMN: Sidebar for Metrics (Price/Stock) */}
            <div className="w-full md:w-[300px] bg-muted/10 border-l p-6 space-y-6">
              {/* Pricing Section */}
              <div className="space-y-4">
                <h4 className="text-xs font-semibold uppercase text-muted-foreground tracking-wider flex items-center gap-2">
                  Thiết lập giá
                </h4>
                <div className="space-y-4">
                  <FormField
                    control={form.control}
                    name="unitCost"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs text-muted-foreground">
                          Giá vốn
                        </FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            className="text-right font-mono"
                            {...field}
                            onChange={(e) =>
                              field.onChange(
                                Number(e.currentTarget.valueAsNumber)
                              )
                            }
                            endAddon={
                              <span className="text-xs text-muted-foreground">
                                đ
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
                    name="unitPrice"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs text-muted-foreground">
                          Giá bán niêm yết
                        </FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            {...field}
                            onChange={(e) =>
                              field.onChange(
                                Number(e.currentTarget.valueAsNumber)
                              )
                            }
                            endAddon={
                              <span className="text-xs text-muted-foreground">
                                đ
                              </span>
                            }
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              <div className="h-px bg-border/50 w-full" />

              {/* Inventory Section */}
              <div className="space-y-4">
                <h4 className="text-xs font-semibold uppercase text-muted-foreground tracking-wider">
                  Định mức tồn kho
                </h4>
                <div className="grid grid-cols-2 gap-3">
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
                            className="text-center font-mono h-9"
                            {...field}
                            onChange={(e) =>
                              field.onChange(e.target.valueAsNumber)
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
                            className="text-center font-mono h-9"
                            {...field}
                            onChange={(e) =>
                              field.onChange(e.target.valueAsNumber)
                            }
                          />
                        </FormControl>{" "}
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <div className="bg-background border rounded p-3 text-[11px] text-muted-foreground leading-snug">
                  Cảnh báo sẽ kích hoạt khi tồn kho nằm ngoài khoảng này.
                </div>
              </div>
            </div>
          </form>
        </Form>

        {/* === Footer === */}
        <DialogFooter className="p-4 border-t bg-background shrink-0">
          <Button
            type="button"
            variant="ghost"
            onClick={() => onOpenChange(false)}
            disabled={isSubmitting}
          >
            Hủy bỏ
          </Button>
          <Button
            onClick={form.handleSubmit(onSubmit, onError)}
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
