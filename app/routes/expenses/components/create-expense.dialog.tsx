import { zodResolver } from "@hookform/resolvers/zod";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import {
  Banknote,
  CalendarIcon,
  CreditCard,
  FileText,
  Plus,
  Receipt,
  Tag,
} from "lucide-react";
import { useForm } from "react-hook-form";
import type z from "zod";

import { Button } from "~/components/ui/button";
import { DatePicker } from "~/components/ui/date-picker";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { Textarea } from "~/components/ui/textarea";
import { Separator } from "~/components/ui/separator";

import { useCreateExpense } from "../container/query.hooks";
import { ExpenseSchema } from "~/services/api/expenses/expenses.schema";
import { ExpenseCategories } from "~/services/api/expenses/expenses.types";
import { PAYMENT_METHODS } from "~/services/types/payment.types";

const { CreateExpenseRequestSchema } = ExpenseSchema;
type CreateExpenseFormData = z.infer<typeof CreateExpenseRequestSchema>;

interface CreateExpenseDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

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

  const handleClose = () => {
    form.reset();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] p-0 gap-0 bg-background">
        {/* === HEADER === */}
        <DialogHeader className="px-6 py-4 border-b shrink-0 flex flex-row items-start justify-between space-y-0">
          <div className="space-y-1">
            <DialogTitle className="text-xl flex items-center gap-2">
              <Receipt className="w-5 h-5 text-primary" />
              Ghi nhận chi phí
            </DialogTitle>
            <DialogDescription>
              Tạo phiếu chi mới cho các hoạt động vận hành.
            </DialogDescription>
          </div>
        </DialogHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="flex flex-col"
          >
            <div className="p-6 space-y-6">
              {/* 1. AMOUNT (HERO SECTION) */}
              <FormField
                control={form.control}
                name="amount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs uppercase font-bold text-muted-foreground tracking-wider">
                      Số tiền chi
                    </FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input
                          startAddon={
                            <Banknote className="h-5 w-5 text-primary" />
                          }
                          endAddon={
                            <span className=" font-semibold text-muted-foreground">
                              VND
                            </span>
                          }
                          type="number"
                          placeholder="0"
                          className="text-2xl h-12 font-bold" // Big input
                          {...field}
                          onChange={(e) =>
                            field.onChange(parseFloat(e.target.value) || 0)
                          }
                        />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* 2. CONTEXT ROW */}
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="category"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Danh mục</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                        value={field.value}
                      >
                        <FormControl>
                          <SelectTrigger className="pl-9 relative">
                            <Tag className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                            <SelectValue placeholder="Chọn danh mục" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {ExpenseCategories.map((cat) => (
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

                <FormField
                  control={form.control}
                  name="expenseDate"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>Ngày chi</FormLabel>
                      <div className="relative">
                        <div className="absolute left-2.5 top-2.5 z-10 pointer-events-none">
                          <CalendarIcon className="h-4 w-4 text-muted-foreground" />
                        </div>
                        <DatePicker
                          value={
                            field.value ? new Date(field.value) : undefined
                          }
                          onChange={(date) => {
                            if (date) {
                              // Fix timezone offset issue by formatting directly
                              field.onChange(format(date, "yyyy-MM-dd"));
                            }
                          }}
                          className="pl-9 w-full"
                        />
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <Separator />

              {/* 3. AUDIT TRAIL ROW */}
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="paymentMethod"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Thanh toán qua</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                        value={field.value}
                      >
                        <FormControl>
                          <SelectTrigger className="pl-9 relative">
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

                <FormField
                  control={form.control}
                  name="receiptNumber"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Số chứng từ (Ref)</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <FileText className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                          <Input
                            placeholder="VD: HD-001"
                            {...field}
                            className="pl-9 uppercase font-mono placeholder:normal-case"
                          />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* 4. DESCRIPTION */}
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Ghi chú / Diễn giải</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Chi tiết về khoản chi này..."
                        className="min-h-[80px] resize-none"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* === FOOTER === */}
            <DialogFooter className="p-6 pt-4 border-t bg-muted/5">
              <Button
                type="button"
                variant="outline"
                onClick={handleClose}
                disabled={isCreating}
              >
                Hủy bỏ
              </Button>
              <Button
                type="submit"
                disabled={isCreating}
                className="min-w-[120px]"
              >
                {isCreating ? (
                  "Đang lưu..."
                ) : (
                  <>
                    <Plus className="w-4 h-4 mr-2" /> Tạo phiếu chi
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
