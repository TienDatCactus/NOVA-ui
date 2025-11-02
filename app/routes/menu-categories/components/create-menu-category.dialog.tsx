import { zodResolver } from "@hookform/resolvers/zod";
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
import { Switch } from "~/components/ui/switch";
import { MenuCategorySchema } from "~/services/schema/menu-category.schema";
import { useCreateMenuCategory } from "../container/menu-categories/mutation.hooks";

const { CreateMenuCategoryRequestSchema } = MenuCategorySchema;

type CreateCategoryFormValues = z.infer<typeof CreateMenuCategoryRequestSchema>;

interface CreateMenuCategoryDialogProps {
  open: boolean;
  onClose: () => void;
}

/**
 * Dialog để tạo menu category mới
 * Form fields: code, name, active
 */
export default function CreateMenuCategoryDialog({
  open,
  onClose,
}: CreateMenuCategoryDialogProps) {
  const { mutate: createCategory, isPending } = useCreateMenuCategory();

  const form = useForm<CreateCategoryFormValues>({
    resolver: zodResolver(CreateMenuCategoryRequestSchema),
    defaultValues: {
      code: "",
      name: "",
      active: true,
    },
  });

  const onSubmit = (data: CreateCategoryFormValues) => {
    createCategory(data, {
      onSuccess: () => {
        form.reset();
        onClose();
      },
    });
  };

  const handleClose = () => {
    form.reset();
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Thêm danh mục mới</DialogTitle>
          <DialogDescription>
            Tạo danh mục mới cho thực đơn. Các trường có dấu * là bắt buộc.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
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
                    <Input placeholder="VD: Món chính, Đồ uống..." {...field} />
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

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={handleClose}
                disabled={isPending}
              >
                Hủy
              </Button>
              <Button type="submit" disabled={isPending}>
                {isPending ? "Đang tạo..." : "Tạo danh mục"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
