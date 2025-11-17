import { useEffect, useState } from "react";
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
import type { PayrollComponent } from "~/services/api/staff-payroll/dto";
import { ComponentTypeConfig } from "~/services/api/staff-payroll/staff-payroll.type";
import { StaffPayrollSchema } from "~/services/schema/staff-payroll.schema";
import { toast } from "sonner";
import { CalendarIcon, Loader2 } from "lucide-react";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import { cn } from "~/lib/utils";

const { AddComponentFormSchema } = StaffPayrollSchema;

type FormValues = z.infer<typeof AddComponentFormSchema>;

interface EditComponentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  payrollId: string;
  component: PayrollComponent | null;
  onSuccess?: () => void;
}

export default function EditComponentDialog({
  open,
  onOpenChange,
  payrollId,
  component,
  onSuccess,
}: EditComponentDialogProps) {
  const [date, setDate] = useState<Date | undefined>(new Date());

  const form = useForm<FormValues>({
    resolver: zodResolver(AddComponentFormSchema),
    defaultValues: {
      type: "Bonus",
      title: "",
      amount: "",
      note: "",
      effectiveDate: "",
    },
  });

  const selectedType = form.watch("type");

  useEffect(() => {
    if (component) {
      setDate(undefined);
      form.reset({
        type: component.type as any,
        title: component.title,
        amount: component.amount.toString(),
        note: component.note || "",
        effectiveDate: "",
      });
    }
  }, [component, form]);

  const mutation = useMutation({
    mutationFn: (data: FormValues) => {
      if (!component) return Promise.reject("No component selected");
      return StaffPayrollService.updateComponent(component.componentId, {
        type: data.type,
        title: data.title,
        amount: Number(data.amount),
        note: data.note,
        effectiveDate: data.effectiveDate,
      });
    },
    onSuccess: () => {
      toast.success("Cập nhật component thành công");
      onOpenChange(false);
      onSuccess?.();
    },
    onError: () => {
      toast.error("Không thể cập nhật component");
    },
  });

  const onSubmit = (data: FormValues) => {
    mutation.mutate(data);
  };

  if (!component) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Chỉnh sửa phụ cấp / khấu trừ</DialogTitle>
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
                    <FormLabel>Loại</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger 
                          className="h-10" 
                        >
                          <SelectValue/>
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {Object.entries(ComponentTypeConfig).map(([key, config]) => (
                          <SelectItem key={key} value={key}>
                            {config.label}
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
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tiêu đề</FormLabel>
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
                    <FormLabel>Số tiền</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input
                          type="number"
                          placeholder="0"
                          className="pr-12 h-10"
                          {...field}
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
                  <FormItem>
                    <FormLabel>Ngày hiệu lực</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant="outline"
                            className={cn(
                              "w-full pl-3 text-left font-normal h-10",
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
                          initialFocus
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
                  <FormLabel>Ghi chú (không bắt buộc)</FormLabel>
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
                Lưu
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
