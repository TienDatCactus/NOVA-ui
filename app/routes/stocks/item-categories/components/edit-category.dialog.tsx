import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
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
import { Skeleton } from "~/components/ui/skeleton";
import { Switch } from "~/components/ui/switch";
import { Textarea } from "~/components/ui/textarea";
import {
  useItemCategoryDetail,
  useUpdateItemCategory,
} from "../container/query.hooks";

const updateCategorySchema = z.object({
  name: z.string().min(1, "Tên danh mục không được để trống"),
  description: z.string().optional(),
  isActive: z.boolean(),
});

type UpdateCategoryFormData = z.infer<typeof updateCategorySchema>;

interface EditCategoryDialogProps {
  open: boolean;
  onClose: () => void;
  categoryId: string;
}

export default function EditCategoryDialog({
  open,
  onClose,
  categoryId,
}: EditCategoryDialogProps) {
  const { data: category, isPending: isLoadingCategory } =
    useItemCategoryDetail(categoryId);
  const { mutate: updateCategory, isPending: isUpdating } =
    useUpdateItemCategory();

  const form = useForm<UpdateCategoryFormData>({
    resolver: zodResolver(updateCategorySchema),
    defaultValues: {
      name: "",
      description: "",
      isActive: true,
    },
  });

  // Prefill form when category data loads
  useEffect(() => {
    if (category) {
      form.reset({
        name: category.name,
        description: category.description || "",
        isActive: category.isActive,
      });
    }
  }, [category, form]);

  const onSubmit = (data: UpdateCategoryFormData) => {
    updateCategory(
      {
        id: categoryId,
        data: {
          name: data.name,
          description: data.description || null,
          isActive: data.isActive,
        },
      },
      {
        onSuccess: () => {
          onClose();
        },
      }
    );
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Chỉnh sửa danh mục</DialogTitle>
          <DialogDescription>
            Cập nhật thông tin danh mục hàng hóa
          </DialogDescription>
        </DialogHeader>

        {isLoadingCategory ? (
          <div className="space-y-4">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-16 w-full" />
          </div>
        ) : (
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tên danh mục *</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="VD: Đồ uống, Thực phẩm..."
                        {...field}
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
                        placeholder="Mô tả về danh mục..."
                        className="resize-none"
                        rows={3}
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      Mô tả chi tiết về danh mục (không bắt buộc)
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="isActive"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">
                        Trạng thái hoạt động
                      </FormLabel>
                      <FormDescription>
                        Danh mục có đang được sử dụng không
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

              <DialogFooter>
                <Button type="button" variant="outline" onClick={onClose}>
                  Hủy
                </Button>
                <Button type="submit" disabled={isUpdating}>
                  {isUpdating ? "Đang cập nhật..." : "Cập nhật"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        )}
      </DialogContent>
    </Dialog>
  );
}
