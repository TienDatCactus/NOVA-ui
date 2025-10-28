import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "~/components/ui/sheet";
import {
  Form,
  FormControl,
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
import { Switch } from "~/components/ui/switch";
import type { MenuItemDetailDto } from "~/services/api/menu-item/dto";
import type { MenuCategoryWithItems } from "~/services/api/menu-item/dto";
import type { UnitItemDetailResponseDto } from "~/services/api/units/dto";

// Simplified form schema (without components)
const UpdateMenuItemFormSchema = z.object({
  categoryId: z.string().uuid(),
  code: z.string().min(1, "Mã món ăn không được để trống"),
  name: z.string().min(1, "Tên món ăn không được để trống"),
  description: z.string().optional(),
  unitId: z.string().uuid(),
  price: z.number().min(0, "Giá phải lớn hơn hoặc bằng 0"),
  active: z.boolean(),
});

type UpdateMenuItemForm = z.infer<typeof UpdateMenuItemFormSchema>;

interface EditMenuItemSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  menuItemDetail: MenuItemDetailDto | null;
  categories: MenuCategoryWithItems[];
  units: UnitItemDetailResponseDto[];
  onSubmit: (itemId: string, data: UpdateMenuItemForm) => void;
  isPending?: boolean;
}

export default function EditMenuItemSheet({
  open,
  onOpenChange,
  menuItemDetail,
  categories,
  units,
  onSubmit,
  isPending = false,
}: EditMenuItemSheetProps) {
  const form = useForm<UpdateMenuItemForm>({
    resolver: zodResolver(UpdateMenuItemFormSchema),
    defaultValues: {
      code: "",
      name: "",
      categoryId: "",
      unitId: "",
      price: 0,
      description: "",
      active: true,
    },
  });

  // Reset form when menuItemDetail changes
  useEffect(() => {
    if (menuItemDetail) {
      form.reset({
        code: menuItemDetail.code,
        name: menuItemDetail.name,
        categoryId: menuItemDetail.categoryId,
        unitId: menuItemDetail.unitId,
        price: menuItemDetail.price,
        description: menuItemDetail.description || "",
        active: menuItemDetail.active,
      });
    }
  }, [menuItemDetail, form]);

  const handleSubmit = (data: UpdateMenuItemForm) => {
    if (!menuItemDetail) return;
    onSubmit(menuItemDetail.id, data);
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="sm:max-w-[540px] overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Chỉnh sửa món ăn</SheetTitle>
          <SheetDescription>
            Cập nhật thông tin món ăn trong thực đơn
          </SheetDescription>
        </SheetHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            className="space-y-6 mt-6"
          >
            {/* Category */}
            <FormField
              control={form.control}
              name="categoryId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Danh mục thực đơn *</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    value={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Chọn danh mục" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {categories.map((category) => (
                        <SelectItem
                          key={category.categoryId}
                          value={category.categoryId}
                        >
                          {category.categoryName}
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
                  <FormLabel>Đơn vị tính *</FormLabel>
                  <Select
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
                          {unit.name}
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
                  <FormLabel>Mã món *</FormLabel>
                  <FormControl>
                    <Input placeholder="VD: FD001" {...field} />
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
                  <FormLabel>Tên món *</FormLabel>
                  <FormControl>
                    <Input placeholder="VD: Cơm chiên hải sản" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Price */}
            <FormField
              control={form.control}
              name="price"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Giá bán *</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      placeholder="VD: 120000"
                      {...field}
                      onChange={(e) => field.onChange(Number(e.target.value))}
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
                      placeholder="Mô tả chi tiết về món ăn..."
                      className="resize-none"
                      rows={3}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Active */}
            <FormField
              control={form.control}
              name="active"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base">Trạng thái</FormLabel>
                    <div className="text-sm text-muted-foreground">
                      Món ăn đang được bán
                    </div>
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

            {/* Actions */}
            <div className="flex justify-end gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isPending}
              >
                Hủy
              </Button>
              <Button type="submit" disabled={isPending}>
                {isPending ? "Đang lưu..." : "Lưu thay đổi"}
              </Button>
            </div>
          </form>
        </Form>
      </SheetContent>
    </Sheet>
  );
}
