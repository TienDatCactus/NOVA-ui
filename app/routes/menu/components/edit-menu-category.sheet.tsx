import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useEffect } from "react";
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
import { Switch } from "~/components/ui/switch";
import useMenuCategorySchema from "~/services/schema/menu-category.schema";
import type { MenuCategoryItem } from "~/services/api/menu-category/dto";
import { useUpdateMenuCategory } from "../container/menu-category-mutation.hooks";

const { UpdateMenuCategoryRequestSchema } = useMenuCategorySchema();

type UpdateMenuCategoryFormData = z.infer<
  typeof UpdateMenuCategoryRequestSchema
>;

interface EditMenuCategorySheetProps {
  open: boolean;
  onClose: () => void;
  category: MenuCategoryItem | null;
}

export default function EditMenuCategorySheet({
  open,
  onClose,
  category,
}: EditMenuCategorySheetProps) {
  const form = useForm<UpdateMenuCategoryFormData>({
    resolver: zodResolver(UpdateMenuCategoryRequestSchema),
    defaultValues: {
      code: "",
      name: "",
      active: true,
    },
  });

  const { mutate: updateMenuCategory, isPending } = useUpdateMenuCategory();

  // Populate form when category changes
  useEffect(() => {
    if (category) {
      form.reset({
        code: category.code,
        name: category.name,
        active: category.active,
      });
    }
  }, [category, form]);

  const handleSubmit = (data: UpdateMenuCategoryFormData) => {
    if (!category) return;

    updateMenuCategory(
      { id: category.id, data },
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
      <SheetContent className="sm:max-w-[500px] overflow-y-auto">
        <SheetHeader className="px-6 pt-6">
          <SheetTitle>Chỉnh sửa danh mục thực đơn</SheetTitle>
          <SheetDescription>
            Cập nhật thông tin cho danh mục thực đơn. Nhấn lưu khi hoàn tất.
          </SheetDescription>
        </SheetHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            className="space-y-6 px-6 py-6"
          >
            {/* Code */}
            <FormField
              control={form.control}
              name="code"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Mã danh mục <span className="text-destructive">*</span>
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder="VD: APPETIZER, MAIN_COURSE, DESSERT"
                      {...field}
                    />
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
                    Tên danh mục <span className="text-destructive">*</span>
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder="VD: Khai vị, Món chính, Tráng miệng"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Active Status */}
            <FormField
              control={form.control}
              name="active"
              render={({ field }) => (
                <FormItem className="flex items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5 flex-1 pr-4">
                    <FormLabel className="text-base">
                      Trạng thái hoạt động
                    </FormLabel>
                    <FormDescription className="text-sm">
                      Tắt nếu muốn tạm ngừng danh mục này
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

            <SheetFooter className="gap-2 pt-4">
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
