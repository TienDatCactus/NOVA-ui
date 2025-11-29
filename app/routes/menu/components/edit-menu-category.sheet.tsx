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
                <SheetTitle className="text-xl flex items-center gap-2">
                  <Layers className="w-5 h-5 text-primary" />
                  Chỉnh sửa danh mục
                </SheetTitle>
                <SheetDescription>
                  Cập nhật thông tin phân loại cho thực đơn.
                </SheetDescription>
              </div>

              {/* Status Switch in Header */}
              <FormField
                control={form.control}
                name="active"
                render={({ field }) => (
                  <FormItem className="flex items-center space-y-0 gap-2.5 bg-background border px-3 py-1.5 rounded-full shadow-sm">
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                        className="scale-75 data-[state=checked]:bg-green-600"
                      />
                    </FormControl>
                    <FormLabel className="text-xs font-medium cursor-pointer mb-0 pb-0 text-foreground">
                      {field.value ? "Đang hoạt động" : "Đã ẩn"}
                    </FormLabel>
                  </FormItem>
                )}
              />
            </SheetHeader>

            {/* === BODY === */}
            <div className="flex-1 overflow-y-auto p-6">
              <div className="space-y-8 max-w-lg">
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
                          Tên danh mục{" "}
                          <span className="text-destructive">*</span>
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

                {/* Metadata Section (Read-only) */}
                {category && (
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                      <Archive className="w-4 h-4" /> Thống kê & Lịch sử
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-muted/10 border rounded-lg p-4 flex flex-col gap-1">
                        <span className="text-xs text-muted-foreground font-medium">
                          Số lượng món ăn
                        </span>
                        <div className="flex items-center gap-2">
                          <Tag className="w-4 h-4 text-primary" />
                          <span className="text-xl font-bold font-mono text-foreground">
                            {category.menuItemCount}
                          </span>
                        </div>
                      </div>

                      <div className="bg-muted/10 border rounded-lg p-4 flex flex-col gap-1">
                        <span className="text-xs text-muted-foreground font-medium">
                          Ngày tạo
                        </span>
                        <div className="flex items-center gap-2">
                          <CalendarDays className="w-4 h-4 text-primary" />
                          <span className="text-sm font-medium text-foreground">
                            {category.createdAt
                              ? toYMD(category.createdAt)
                              : "N/A"}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
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
