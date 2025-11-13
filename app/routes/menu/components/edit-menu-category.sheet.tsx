import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
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
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "~/components/ui/sheet";
import { Skeleton } from "~/components/ui/skeleton";
import { Switch } from "~/components/ui/switch";
import { MenuCategorySchema } from "~/services/api/menu-category/menu-category.schema";
import { useUpdateMenuCategory } from "../container/menu-categories/mutation.hooks";
import { useMenuCategoryDetail } from "../container/menu-categories/query.hooks";
import { toYMD } from "~/lib/utils";

const { UpdateMenuCategoryRequestSchema } = MenuCategorySchema;

type UpdateCategoryFormValues = z.infer<typeof UpdateMenuCategoryRequestSchema>;

interface EditMenuCategorySheetProps {
  open: boolean;
  onClose: () => void;
  categoryId: string;
}

/**
 * Sheet để cập nhật menu category
 * Form fields: code, name, active
 */
export default function EditMenuCategorySheet({
  open,
  onClose,
  categoryId,
}: EditMenuCategorySheetProps) {
  const { data: category, isPending: isLoadingDetail } = useMenuCategoryDetail(
    categoryId ?? "",
    { enabled: open }
  );
  const { mutate: updateCategory, isPending: isUpdating } =
    useUpdateMenuCategory(categoryId);
  const form = useForm<UpdateCategoryFormValues>({
    resolver: zodResolver(UpdateMenuCategoryRequestSchema),
    defaultValues: {
      code: "",
      name: "",
      active: true,
    },
  });

  // Pre-populate form when category data is loaded
  useEffect(() => {
    if (category) {
      form.reset({
        code: category.code,
        name: category.name,
        active: category.active,
      });
    }
  }, [category, form]);

  const onSubmit = (data: UpdateCategoryFormValues) => {
    updateCategory(data, {
      onSuccess: () => {
        onClose();
      },
    });
  };

  const handleClose = () => {
    form.reset();
    onClose();
  };
  if (isLoadingDetail) {
    return (
      <Sheet open={open} onOpenChange={handleClose}>
        <SheetContent className="sm:max-w-[700px] p-0 flex flex-col gap-0">
          <SheetHeader className="p-6 pb-4 border-b">
            <SheetTitle>Chỉnh sửa món ăn</SheetTitle>
            <SheetDescription>Đang tải thông tin món ăn...</SheetDescription>
          </SheetHeader>
          <div className="flex-1 p-6 space-y-4">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-40 w-full" />
          </div>
        </SheetContent>
      </Sheet>
    );
  }
  return (
    <Sheet open={open} onOpenChange={handleClose}>
      <SheetContent className="sm:max-w-[700px] p-0 flex flex-col gap-0 overflow-hidden">
        <SheetHeader className="p-6 pb-4 border-b">
          <SheetTitle>Chỉnh sửa danh mục</SheetTitle>
          <SheetDescription>
            Cập nhật thông tin danh mục. Các trường có dấu * là bắt buộc.
          </SheetDescription>
        </SheetHeader>
        <div className="flex-1 overflow-y-auto p-6">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 ">
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
                        placeholder="VD: FOOD, DRINK, DESSERT..."
                        className="font-mono"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      Mã định danh duy nhất cho danh mục (viết hoa, không dấu)
                    </FormDescription>
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
                        placeholder="VD: Món chính, Đồ uống..."
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>Tên hiển thị của danh mục</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Active */}
              <FormField
                control={form.control}
                name="active"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4 bg-muted/30">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">
                        Trạng thái hoạt động
                      </FormLabel>
                      <FormDescription>
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

              {/* Category Info (read-only) */}
              {category && (
                <div className="rounded-lg border p-4 bg-muted/10 space-y-2">
                  <h4 className="text-sm font-medium">Thông tin danh mục</h4>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>
                      <span className="text-muted-foreground">Số món ăn:</span>{" "}
                      <span className="font-semibold">
                        {category.menuItemCount}
                      </span>
                    </div>
                    {category.createdAt && (
                      <div>
                        <span className="text-muted-foreground">Ngày tạo:</span>{" "}
                        <span className="font-semibold">
                          {toYMD(category.createdAt)}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </form>
          </Form>
        </div>
        <SheetFooter>
          <Button
            type="button"
            variant="outline"
            onClick={handleClose}
            disabled={isUpdating}
          >
            Hủy
          </Button>
          <Button onClick={form.handleSubmit(onSubmit)} disabled={isUpdating}>
            {isUpdating ? "Đang cập nhật..." : "Cập nhật"}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
