import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import {
  Archive,
  CalendarDays,
  FileText,
  Layers,
  Save,
  Tag,
  Hash,
} from "lucide-react";

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
import { Badge } from "~/components/ui/badge";
import { Separator } from "~/components/ui/separator";
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

export default function EditMenuCategorySheet({
  open,
  onClose,
  categoryId,
}: EditMenuCategorySheetProps) {
  // --- Queries & Mutations ---
  const { data: category, isPending: isLoadingDetail } = useMenuCategoryDetail(
    categoryId ?? "",
    { enabled: open }
  );

  const { mutate: updateCategory, isPending: isUpdating } =
    useUpdateMenuCategory(categoryId);

  // --- Form Setup ---
  const form = useForm<UpdateCategoryFormValues>({
    resolver: zodResolver(UpdateMenuCategoryRequestSchema),
    defaultValues: {
      code: "",
      name: "",
      active: true,
    },
  });

  // Sync data
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
    updateCategory(data, { onSuccess: handleClose });
  };

  const handleClose = () => {
    form.reset();
    onClose();
  };

  // --- Loading State ---
  if (isLoadingDetail) {
    return (
      <Sheet open={open} onOpenChange={handleClose}>
        <SheetContent className="sm:max-w-[600px] p-0 flex flex-col gap-0">
          <SheetHeader className="p-6 pb-4 border-b">
            <SheetTitle>Đang tải...</SheetTitle>
          </SheetHeader>
          <div className="p-6 space-y-6">
            <div className="space-y-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-10 w-full" />
            </div>
            <div className="space-y-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-10 w-full" />
            </div>
          </div>
        </SheetContent>
      </Sheet>
    );
  }

  return (
    <Sheet open={open} onOpenChange={handleClose}>
      <SheetContent className="sm:max-w-[600px] p-0 flex flex-col gap-0 bg-background">
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="flex flex-col h-full"
          >
            {/* === HEADER === */}
            <SheetHeader className="px-6 py-5 border-b shrink-0 bg-muted/5 flex flex-row items-start justify-between space-y-0">
              <div className="space-y-1.5">
                <SheetTitle className="text-xl gap-2">
                  Chỉnh sửa danh mục
                </SheetTitle>
                <SheetDescription>
                  Cập nhật thông tin chi tiết cho{" "}
                  <span className="font-semibold text-foreground">
                    {category?.name}
                  </span>
                </SheetDescription>
              </div>
            </SheetHeader>

            {/* === BODY === */}
            <div className="flex-1 overflow-y-auto space-y-6 p-6">
              {/* Identity Section */}
              <div className="space-y-5">
                <div className="flex items-center gap-2 text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                  <FileText className="w-4 h-4" /> Thông tin chung
                </div>

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
                          placeholder="VD: Món Khai Vị"
                          className="h-11 text-lg font-medium"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="code"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        Mã định danh (Code){" "}
                        <span className="text-destructive">*</span>
                      </FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Hash className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                          <Input
                            placeholder="VD: APPETIZER"
                            className="pl-9 font-mono uppercase"
                            {...field}
                          />
                        </div>
                      </FormControl>
                      <FormDescription className="text-xs">
                        Mã duy nhất dùng để quản lý hệ thống.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
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
                          id="menu-item-active-switch"
                        />
                        <div className="grid grow gap-2">
                          <FormLabel
                            className="text-xs font-medium cursor-pointer flex-col items-start mb-0 pb-0"
                            htmlFor="menu-item-active-switch"
                          >
                            <p>{field.value ? "Đang bán" : "Tạm ngưng"}</p>
                            <p className="text-muted-foreground text-xs">
                              Chọn "Tạm ngưng" để ẩn danh mục món ăn này khỏi
                              thực đơn POS.
                            </p>
                          </FormLabel>
                        </div>
                      </div>
                    </FormControl>
                    <FormMessage />
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
                disabled={isUpdating}
                className="w-full sm:w-auto"
              >
                Hủy bỏ
              </Button>
              <Button
                type="submit"
                disabled={isUpdating}
                className="w-full sm:w-auto min-w-[140px]"
              >
                {isUpdating ? (
                  <div className="flex items-center gap-2">
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                    <span>Đang lưu...</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <Save className="w-4 h-4" />
                    <span>Lưu thay đổi</span>
                  </div>
                )}
              </Button>
            </SheetFooter>
          </form>
        </Form>
      </SheetContent>
    </Sheet>
  );
}
