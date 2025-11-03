import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "~/components/ui/form";
import { Input } from "~/components/ui/input";
import { Button } from "~/components/ui/button";
import { Switch } from "~/components/ui/switch";
import { useCreateUnit } from "../container/unit-mutation.hooks";

const CreateUnitFormSchema = z.object({
  code: z
    .string()
    .min(1, "Mã đơn vị không được để trống")
    .max(10, "Mã đơn vị không được quá 10 ký tự"),
  name: z.string().min(1, "Tên đơn vị không được để trống"),
  active: z.boolean(),
});

type CreateUnitForm = z.infer<typeof CreateUnitFormSchema>;

interface CreateUnitDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export default function CreateUnitDialog({
  open,
  onOpenChange,
  onSuccess,
}: CreateUnitDialogProps) {
  const { mutate: createUnit, isPending } = useCreateUnit();

  const form = useForm<CreateUnitForm>({
    resolver: zodResolver(CreateUnitFormSchema),
    defaultValues: {
      code: "",
      name: "",
      active: true,
    },
  });

  const handleSubmit = (data: CreateUnitForm) => {
    createUnit(data, {
      onSuccess: () => {
        form.reset();
        onOpenChange(false);
        onSuccess?.();
      },
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader>
          <DialogTitle>Thêm đơn vị tính</DialogTitle>
          <DialogDescription>
            Tạo đơn vị tính mới cho sản phẩm
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            className="space-y-6"
          >
            {/* Code */}
            <FormField
              control={form.control}
              name="code"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Mã đơn vị *</FormLabel>
                  <FormControl>
                    <Input placeholder="VD: KG, L, CHAI..." {...field} />
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
                  <FormLabel>Tên đơn vị *</FormLabel>
                  <FormControl>
                    <Input placeholder="VD: Kilogram, Lít, Chai..." {...field} />
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
                      Đơn vị đang hoạt động
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
            <div className="flex justify-end gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isPending}
              >
                Hủy
              </Button>
              <Button type="submit" disabled={isPending}>
                {isPending ? "Đang tạo..." : "Tạo mới"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
