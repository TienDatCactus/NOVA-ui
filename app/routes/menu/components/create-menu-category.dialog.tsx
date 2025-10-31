import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import type z from "zod";
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
import useMenuCategorySchema from "~/services/schema/menu-category.schema";
import { useCreateMenuCategory } from "../container/menu-category-mutation.hooks";

const { CreateMenuCategoryRequestSchema } = useMenuCategorySchema();

type CreateMenuCategoryFormData = z.infer<
  typeof CreateMenuCategoryRequestSchema
>;

interface CreateMenuCategoryDialogProps {
  open: boolean;
  onClose: () => void;
}

export default function CreateMenuCategoryDialog({
  open,
  onClose,
}: CreateMenuCategoryDialogProps) {
  const form = useForm<CreateMenuCategoryFormData>({
    resolver: zodResolver(CreateMenuCategoryRequestSchema),
    defaultValues: {
      code: "",
      name: "",
      active: true,
    },
  });

  const { mutate: createMenuCategory, isPending } = useCreateMenuCategory();

  const handleSubmit = (data: CreateMenuCategoryFormData) => {
    createMenuCategory(data, {
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
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Thêm danh mục thực đơn mới</DialogTitle>
          <DialogDescription>
            Điền thông tin cho danh mục thực đơn mới. Tất cả các trường đánh dấu
            * đều bắt buộc.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            className="space-y-4"
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
                  <FormDescription>
                    Mã duy nhất để nhận diện danh mục
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
                  <div className="space-y-0.5">
                    <FormLabel className="text-base">
                      Trạng thái hoạt động
                    </FormLabel>
                    <FormDescription>
                      Bật để danh mục có thể được sử dụng ngay
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
                {isPending ? "Đang thêm..." : "Thêm danh mục"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
