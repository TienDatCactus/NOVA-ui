import { zodResolver } from "@hookform/resolvers/zod";
import { Calculator, Minus, Plus, TextQuote } from "lucide-react";
import { useEffect, useMemo } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

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
import { Textarea } from "~/components/ui/textarea";
import { formatMoney } from "~/lib/utils";

const CustomServiceFormSchema = z.object({
  name: z.string().min(2, "Tên dịch vụ phải có ít nhất 2 ký tự"),
  description: z.string().optional(),
  unitPrice: z.number().min(0, "Đơn giá phải lớn hơn hoặc bằng 0"),
  quantity: z.number().int().min(1, "Số lượng phải lớn hơn hoặc bằng 1"),
});

type CustomServiceFormData = z.infer<typeof CustomServiceFormSchema>;

type CustomServiceDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: (service: {
    name: string;
    description?: string;
    unitPrice: number;
    quantity: number;
  }) => void;
};

export default function CustomServiceDialog({
  open,
  onOpenChange,
  onConfirm,
}: CustomServiceDialogProps) {
  // Form setup
  const form = useForm<CustomServiceFormData>({
    resolver: zodResolver(CustomServiceFormSchema),
    defaultValues: {
      name: "",
      description: "",
      unitPrice: 0,
      quantity: 1,
    },
  });

  const unitPrice = form.watch("unitPrice");
  const quantity = form.watch("quantity");

  // Computed
  const subtotal = useMemo(() => unitPrice * quantity, [unitPrice, quantity]);

  // Reset when opening
  useEffect(() => {
    if (open) {
      form.reset();
    }
  }, [open, form]);

  // Handlers
  const handleQuantityChange = (delta: number) => {
    const current = form.getValues("quantity");
    form.setValue("quantity", Math.max(1, current + delta));
  };

  const handleSubmit = (data: CustomServiceFormData) => {
    onConfirm({
      name: data.name.trim(),
      description: data.description?.trim() || undefined,
      unitPrice: data.unitPrice,
      quantity: data.quantity,
    });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[420px] p-0 gap-0 overflow-hidden">
        {/* HEADER */}
        <DialogHeader className="px-6 py-4 border-b bg-muted/10">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary shadow-sm ring-1 ring-primary/20">
              <Plus className="h-5 w-5 stroke-[2.5]" />
            </div>
            <div>
              <DialogTitle className="text-base font-semibold">
                Tạo Dịch Vụ Tùy Chỉnh
              </DialogTitle>
              <p className="text-xs text-muted-foreground">
                Thêm phí ngoài danh mục (Phụ thu, Tip, v.v.)
              </p>
            </div>
          </div>
        </DialogHeader>

        {/* BODY */}
        <div className="p-6 space-y-5">
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(handleSubmit)}
              className="space-y-5"
            >
              {/* 1. Name Input */}
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs font-semibold text-muted-foreground uppercase">
                      Tên dịch vụ
                    </FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        placeholder="VD: Phụ thu dọn dẹp..."
                        className="h-10"
                        autoFocus
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* 2. Price & Quantity Row */}
              <div className="grid grid-cols-2 gap-4">
                {/* Price */}
                <FormField
                  control={form.control}
                  name="unitPrice"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs font-semibold text-muted-foreground uppercase">
                        Đơn giá
                      </FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Input
                            type="number"
                            {...field}
                            onChange={(e) =>
                              field.onChange(Number(e.target.value))
                            }
                            placeholder="0"
                            className="pr-9 font-mono"
                            min="0"
                          />
                          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-medium text-muted-foreground pointer-events-none">
                            đ
                          </span>
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Quantity Stepper */}
                <FormField
                  control={form.control}
                  name="quantity"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs font-semibold text-muted-foreground uppercase">
                        Số lượng
                      </FormLabel>
                      <FormControl>
                        <div className="flex h-10 w-full items-center rounded-md border border-input bg-background">
                          <button
                            type="button"
                            onClick={() => handleQuantityChange(-1)}
                            className="flex h-full w-9 items-center justify-center text-muted-foreground hover:bg-muted hover:text-foreground disabled:opacity-50 transition-colors"
                            disabled={field.value <= 1}
                          >
                            <Minus className="h-3 w-3" />
                          </button>
                          <div className="flex-1 border-x border-input h-full flex items-center justify-center">
                            <span className="text-sm font-semibold font-mono">
                              {field.value}
                            </span>
                          </div>
                          <button
                            type="button"
                            onClick={() => handleQuantityChange(1)}
                            className="flex h-full w-9 items-center justify-center text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
                          >
                            <Plus className="h-3 w-3" />
                          </button>
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* 3. Description (Optional) */}
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs font-semibold text-muted-foreground uppercase flex items-center gap-1.5">
                      <TextQuote className="h-3 w-3" /> Ghi chú (Tùy chọn)
                    </FormLabel>
                    <FormControl>
                      <Textarea
                        {...field}
                        placeholder="Chi tiết thêm..."
                        className="resize-none h-16 text-sm"
                        maxLength={200}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* 4. Total Estimate Bar */}
              <div className="rounded-lg bg-muted/30 border border-dashed border-muted-foreground/20 p-3 flex justify-between items-center">
                <div className="flex items-center gap-2 text-muted-foreground text-xs">
                  <Calculator className="h-3.5 w-3.5" />
                  <span>Tạm tính:</span>
                </div>
                <div className="text-right">
                  <span className="font-mono font-bold text-lg text-primary">
                    {formatMoney(subtotal).vndFormatted}
                  </span>
                </div>
              </div>
            </form>
          </Form>
        </div>

        {/* FOOTER */}
        <DialogFooter className="px-6 py-4 bg-muted/5 border-t gap-2 sm:gap-0">
          <Button
            variant="ghost"
            onClick={() => onOpenChange(false)}
            className="h-10"
          >
            Hủy bỏ
          </Button>
          <Button
            onClick={form.handleSubmit(handleSubmit)}
            className="h-10 min-w-[120px] shadow-md"
          >
            Thêm vào đơn
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
