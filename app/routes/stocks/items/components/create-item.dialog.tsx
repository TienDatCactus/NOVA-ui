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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { ScrollArea } from "~/components/ui/scroll-area";
import { Separator } from "~/components/ui/separator";
import { FormSchema } from "~/services/schema/forms.schema";
import type z from "zod";
import { useUnits } from "~/routes/units/container/unit-query.hooks";
import { useItemCategories } from "../../item-categories/container/query.hooks";
import { useCreateStockItem } from "../container/query.hooks";

export type CreateItemFormData = z.infer<
  typeof FormSchema.CreateItemFormSchema
>;

interface CreateItemDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function CreateItemDialog({
  open,
  onOpenChange,
}: CreateItemDialogProps) {
  const { data: categories = [] } = useItemCategories({
    includeInactive: false,
  });
  const { data: units = [] } = useUnits({ includeInactive: false });

  const { mutate: onSubmit, isPending: isSubmitting } = useCreateStockItem();
  const form = useForm<CreateItemFormData>({
    resolver: zodResolver(FormSchema.CreateItemFormSchema),
    mode: "onSubmit",
    defaultValues: {
      code: "",
      name: "",
      description: "",
      categoryId: "",
      unitId: "",
      unitCost: 0,
      unitPrice: 0,
      minStock: 0,
      maxStock: 0,
    },
  });

  const handleSubmit = (data: CreateItemFormData) => {
    onSubmit(data);
    form.reset();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl p-0 gap-0 overflow-hidden">
        {/* Header Compact */}
        <DialogHeader className="p-4 border-b bg-muted/10">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <DialogTitle>Thêm hàng hóa mới</DialogTitle>
              <DialogDescription>
                Nhập thông tin chi tiết cho sản phẩm
              </DialogDescription>
            </div>
            {/* Close button handled by Dialog primitive usually, but explicit looks nice */}
          </div>
        </DialogHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            className="flex flex-col md:flex-row"
          >
            {/* LEFT COLUMN: Thông tin định danh (Chiếm không gian lớn hơn) */}
            <div className="flex-1 p-4 space-y-4">
              <div className="grid grid-cols-12 gap-4">
                {/* Code: 4 cols */}
                <div className="col-span-12 md:col-span-4">
                  <FormField
                    control={form.control}
                    name="code"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>
                          Mã hàng <span className="text-red-500">*</span>
                        </FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Mã tự động"
                            className="uppercase font-mono"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Name: 8 cols */}
                <div className="col-span-12 md:col-span-8">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>
                          Tên hàng hóa <span className="text-red-500">*</span>
                        </FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Nhập tên sản phẩm..."
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="categoryId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        Danh mục <span className="text-red-500">*</span>
                      </FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Chọn nhóm" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {categories.map((c) => (
                            <SelectItem key={c.id} value={c.id}>
                              {c.name}
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
                        Đơn vị <span className="text-red-500">*</span>
                      </FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Chọn ĐVT" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {units.map((u) => (
                            <SelectItem key={u.id} value={u.id}>
                              {u.name}
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
                    <FormLabel>Ghi chú</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Mô tả thêm..."
                        className="resize-none min-h-[80px]"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* RIGHT COLUMN: Các con số (Giá & Kho) - Nền xám nhẹ để tách biệt */}
            <div className="w-full md:w-[280px] bg-muted/10 border-l p-4 space-y-5">
              {/* Pricing Section */}
              <div className="space-y-3">
                <h4 className="text-xs font-semibold uppercase text-muted-foreground tracking-wider">
                  Thiết lập giá
                </h4>
                <FormField
                  control={form.control}
                  name="unitCost"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs">Giá vốn</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Input
                            type="number"
                            className="pr-8 text-right font-mono"
                            {...field}
                          />
                          <span className="absolute right-3 top-2.5 text-xs text-muted-foreground">
                            đ
                          </span>
                        </div>
                      </FormControl>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="unitPrice"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs">Giá bán</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Input
                            type="number"
                            className="pr-8 text-right font-mono font-semibold text-emerald-600"
                            {...field}
                          />
                          <span className="absolute right-3 top-2.5 text-xs text-muted-foreground">
                            đ
                          </span>
                        </div>
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>

              <div className="h-px bg-border/50 w-full" />

              {/* Stock Section */}
              <div className="space-y-3">
                <h4 className="text-xs font-semibold uppercase text-muted-foreground tracking-wider">
                  Định mức tồn
                </h4>
                <div className="grid grid-cols-2 gap-2">
                  <FormField
                    control={form.control}
                    name="minStock"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs">Tối thiểu</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            className="text-center h-8"
                            {...field}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="maxStock"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs">Tối đa</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            className="text-center h-8"
                            {...field}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </div>
              </div>
            </div>
          </form>
        </Form>

        <DialogFooter className="p-4 border-t bg-muted/10">
          <Button
            variant="ghost"
            onClick={() => onOpenChange(false)}
            disabled={isSubmitting}
          >
            Hủy bỏ
          </Button>
          <Button
            onClick={form.handleSubmit(handleSubmit)}
            disabled={isSubmitting}
            className="min-w-[100px]"
          >
            {isSubmitting ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Save className="mr-2 h-4 w-4" />
            )}
            Lưu
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
