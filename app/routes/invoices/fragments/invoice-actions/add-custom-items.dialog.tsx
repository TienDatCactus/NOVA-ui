import { zodResolver } from "@hookform/resolvers/zod";
import { Banknote, Calculator, Hash, PackagePlus, Plus } from "lucide-react";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
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
  FormItem,
  FormLabel,
  FormMessage,
} from "~/components/ui/form";
import { Input } from "~/components/ui/input";
import { Separator } from "~/components/ui/separator";
import { Textarea } from "~/components/ui/textarea";
import type { AddCustomItemsRequestDto } from "~/services/api/invoices/dto";
import { InvoiceSchema } from "~/services/api/invoices/invoice.schema";

type AddItemDialogProps = {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: AddCustomItemsRequestDto) => void;
};

export default function AddItemDialog({
  open,
  onClose,
  onSubmit,
}: AddItemDialogProps) {
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

  // Real-time Calculation Logic
  const quantity = form.watch("quantity") || 0;
  const unitPrice = form.watch("unitPrice") || 0;
  const subTotal = quantity * unitPrice;

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(value);
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="bg-card shadow-lg p-0 gap-0 max-w-lg w-full overflow-hidden">
        {/* HEADER */}
        <DialogHeader className="px-6 py-4 border-b bg-muted/10">
          <DialogTitle className="flex items-center gap-2 text-lg font-bold text-foreground">
            <div className="p-2 bg-primary/10 rounded-full text-primary">
              <PackagePlus className="w-5 h-5" />
            </div>
            Thêm mục tùy chỉnh
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit((values) =>
              onSubmit({
                ...values,
                description: values.description || "",
                note: values.note || "",
              })
            )}
            className="flex flex-col"
          >
            <div className="p-6 space-y-5">
              {/* ITEM NAME - Full Width */}
              <FormField
                control={form.control}
                name="customItemName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Tên dịch vụ / sản phẩm{" "}
                      <span className="text-destructive">*</span>
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder="VD: Phí dọn dẹp thêm, Set trái cây..."
                        className="bg-background font-medium"
                        autoFocus
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* GRID: QUANTITY & PRICE */}
              <div className="grid grid-cols-12 gap-4 items-start">
                {/* QUANTITY (Smaller col) */}
                <div className="col-span-4">
                  <FormField
                    control={form.control}
                    name="quantity"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Số lượng</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Hash className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground opacity-50" />
                            <Input
                              type="number"
                              min={1}
                              className="pl-9 text-center font-mono"
                              {...field}
                              onChange={(e) =>
                                field.onChange(Number(e.target.value))
                              }
                            />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* UNIT PRICE (Larger col) */}
                <div className="col-span-8">
                  <FormField
                    control={form.control}
                    name="unitPrice"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Đơn giá</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Banknote className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground opacity-50" />
                            <Input
                              type="number"
                              min={0}
                              placeholder="0"
                              className="pl-9 pr-12 font-mono text-right"
                              {...field}
                              onChange={(e) =>
                                field.onChange(Number(e.target.value))
                              }
                            />
                            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground font-medium">
                              VND
                            </span>
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              {/* LIVE SUBTOTAL PREVIEW */}
              <div className="bg-muted/30 rounded-lg p-3 flex justify-between items-center border border-dashed">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Calculator className="w-4 h-4" /> Thành tiền tạm tính:
                </div>
                <div className="font-mono font-bold text-lg text-primary">
                  {formatCurrency(subTotal)}
                </div>
              </div>

              <Separator />

              {/* OPTIONAL FIELDS - Stacked but compact */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs text-muted-foreground">
                        Mô tả (Optional)
                      </FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Chi tiết về mục này..."
                          className="bg-background min-h-[60px] resize-none text-sm"
                          {...field}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="note"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs text-muted-foreground">
                        Ghi chú nội bộ (Optional)
                      </FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Lưu ý cho nhân viên..."
                          className="bg-background min-h-[60px] resize-none text-sm"
                          {...field}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* FOOTER */}
            <DialogFooter className="px-6 py-4 border-t bg-muted/5 gap-2">
              <Button variant="outline" type="button" onClick={onClose}>
                Hủy bỏ
              </Button>
              <Button
                type="submit"
                className="min-w-[120px]"
                disabled={!form.formState.isValid || quantity < 1}
              >
                <Plus className="w-4 h-4 mr-2" /> Thêm mục
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
