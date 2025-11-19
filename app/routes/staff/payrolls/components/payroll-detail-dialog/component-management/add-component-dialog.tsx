import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation } from "@tanstack/react-query";
import {
  Dialog,
  DialogContent,
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
import { Calendar } from "~/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "~/components/ui/popover";
import { StaffPayrollService } from "~/services/api/staff-payroll";
import { ComponentTypeConfig } from "~/services/api/staff-payroll/staff-payroll.type";
import { StaffPayrollSchema } from "~/services/schema/staff-payroll.schema";
import { toast } from "sonner";
import { CalendarIcon, Loader2 } from "lucide-react";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import { cn } from "~/lib/utils";
import {
  formatNumber,
  parseFormattedNumber,
  handleNumberInputChange,
} from "~/lib/format-number";

const { AddComponentFormSchema } = StaffPayrollSchema;

type FormValues = z.infer<typeof AddComponentFormSchema>;

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
  const [date, setDate] = useState<Date | undefined>(new Date());

  const form = useForm<FormValues>({
    resolver: zodResolver(AddComponentFormSchema),
    defaultValues: {
      type: "Bonus",
      title: "",
      amount: "",
      note: "",
      effectiveDate: format(new Date(), "yyyy-MM-dd"),
    },
  });

  const selectedType = form.watch("type");

  const mutation = useMutation({
    mutationFn: (data: FormValues) => {
      return StaffPayrollService.addComponent(payrollId, {
        type: data.type,
        title: data.title,
        amount: parseFormattedNumber(data.amount),
        note: data.note,
        effectiveDate: data.effectiveDate,
      });
    },
    onSuccess: () => {
      toast.success("Thêm component thành công");
      form.reset();
      onOpenChange(false);
      onSuccess?.();
    },
    onError: () => {
      toast.error("Không thể thêm component");
    },
  });

  const onSubmit = (data: FormValues) => {
    mutation.mutate(data);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Thêm phụ cấp / khấu trừ</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {/* Hàng 1: Loại + Tiêu đề */}
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Loại khoản <span className="text-destructive">*</span></FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger className="h-10">
                          <SelectValue>
                            {field.value && (() => {
                              const isDeductionType = ["Penalty", "Advance", "AdjustmentDecrease"].includes(field.value);
                              return (
                                <div className="flex items-center gap-2">
                                  <span className={`text-base font-bold ${
                                    isDeductionType ? "text-red-600" : "text-green-600"
                                  }`}>
                                    {isDeductionType ? "-" : "+"}
                                  </span>
                                  <span>{ComponentTypeConfig[field.value]?.label}</span>
                                </div>
                              );
                            })()}
                          </SelectValue>
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {Object.entries(ComponentTypeConfig).map(([key, config]) => {
                          const isDeductionType = ["Penalty", "Advance", "AdjustmentDecrease"].includes(key);
                          return (
                            <SelectItem key={key} value={key}>
                              <div className="flex items-center gap-2">
                                <span className={`text-base font-bold ${
                                  isDeductionType ? "text-red-600" : "text-green-600"
                                }`}>
                                  {isDeductionType ? "-" : "+"}
                                </span>
                                <span>{config.label}</span>
                              </div>
                            </SelectItem>
                          );
                        })}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tên khoản <span className="text-destructive">*</span></FormLabel>
                    <FormControl>
                      <Input
                        placeholder={ComponentTypeConfig[selectedType]?.label || "Nhập tiêu đề"}
                        className="h-10"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Hàng 2: Số tiền + Ngày hiệu lực */}
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="amount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Số tiền <span className="text-destructive">*</span></FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input
                          type="text"
                          placeholder="0"
                          className="pr-12 h-10"
                          value={field.value}
                          onChange={(e) => handleNumberInputChange(e, field.onChange)}
                        />
                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                          VNĐ
                        </span>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="effectiveDate"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Áp dụng từ ngày <span className="text-destructive">*</span></FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant="outline"
                            className={cn(
                              "w-full h-10 pl-3 text-left font-normal",
                              !date && "text-muted-foreground"
                            )}
                          >
                            {date ? (
                              format(date, "dd/MM/yyyy")
                            ) : (
                              <span>Chọn ngày</span>
                            )}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={date}
                          onSelect={(newDate) => {
                            setDate(newDate);
                            field.onChange(newDate ? format(newDate, "yyyy-MM-dd") : "");
                          }}
                          captionLayout="dropdown"
                          className="rounded-md border"
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Hàng 3: Ghi chú (full width) */}
            <FormField
              control={form.control}
              name="note"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Ghi chú</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Nhập ghi chú..."
                      className="resize-none"
                      rows={3}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Buttons */}
            <div className="flex justify-end gap-2 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={mutation.isPending}
              >
                Hủy
              </Button>
              <Button type="submit" disabled={mutation.isPending}>
                {mutation.isPending && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                Thêm
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
