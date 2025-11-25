import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import type z from "zod";
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
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "~/components/ui/form";
import { Input } from "~/components/ui/input";
import { Button } from "~/components/ui/button";
import { Textarea } from "~/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { DatePicker } from "~/components/ui/date-picker";
import { useCreateExpense } from "../container/query.hooks";
import { ExpenseSchema } from "~/services/api/expenses/expenses.schema";

const { CreateExpenseRequestSchema } = ExpenseSchema;
type CreateExpenseFormData = z.infer<typeof CreateExpenseRequestSchema>;

interface CreateExpenseDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const EXPENSE_CATEGORIES = [
  { value: "Procurement" as const, label: "Mua sắm" },
  { value: "Salary" as const, label: "Lương" },
  { value: "Utilities" as const, label: "Tiện ích" },
  { value: "Maintenance" as const, label: "Bảo trì" },
  { value: "Office" as const, label: "Văn phòng" },
  { value: "Marketing" as const, label: "Marketing" },
  { value: "Other" as const, label: "Khác" },
];

const PAYMENT_METHODS = [
  { value: "Cash" as const, label: "Tiền mặt" },
  { value: "BankTransfer" as const, label: "Chuyển khoản" },
  { value: "Card" as const, label: "Thẻ" },
  { value: "OTACollect" as const, label: "OTA thu hộ" },
  { value: "OTAPrepaid" as const, label: "OTA trả trước" },
  { value: "OnAccount" as const, label: "Ghi nợ" },
];

export default function CreateExpenseDialog({
  open,
  onOpenChange,
}: CreateExpenseDialogProps) {
  const { mutate: createExpense, isPending: isCreating } = useCreateExpense();

  const form = useForm<CreateExpenseFormData>({
    resolver: zodResolver(CreateExpenseRequestSchema),
    defaultValues: {
      category: "Procurement",
      amount: 0,
      expenseDate: new Date().toISOString().split("T")[0],
      description: "",
      paymentMethod: "Cash",
      receiptNumber: "",
    },
  });

  const onSubmit = (data: CreateExpenseFormData) => {
    createExpense(data, {
      onSuccess: () => {
        form.reset();
        onOpenChange(false);
      },
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Tạo chi phí mới</DialogTitle>
          <DialogDescription>
            Điền thông tin để ghi nhận khoản chi phí mới
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              {/* Category */}
              <FormField
                control={form.control}
                name="category"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Danh mục chi phí</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      value={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Chọn danh mục" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {EXPENSE_CATEGORIES.map((cat) => (
                          <SelectItem key={cat.value} value={cat.value}>
                            {cat.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Amount */}
              <FormField
                control={form.control}
                name="amount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Số tiền (VNĐ)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="0"
                        {...field}
                        onChange={(e) =>
                          field.onChange(parseFloat(e.target.value) || 0)
                        }
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              {/* Expense Date */}
              <FormField
                control={form.control}
                name="expenseDate"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Ngày chi</FormLabel>
                    <DatePicker
                      value={field.value}
                      onChange={(date) => {
                        if (date) {
                          field.onChange(date.toISOString().split("T")[0]);
                        }
                      }}
                    />
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Payment Method */}
              <FormField
                control={form.control}
                name="paymentMethod"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Phương thức thanh toán</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      value={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Chọn phương thức" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {PAYMENT_METHODS.map((method) => (
                          <SelectItem key={method.value} value={method.value}>
                            {method.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Receipt Number */}
            <FormField
              control={form.control}
              name="receiptNumber"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Số chứng từ</FormLabel>
                  <FormControl>
                    <Input placeholder="VD: HD001, CT123..." {...field} />
                  </FormControl>
                  <FormDescription>
                    Số hóa đơn hoặc chứng từ liên quan
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Description */}
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Mô tả chi tiết</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Nhập mô tả chi tiết về khoản chi này..."
                      className="min-h-[100px] resize-none"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Actions */}
            <div className="flex justify-end gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isCreating}
              >
                Hủy
              </Button>
              <Button type="submit" disabled={isCreating}>
                {isCreating ? "Đang tạo..." : "Tạo chi phí"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
