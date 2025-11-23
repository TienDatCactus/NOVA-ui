import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
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
import { Button } from "~/components/ui/button";
import { Switch } from "~/components/ui/switch";
import { Card } from "~/components/ui/card";
import { Loader2, Package } from "lucide-react";
import { useCreateUnit } from "../container/unit-mutation.hooks";

const CreateUnitFormSchema = z.object({
  code: z
    .string()
    .min(1, "Mã đơn vị không được để trống")
    .max(10, "Mã đơn vị không được quá 10 ký tự")
    .toUpperCase(),
  name: z
    .string()
    .min(1, "Tên đơn vị không được để trống")
    .max(100, "Tên đơn vị không được quá 100 ký tự"),
  active: z.boolean(),
});

type CreateUnitForm = z.infer<typeof CreateUnitFormSchema>;

interface CreateUnitDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function CreateUnitDialog({
  open,
  onOpenChange,
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
      },
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[520px]">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-primary/10 p-2.5">
              <Package className="h-5 w-5 text-primary" />
            </div>
            <div>
              <DialogTitle className="text-xl">Thêm đơn vị tính</DialogTitle>
              <DialogDescription className="mt-1">
                Tạo đơn vị đo lường mới cho sản phẩm và dịch vụ
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            className="space-y-6 mt-4"
          >
            <div className="space-y-4">
              {/* Code */}
              <FormField
                control={form.control}
                name="code"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-semibold">
                      Mã đơn vị <span className="text-destructive">*</span>
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder="VD: KG, L, CHAI, HỘP..."
                        className="font-mono uppercase"
                        maxLength={10}
                        {...field}
                      />
                    </FormControl>
                    <FormDescription className="text-xs">
                      Mã viết tắt của đơn vị (tối đa 10 ký tự)
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
                    <FormLabel className="text-sm font-semibold">
                      Tên đơn vị <span className="text-destructive">*</span>
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder="VD: Kilogram, Lít, Chai, Hộp..."
                        {...field}
                      />
                    </FormControl>
                    <FormDescription className="text-xs">
                      Tên đầy đủ của đơn vị đo lường
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Active */}
              <FormField
                control={form.control}
                name="active"
                render={({ field }) => (
                  <FormItem>
                    <Card className="p-4 border-muted bg-muted/30">
                      <div className="flex items-center justify-between space-x-4">
                        <div className="flex-1 space-y-1">
                          <FormLabel className="text-sm font-semibold">
                            Trạng thái hoạt động
                          </FormLabel>
                          <FormDescription className="text-xs">
                            Cho phép sử dụng đơn vị này trong hệ thống
                          </FormDescription>
                        </div>
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                      </div>
                    </Card>
                  </FormItem>
                )}
              />
            </div>

            {/* Actions */}
            <DialogFooter className="gap-2 sm:gap-0">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isPending}
              >
                Hủy
              </Button>
              <Button type="submit" disabled={isPending} className="gap-2">
                {isPending && <Loader2 className="h-4 w-4 animate-spin" />}
                {isPending ? "Đang tạo..." : "Tạo đơn vị"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
