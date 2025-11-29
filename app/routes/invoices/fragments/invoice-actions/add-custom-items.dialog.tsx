import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import z from "zod";
import { Button } from "~/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormDescription,
  FormMessage,
} from "~/components/ui/form";
import { Input } from "~/components/ui/input";
import { Textarea } from "~/components/ui/textarea";
import type { AddCustomItemsRequestDto } from "~/services/api/invoices/dto";
import { InvoiceSchema } from "~/services/api/invoices/invoice.schema";

const AddItemSchema = z.object({
  customItemName: z.string().min(1, "Tên mục là bắt buộc"),
  quantity: z.number().min(1, "Số lượng tối thiểu là 1"),
  unitPrice: z.number().min(0, "Đơn giá không âm"),
  description: z.string().optional(),
  note: z.string().optional(),
});
type AddItemDialogProps = {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: AddCustomItemsRequestDto) => void;
};
// removed broken function signature
export default function AddItemDialog(props: AddItemDialogProps) {
  const { open, onClose, onSubmit } = props;
  const form = useForm<AddCustomItemsRequestDto>({
    resolver: zodResolver(InvoiceSchema.AddCustomItemsRequestSchema),
    defaultValues: {
      customItemName: "",
      quantity: 1,
      unitPrice: 0,
      description: "",
      note: "",
    },
  });

  useEffect(() => {
    if (open) form.reset();
  }, [open, form]);

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="shadow-sm  p-6 max-w-md w-full">
        <DialogHeader>
          <DialogTitle className="text-lg font-bold text-foreground">
            Thêm mục tùy chỉnh
          </DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form
            className="space-y-6"
            onSubmit={form.handleSubmit((values) =>
              onSubmit({
                customItemName: values.customItemName,
                quantity: values.quantity,
                unitPrice: values.unitPrice,
                description: values.description || "",
                note: values.note || "",
              })
            )}
          >
            <FormField
              control={form.control}
              name="customItemName"
              render={({ field }) => (
                <div className="space-y-2">
                  <FormControl>
                    <Input
                      placeholder="Tên mục"
                      className="bg-background text-foreground placeholder:text-muted-foreground"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription className="text-muted-foreground text-xs">
                    Nhập tên mục tùy chỉnh (bắt buộc).
                  </FormDescription>
                  <FormMessage />
                </div>
              )}
            />
            <FormField
              control={form.control}
              name="quantity"
              render={({ field }) => (
                <div className="space-y-2">
                  <FormControl>
                    <Input
                      type="number"
                      min={1}
                      placeholder="Số lượng"
                      className="bg-background text-foreground placeholder:text-muted-foreground"
                      {...field}
                      onChange={(e) => field.onChange(Number(e.target.value))}
                    />
                  </FormControl>
                  <FormDescription className="text-muted-foreground text-xs">
                    Số lượng mục cần thêm (tối thiểu 1).
                  </FormDescription>
                  <FormMessage />
                </div>
              )}
            />
            <FormField
              control={form.control}
              name="unitPrice"
              render={({ field }) => (
                <div className="space-y-2">
                  <FormControl>
                    <Input
                      type="number"
                      min={0}
                      placeholder="Đơn giá"
                      className="bg-background text-foreground placeholder:text-muted-foreground"
                      {...field}
                      onChange={(e) => field.onChange(Number(e.target.value))}
                    />
                  </FormControl>
                  <FormDescription className="text-muted-foreground text-xs">
                    Đơn giá cho mỗi mục (không âm).
                  </FormDescription>
                  <FormMessage />
                </div>
              )}
            />
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <div className="space-y-2">
                  <FormControl>
                    <Textarea
                      placeholder="Mô tả"
                      className="bg-background text-foreground placeholder:text-muted-foreground min-h-[60px]"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription className="text-muted-foreground text-xs">
                    (Tùy chọn) Mô tả chi tiết cho mục này.
                  </FormDescription>
                  <FormMessage />
                </div>
              )}
            />
            <FormField
              control={form.control}
              name="note"
              render={({ field }) => (
                <div className="space-y-2">
                  <FormControl>
                    <Textarea
                      placeholder="Ghi chú (tuỳ chọn)"
                      className="bg-background text-foreground placeholder:text-muted-foreground min-h-[60px]"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription className="text-muted-foreground text-xs">
                    (Tùy chọn) Thêm ghi chú cho mục này.
                  </FormDescription>
                  <FormMessage />
                </div>
              )}
            />
            <DialogFooter className="flex flex-row gap-4 justify-end pt-4">
              <Button variant="outline" type="button" onClick={onClose}>
                Hủy
              </Button>
              <Button
                type="submit"
                variant="default"
                disabled={!form.formState.isValid}
              >
                Thêm
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
