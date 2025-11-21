import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Save } from "lucide-react";
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
import { Label } from "~/components/ui/label";
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
import type { StockItemDetailsDto } from "~/services/api/stocks/items/dto";
import type z from "zod";
import { useUnits } from "~/routes/units/container/unit-query.hooks";
import { useItemCategories } from "../../item-categories/container/query.hooks";
import {
  useStockItemDetail,
  useUpdateStockItem,
} from "../container/query.hooks";
import { useEffect } from "react";

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
  const { data: item } = useStockItemDetail(itemId);
  const { data: categories = [] } = useItemCategories({
    includeInactive: true,
  });
  const { data: units = [] } = useUnits({ includeInactive: true });

  const { mutate: updateItem, isPending: isSubmitting } = useUpdateStockItem();
  const form = useForm<UpdateItemFormData>({
    resolver: zodResolver(FormSchema.UpdateItemFormSchema),
    mode: "all",
    defaultValues: {
      name: item?.name,
      description: item?.description ?? "",
      categoryId: item?.categoryId,
      unitId: item?.unitId,
      unitCost: item?.unitCost,
      unitPrice: item?.unitPrice,
      minStock: item?.minStock ?? 0,
      maxStock: item?.maxStock ?? 0,
      isActive: item?.isActive,
    },
  });
  console.log(item);
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
  }, [item]);
  const onSubmit = (data: UpdateItemFormData) => {
    updateItem(
      { id: itemId, data },
      {
        onSuccess: () => {
          onOpenChange(false);
        },
      }
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] p-2">
        <DialogHeader className="px-4 pt-4">
          <DialogTitle>Chỉnh sửa hàng hóa</DialogTitle>
          <DialogDescription className="flex items-center gap-2">
            Mã:{" "}
            <Badge variant="outline" className="font-mono">
              {item?.code}
            </Badge>
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-6 overflow-y-auto max-h-[70vh] px-4 pb-4"
          >
            {/* Basic Information */}
            <div className="space-y-4">
              <h3 className="font-semibold text-sm">Thông tin cơ bản</h3>
              <div className="grid gap-4 md:grid-cols-2">
                {/* Name */}
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        Tên hàng hóa
                        <span className="text-destructive ml-1">*</span>
                      </FormLabel>
                      <FormControl>
                        <Input placeholder="VD: Sữa tươi Vinamilk" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid gap-4 md:grid-cols-2">
                  {/* Category */}
                  <FormField
                    control={form.control}
                    name="categoryId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>
                          Danh mục
                          <span className="text-destructive ml-1">*</span>
                        </FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
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

                  {/* Unit */}
                  <FormField
                    control={form.control}
                    name="unitId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>
                          Đơn vị tính
                          <span className="text-destructive ml-1">*</span>
                        </FormLabel>
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

                {/* Active Status */}
                <FormField
                  control={form.control}
                  name="isActive"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm h-fit">
                      <div className="space-y-0.5">
                        <FormLabel>Trạng thái hoạt động</FormLabel>
                        <FormDescription className="text-xs">
                          Bật/tắt sử dụng hàng hóa này
                        </FormDescription>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
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
                          placeholder="Mô tả chi tiết về hàng hóa..."
                          className="resize-none"
                          rows={3}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            <Separator />

            <div className="flex items-center gap-2">
              {/* Pricing Information */}
              <div className="space-y-4">
                <h3 className="font-semibold text-sm">Thông tin giá</h3>
                <div className="grid gap-4 md:grid-cols-2">
                  {/* Unit Cost */}
                  <FormField
                    control={form.control}
                    name="unitCost"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>
                          Giá nhập (đơn vị)
                          <span className="text-destructive ml-1">*</span>
                        </FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            placeholder="0"
                            {...field}
                            onChange={(e) =>
                              field.onChange(parseFloat(e.target.value) || 0)
                            }
                          />
                        </FormControl>
                        <FormDescription className="text-xs">
                          Giá nhập vào của một đơn vị hàng
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Unit Price */}
                  <FormField
                    control={form.control}
                    name="unitPrice"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>
                          Giá bán (đơn vị)
                          <span className="text-destructive ml-1">*</span>
                        </FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            placeholder="0"
                            {...field}
                            onChange={(e) =>
                              field.onChange(parseFloat(e.target.value) || 0)
                            }
                          />
                        </FormControl>
                        <FormDescription className="text-xs">
                          Giá bán ra của một đơn vị hàng
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              {/* Stock Configuration */}
              <div className="space-y-4">
                <h3 className="font-semibold text-sm">Cấu hình tồn kho</h3>
                <div className="grid gap-4 md:grid-cols-2">
                  {/* Min Stock */}
                  <FormField
                    control={form.control}
                    name="minStock"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Tồn kho tối thiểu</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            placeholder="0"
                            {...field}
                            onChange={(e) =>
                              field.onChange(parseFloat(e.target.value) || 0)
                            }
                          />
                        </FormControl>
                        <FormDescription className="text-xs">
                          Ngưỡng cảnh báo tồn kho thấp
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Max Stock */}
                  <FormField
                    control={form.control}
                    name="maxStock"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Tồn kho tối đa</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            placeholder="0"
                            {...field}
                            onChange={(e) =>
                              field.onChange(parseFloat(e.target.value) || 0)
                            }
                          />
                        </FormControl>
                        <FormDescription className="text-xs">
                          Ngưỡng cảnh báo tồn kho cao
                        </FormDescription>
                        <FormMessage className="text-sm max-w-fit" />
                      </FormItem>
                    )}
                  />
                </div>
              </div>
            </div>
          </form>
        </Form>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isSubmitting}
          >
            Hủy
          </Button>
          <Button
            type="submit"
            onClick={form.handleSubmit(onSubmit)}
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Đang lưu...
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                Cập nhật
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
