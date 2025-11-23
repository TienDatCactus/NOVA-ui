import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Minus, Plus, PackageCheck } from "lucide-react";
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
import { Textarea } from "~/components/ui/textarea";
import { Badge } from "~/components/ui/badge";
import { useAdjustStock } from "../container/query.hooks";
import type { StockItemsListItemDto } from "~/services/api/stocks/items/dto";
import { Alert, AlertDescription, AlertTitle } from "~/components/ui/alert";
import { Separator } from "~/components/ui/separator";
import { Counter } from "~/components/ui/shadcn-io/button-group/advanced/counter";

interface QuickAdjustDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  item: StockItemsListItemDto;
}

const quickAdjustSchema = z.object({
  quantityDiff: z.number().refine((val) => val !== 0, {
    message: "Số lượng điều chỉnh không được bằng 0",
  }),
  reason: z.string().min(5, "Lý do phải có ít nhất 5 ký tự"),
});

type QuickAdjustFormData = z.infer<typeof quickAdjustSchema>;

export function QuickAdjustDialog({
  open,
  onOpenChange,
  item,
}: QuickAdjustDialogProps) {
  const { mutate: adjustStock, isPending } = useAdjustStock();

  const form = useForm<QuickAdjustFormData>({
    resolver: zodResolver(quickAdjustSchema),
    defaultValues: {
      quantityDiff: 0,
      reason: "",
    },
  });

  const quantityDiff = form.watch("quantityDiff");
  const currentStock = item.currentStock ?? 0;
  const newStock = currentStock + (quantityDiff || 0);
  const isIncrease = (quantityDiff || 0) > 0;
  const isDecrease = (quantityDiff || 0) < 0;

  const handleSubmit = (data: QuickAdjustFormData) => {
    adjustStock(
      {
        id: item.id,
        data: {
          quantityDiff: data.quantityDiff,
          reason: data.reason,
        },
      },
      {
        onSuccess: () => {
          form.reset();
          onOpenChange(false);
        },
      }
    );
  };

  const handleClose = () => {
    form.reset();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <PackageCheck className="h-5 w-5" />
            Điều chỉnh kho nhanh
          </DialogTitle>
          <DialogDescription>
            Điều chỉnh số lượng tồn kho cho hàng hóa. Thay đổi sẽ được áp dụng
            ngay lập tức.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Item Info */}
          <div className="rounded-lg border bg-muted/50 p-4 space-y-2">
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <p className="font-semibold">{item.name}</p>
                <p className="text-sm text-muted-foreground font-mono">
                  {item.code}
                </p>
              </div>
              <Badge variant={item.isActive ? "default" : "secondary"}>
                {item.isActive ? "Hoạt động" : "Ngừng"}
              </Badge>
            </div>

            <Separator />

            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-muted-foreground">
                  Tồn kho hiện tại
                </p>
                <p className="text-lg font-bold font-mono">
                  {currentStock}{" "}
                  <span className="text-sm font-normal text-muted-foreground">
                    {item.unitName}
                  </span>
                </p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Sau điều chỉnh</p>
                <p
                  className={`text-lg font-bold font-mono ${
                    isIncrease
                      ? "text-green-600"
                      : isDecrease
                        ? "text-orange-600"
                        : ""
                  }`}
                >
                  {newStock}{" "}
                  <span className="text-sm font-normal text-muted-foreground">
                    {item.unitName}
                  </span>
                </p>
              </div>
            </div>
          </div>

          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(handleSubmit)}
              className="space-y-4"
            >
              {/* Quantity Diff Input */}
              <FormField
                control={form.control}
                name="quantityDiff"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Số lượng điều chỉnh</FormLabel>
                    <FormControl>
                      <Counter {...field} minValue={-9999} />
                    </FormControl>
                    <FormDescription>
                      <div>
                        {newStock < 0 ? (
                          <p className="text-destructive text-sm">
                            Cảnh báo: Tồn kho sau điều chỉnh sẽ âm ({newStock}{" "}
                            {item.unitName})
                          </p>
                        ) : newStock >= 0 &&
                          item.minStock &&
                          newStock < item.minStock ? (
                          <p className="text-yellow-600 text-sm">
                            Lưu ý: Tồn kho sau điều chỉnh thấp hơn mức tối thiểu
                            ({item.minStock} {item.unitName})
                          </p>
                        ) : newStock > 0 &&
                          item.maxStock &&
                          newStock > item.maxStock ? (
                          <p className="text-orange-600 text-sm">
                            Tồn kho sau điều chỉnh vượt mức tối đa (
                            {item.maxStock} {item.unitName})
                          </p>
                        ) : (
                          "Số dương (+) để tăng kho, số âm (-) để giảm kho"
                        )}
                      </div>
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Reason Textarea */}
              <FormField
                control={form.control}
                name="reason"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Lý do điều chỉnh{" "}
                      <span className="text-destructive">*</span>
                    </FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Ví dụ: Hàng hỏng khi vận chuyển, kiểm kê phát hiện lệch, ..."
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      Ghi rõ lý do để dễ tra cứu lịch sử sau này
                    </FormDescription>
                    <FormMessage />
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
                  {isPending ? "Đang xử lý..." : "Xác nhận điều chỉnh"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </div>
      </DialogContent>
    </Dialog>
  );
}
