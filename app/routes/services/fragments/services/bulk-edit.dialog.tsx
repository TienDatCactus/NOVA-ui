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
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "~/components/ui/form";
import { Input } from "~/components/ui/input";
import { Switch } from "~/components/ui/switch";
import type { ServiceItem } from "~/services/api/services/dto";

const BulkEditSchema = z.object({
  basePrice: z.number().min(0).optional(),
  active: z.boolean().optional(),
});

type BulkEditFormData = z.infer<typeof BulkEditSchema>;

interface BulkEditDialogProps {
  open: boolean;
  onClose: () => void;
  selectedServices: ServiceItem[];
  onSubmit: (data: { basePrice?: number; active?: boolean }) => void;
}

export default function BulkEditDialog({
  open,
  onClose,
  selectedServices,
  onSubmit,
}: BulkEditDialogProps) {
  const form = useForm<BulkEditFormData>({
    resolver: zodResolver(BulkEditSchema),
    defaultValues: {
      basePrice: undefined,
      active: undefined,
    },
  });

  const handleSubmit = (data: BulkEditFormData) => {
    const updates: { basePrice?: number; active?: boolean } = {};
    if (data.basePrice !== undefined) updates.basePrice = data.basePrice;
    if (data.active !== undefined) updates.active = data.active;

    onSubmit(updates);
    form.reset();
    onClose();
  };

  const handleClose = () => {
    form.reset();
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Chỉnh sửa hàng loạt</DialogTitle>
          <DialogDescription>
            Cập nhật thông tin cho {selectedServices.length} dịch vụ đã chọn.
            Chỉ điền vào các trường bạn muốn thay đổi.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            className="space-y-4"
          >
            <FormField
              control={form.control}
              name="basePrice"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Đơn giá mới</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      placeholder="Để trống nếu không thay đổi"
                      {...field}
                      onChange={(e) => {
                        const value = e.target.value;
                        field.onChange(value ? Number(value) : undefined);
                      }}
                      value={field.value ?? ""}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="active"
              render={({ field }) => (
                <FormItem className="flex items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base">
                      Trạng thái hoạt động
                    </FormLabel>
                    <p className="text-sm text-muted-foreground">
                      Bật/tắt trạng thái hoạt động cho tất cả dịch vụ đã chọn
                    </p>
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
              <Button type="button" variant="outline" onClick={handleClose}>
                Hủy
              </Button>
              <Button type="submit">Cập nhật</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
