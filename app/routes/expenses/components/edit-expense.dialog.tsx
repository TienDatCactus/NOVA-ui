import { zodResolver } from "@hookform/resolvers/zod";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import {
  Banknote,
  CalendarIcon,
  CreditCard,
  FileText,
  Receipt,
  Save,
  Tag,
  AlignLeft,
  X,
} from "lucide-react";
import { useEffect } from "react";
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
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "~/components/ui/form";
import { Input } from "~/components/ui/input";
import { Textarea } from "~/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { DatePicker } from "~/components/ui/date-picker";
import { Separator } from "~/components/ui/separator";
import { cn } from "~/lib/utils";

import { useExpenseDetail, useUpdateExpense } from "../container/query.hooks";
import { ExpenseSchema } from "~/services/api/expenses/expenses.schema";

const { UpdateExpenseRequestSchema } = ExpenseSchema;
type UpdateExpenseFormData = z.infer<typeof UpdateExpenseRequestSchema>;

interface EditExpenseDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  expenseId: string;
}

// Constants moved outside for performance & clarity
const EXPENSE_CATEGORIES = [
  { value: "Procurement", label: "Mua sắm" },
  { value: "Salary", label: "Lương" },
  { value: "Utilities", label: "Tiện ích" },
  { value: "Maintenance", label: "Bảo trì" },
  { value: "Office", label: "Văn phòng" },
  { value: "Marketing", label: "Marketing" },
  { value: "Other", label: "Khác" },
] as const;

const PAYMENT_METHODS = [
  { value: "Cash", label: "Tiền mặt" },
  { value: "BankTransfer", label: "Chuyển khoản" },
  { value: "Card", label: "Thẻ" },
  { value: "OTACollect", label: "OTA thu hộ" },
  { value: "OTAPrepaid", label: "OTA trả trước" },
  { value: "OnAccount", label: "Ghi nợ" },
] as const;

export default function EditExpenseDialog({
  open,
  onOpenChange,
  expenseId,
}: EditExpenseDialogProps) {
  // --- Queries & Mutations ---
  const { data: expense, isPending: isLoading } = useExpenseDetail(expenseId, {
    enabled: open,
  });
  const { mutate: updateExpense, isPending: isUpdating } = useUpdateExpense();

  // --- Form Setup ---
  const form = useForm<UpdateExpenseFormData>({
    resolver: zodResolver(UpdateExpenseRequestSchema),
    mode: "onChange",
    defaultValues: {
      category: "Procurement",
      amount: 0,
      expenseDate: "",
      description: "",
      paymentMethod: "Cash",
      receiptNumber: "",
    },
  });

  // --- Sync Data ---
  useEffect(() => {
    if (expense) {
      form.reset({
        category: expense.category,
        amount: expense.amount,
        expenseDate: expense.expenseDate, // Ensure this is ISO string or Date object compatible
        description: expense.description || "",
        paymentMethod: expense.paymentMethod,
        receiptNumber: expense.receiptNumber || "",
      });
    }
  }, [expense, form]);

  // --- Handlers ---
  const onSubmit = (data: UpdateExpenseFormData) => {
    updateExpense({ id: expenseId, data }, { onSuccess: () => handleClose() });
  };

  const handleClose = () => {
    form.reset();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[600px] p-0 gap-0 bg-background">
        {/* === HEADER === */}
        <DialogHeader className="px-6 py-4 border-b shrink-0 flex flex-row items-start justify-between space-y-0 bg-muted/5">
          <div className="space-y-1">
            <DialogTitle className="text-xl flex items-center gap-2">
              <Receipt className="w-5 h-5 text-primary" />
              Chỉnh sửa phiếu chi
            </DialogTitle>
            <DialogDescription>
              Cập nhật thông tin khoản chi phí #{expenseId.slice(0, 8)}...
            </DialogDescription>
          </div>

          {/* Close Button (Optional, DialogContent usually has one, but can be customized) */}
        </DialogHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="flex flex-col"
          >
            {/* === BODY === */}
            <div className="p-6 space-y-6">
              {/* 1. HERO SECTION: AMOUNT & CATEGORY */}
              <div className="space-y-4">
                <div className="grid grid-cols-3 gap-4">
                  {/* Category - Takes up 1/3 */}
                  <FormField
                    control={form.control}
                    name="category"
                    render={({ field }) => (
                      <FormItem className="col-span-1">
                        <FormLabel>Danh mục</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          value={field.value}
                        >
                          <FormControl>
                            <SelectTrigger className="pl-9 w-40 relative">
                              <Tag className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                              <SelectValue placeholder="Chọn loại" />
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

                  {/* Amount - Takes up 2/3, Hero Style */}
                  <FormField
                    control={form.control}
                    name="amount"
                    render={({ field }) => (
                      <FormItem className="col-span-2">
                        <FormLabel>
                          Số tiền chi{" "}
                          <span className="text-destructive">*</span>
                        </FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Banknote className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-primary" />
                            <Input
                              type="number"
                              placeholder="0"
                              className="pl-10 pr-12 h-10 text-lg font-bold text-right font-mono"
                              {...field}
                              onChange={(e) =>
                                field.onChange(parseFloat(e.target.value) || 0)
                              }
                            />
                            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-muted-foreground">
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

              <Separator />

              {/* 2. DETAILS GRID */}
              <div className="grid grid-cols-2 gap-4">
                {/* Date */}
                <FormField
                  control={form.control}
                  name="expenseDate"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>Ngày ghi nhận</FormLabel>
                      <div className="relative w-full">
                        <div className="absolute left-2.5 top-2.5 z-10 pointer-events-none text-muted-foreground">
                          <CalendarIcon className="h-4 w-4" />
                        </div>
                        <DatePicker
                          value={
                            field.value ? new Date(field.value) : undefined
                          }
                          onChange={(date) => {
                            if (date)
                              field.onChange(date.toISOString().split("T")[0]);
                          }}
                          className="pl-9 w-full"
                        />
                      </div>
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
                      <FormLabel>Hình thức TT</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value}
                      >
                        <FormControl>
                          <SelectTrigger className="pl-9 w-40 relative">
                            <CreditCard className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
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

                {/* Receipt Number */}
                <FormField
                  control={form.control}
                  name="receiptNumber"
                  render={({ field }) => (
                    <FormItem className="col-span-2">
                      <FormLabel>Số chứng từ / Hóa đơn (Ref)</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <FileText className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                          <Input
                            placeholder="VD: HD-00123"
                            className="pl-9 font-mono uppercase placeholder:normal-case"
                            {...field}
                          />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* 3. DESCRIPTION */}
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2">
                      <AlignLeft className="w-3.5 h-3.5" /> Diễn giải chi tiết
                    </FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Ghi chú về mục đích khoản chi..."
                        className="min-h-[100px] resize-none bg-muted/5"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* === FOOTER === */}
            <DialogFooter className="p-6 pt-4 border-t bg-muted/5 sm:justify-between items-center">
              <Button
                type="button"
                variant="outline"
                onClick={handleClose}
                disabled={isUpdating}
                className="w-full sm:w-auto"
              >
                <X className="w-4 h-4 mr-2" /> Hủy bỏ
              </Button>
              <Button
                type="submit"
                disabled={isUpdating}
                className="w-full sm:w-auto min-w-[140px]"
              >
                {isUpdating ? (
                  "Đang lưu..."
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-2" /> Cập nhật
                  </>
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
