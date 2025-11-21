import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Plus, Save, Trash2 } from "lucide-react";
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
import { Textarea } from "~/components/ui/textarea";
import { Button } from "~/components/ui/button";
import { Separator } from "~/components/ui/separator";
import { Badge } from "~/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { useCreateStockAdjustment } from "../container/query.hooks";
import { StockAdjustmentsSchemas } from "~/services/api/stocks/stock-adjustments/stock-adjustments.schema";
import type { CreateStockAdjustmentDto } from "~/services/api/stocks/stock-adjustments/dto";
import { useStockItemList } from "../../items/container/query.hooks";

interface CreateStockAdjustmentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function CreateStockAdjustmentDialog({
  open,
  onOpenChange,
}: CreateStockAdjustmentDialogProps) {
  const { data: stockItems = [] } = useStockItemList({
    includeInactive: false,
  });

  const { mutate: onCreate, isPending: isSubmitting } =
    useCreateStockAdjustment();

  const form = useForm<CreateStockAdjustmentDto>({
    resolver: zodResolver(StockAdjustmentsSchemas.CreateStockAdjustmentSchema),
    defaultValues: {
      reason: "",
      items: [
        {
          itemId: "",
          quantityDiff: 0,
          note: "",
        },
      ],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "items",
  });

  const handleSubmit = (data: CreateStockAdjustmentDto) => {
    onCreate(data, {
      onSuccess: () => {
        form.reset();
        onOpenChange(false);
      },
    });
  };

  const addItem = () => {
    append({
      itemId: "",
      quantityDiff: 0,
      note: "",
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl max-h-[90vh] p-2">
        <DialogHeader className="px-4 pt-4">
          <DialogTitle>Tạo phiếu điều chỉnh kho</DialogTitle>
          <DialogDescription>
            Thêm các hàng hóa cần điều chỉnh. Số lượng âm (-) để giảm, dương (+)
            để tăng.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            className="space-y-6 overflow-y-auto max-h-[70vh] px-4 pb-4"
          >
            {/* Reason */}
            <FormField
              control={form.control}
              name="reason"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Lý do điều chỉnh
                    <span className="text-destructive ml-1">*</span>
                  </FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="VD: Kiểm kê tháng 11 - phát hiện thiếu hàng"
                      className="resize-none"
                      rows={2}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Separator />

            {/* Items List */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-sm">
                  Danh sách hàng hóa điều chỉnh
                </h3>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={addItem}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Thêm hàng hóa
                </Button>
              </div>

              <div className="space-y-4">
                {fields.map((field, index) => (
                  <div
                    key={field.id}
                    className="border rounded-lg p-4 space-y-4 relative"
                  >
                    <div className="flex items-center justify-between">
                      <Badge variant="outline">#{index + 1}</Badge>
                      {fields.length > 1 && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => remove(index)}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      )}
                    </div>

                    <div className="grid gap-4 md:grid-cols-3">
                      {/* Item Select */}
                      <FormField
                        control={form.control}
                        name={`items.${index}.itemId`}
                        render={({ field: itemField }) => (
                          <FormItem>
                            <FormLabel>
                              Hàng hóa
                              <span className="text-destructive ml-1">*</span>
                            </FormLabel>
                            <Select
                              onValueChange={itemField.onChange}
                              value={itemField.value}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Chọn hàng hóa" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {stockItems.map((item) => (
                                  <SelectItem key={item.id} value={item.id}>
                                    {item.code} - {item.name}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      {/* Quantity Diff */}
                      <FormField
                        control={form.control}
                        name={`items.${index}.quantityDiff`}
                        render={({ field: qtyField }) => (
                          <FormItem>
                            <FormLabel>
                              Số lượng điều chỉnh
                              <span className="text-destructive ml-1">*</span>
                            </FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                placeholder="-5 hoặc +10"
                                {...qtyField}
                                onChange={(e) =>
                                  qtyField.onChange(
                                    parseFloat(e.target.value) || 0
                                  )
                                }
                              />
                            </FormControl>
                            <p className="text-xs text-muted-foreground mt-1">
                              Âm (-) để giảm, Dương (+) để tăng
                            </p>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      {/* Note */}
                      <FormField
                        control={form.control}
                        name={`items.${index}.note`}
                        render={({ field: noteField }) => (
                          <FormItem>
                            <FormLabel>Ghi chú</FormLabel>
                            <FormControl>
                              <Input
                                placeholder="VD: Hàng hỏng"
                                {...noteField}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </form>
        </Form>

        <DialogFooter className="px-4 pb-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isSubmitting}
          >
            Hủy
          </Button>
          <Button
            type="submit"
            onClick={form.handleSubmit(handleSubmit)}
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Đang tạo...
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                Tạo phiếu
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
