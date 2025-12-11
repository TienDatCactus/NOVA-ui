import { useEffect, useMemo } from "react";
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
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "~/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { Input } from "~/components/ui/input";
import { Textarea } from "~/components/ui/textarea";
import { Button } from "~/components/ui/button";
import { ComponentTypeConfig } from "~/services/api/staff/staff-payroll/staff-payroll.type";
import { FormSchema } from "~/services/schema/forms.schema";
import { useAddPayrollComponent } from "../../container/query.hooks";
import {
  Loader2,
  TrendingUp,
  TrendingDown,
  Banknote,
  AlignLeft,
} from "lucide-react";
import { cn, formatMoney } from "~/lib/utils";
import { Separator } from "~/components/ui/separator";

const { AddPayrollComponentFormSchema } = FormSchema;

type FormValues = z.infer<typeof AddPayrollComponentFormSchema>;

interface AddComponentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  payrollId: string;
  onSuccess?: () => void;
}

export default function AddComponentDialog({
  open,
  onOpenChange,
  payrollId,
  onSuccess,
}: AddComponentDialogProps) {
  const form = useForm<FormValues>({
    resolver: zodResolver(AddPayrollComponentFormSchema),
    defaultValues: {
      type: "Bonus",
      title: "",
      amount: 0,
      note: "",
    },
  });

  const selectedType = form.watch("type");
  const mutation = useAddPayrollComponent();

  // Helper: Xác định màu sắc và Icon dựa trên loại (Cộng/Trừ)
  const typeConfig = useMemo(() => {
    const isDeduction = ["Penalty", "Advance", "AdjustmentDecrease"].includes(
      selectedType
    );
    return {
      isDeduction,
      color: isDeduction ? "text-red-600" : "text-emerald-600",
      bgColor: isDeduction ? "bg-red-50" : "bg-emerald-50",
      borderColor: isDeduction
        ? "focus-within:ring-red-500"
        : "focus-within:ring-emerald-500",
      icon: isDeduction ? (
        <TrendingDown className="w-4 h-4" />
      ) : (
        <TrendingUp className="w-4 h-4" />
      ),
      prefix: isDeduction ? "-" : "+",
    };
  }, [selectedType]);

  // UX: Tự động fill Title nếu trống khi đổi Type
  useEffect(() => {
    const currentTitle = form.getValues("title");
    if (!currentTitle && selectedType) {
      // Chỉ gợi ý, không force
      // form.setValue("title", ComponentTypeConfig[selectedType]?.label || "");
    }
  }, [selectedType, form]);

  const onSubmit = (data: FormValues) => {
    mutation.mutate(
      { payrollId, data },
      {
        onSuccess: () => {
          form.reset();
          onOpenChange(false);
          onSuccess?.();
        },
      }
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg p-0 gap-0 overflow-hidden">
        {/* === HEADER === */}
        <DialogHeader className="px-6 py-4 border-b bg-muted/5">
          <div className="flex items-center gap-3">
            <div
              className={cn(
                "p-2 rounded-lg",
                typeConfig.bgColor,
                typeConfig.color
              )}
            >
              <Banknote className="w-5 h-5" />
            </div>
            <div>
              <DialogTitle className="text-lg">Điều chỉnh lương</DialogTitle>
              <DialogDescription className="mt-0.5">
                Thêm khoản phụ cấp hoặc khấu trừ mới
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="flex flex-col"
          >
            <div className="p-6 space-y-6">
              {/* 1. SELECTION GROUP */}
              <div className="space-y-4">
                <FormField
                  control={form.control}
                  name="type"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Phân loại</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger className="h-11">
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {Object.entries(ComponentTypeConfig).map(
                            ([key, config]) => {
                              const isDed = [
                                "Penalty",
                                "Advance",
                                "AdjustmentDecrease",
                              ].includes(key);
                              return (
                                <SelectItem key={key} value={key}>
                                  <div className="flex items-center gap-2.5">
                                    <div
                                      className={cn(
                                        "w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold border",
                                        isDed
                                          ? "border-red-200 bg-red-50 text-red-600"
                                          : "border-emerald-200 bg-emerald-50 text-emerald-600"
                                      )}
                                    >
                                      {isDed ? "-" : "+"}
                                    </div>
                                    <span className="font-medium">
                                      {config.label}
                                    </span>
                                  </div>
                                </SelectItem>
                              );
                            }
                          )}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="amount"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Số tiền (VNĐ)</FormLabel>
                      <FormControl>
                        <div
                          className={cn(
                            "relative group flex items-center border rounded-md overflow-hidden transition-all ring-offset-background",
                            typeConfig.borderColor
                          )}
                        >
                          {/* Visual Prefix */}
                          <div
                            className={cn(
                              "flex items-center justify-center w-12 h-12 bg-muted/20 border-r",
                              typeConfig.color
                            )}
                          >
                            {typeConfig.icon}
                          </div>

                          {/* Main Input */}
                          <Input
                            type="text"
                            placeholder="0"
                            className="border-0 focus-visible:ring-0 focus-visible:ring-offset-0 h-12 text-lg font-semibold font-mono px-4 shadow-none"
                            value={
                              field.value
                                ? formatMoney(field.value).vndFormatted
                                : ""
                            }
                            onChange={(e) => {
                              const rawValue = e.target.value.replace(
                                /[^0-9]/g,
                                ""
                              );
                              field.onChange(Number(rawValue));
                            }}
                          />

                          {/* Suffix */}
                          <div className="absolute right-4 text-sm text-muted-foreground font-medium pointer-events-none">
                            VNĐ
                          </div>
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <Separator />

              {/* 2. DETAILS GROUP */}
              <div className="space-y-4">
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        Tên khoản mục{" "}
                        <span className="text-destructive">*</span>
                      </FormLabel>
                      <FormControl>
                        <Input
                          placeholder={`Ví dụ: ${ComponentTypeConfig[selectedType]?.label || "..."}`}
                          className="h-10"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="note"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2">
                        <AlignLeft className="w-3.5 h-3.5 text-muted-foreground" />
                        Ghi chú
                      </FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Nhập lý do hoặc chi tiết bổ sung..."
                          className="resize-none min-h-[80px]"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* === FOOTER === */}
            <DialogFooter className="px-6 py-4 border-t bg-background shrink-0">
              <Button
                type="button"
                variant="ghost"
                onClick={() => onOpenChange(false)}
                disabled={mutation.isPending}
              >
                Hủy bỏ
              </Button>
              <Button
                type="submit"
                disabled={mutation.isPending}
                className={cn(
                  "min-w-[120px]",
                  typeConfig.isDeduction
                    ? "bg-red-600 hover:bg-red-700"
                    : "bg-primary"
                )}
              >
                {mutation.isPending ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : typeConfig.isDeduction ? (
                  "Xác nhận trừ"
                ) : (
                  "Xác nhận thêm"
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
