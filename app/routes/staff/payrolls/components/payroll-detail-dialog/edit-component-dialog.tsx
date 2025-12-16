import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "~/components/ui/button";
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
import { Input } from "~/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { Textarea } from "~/components/ui/textarea";
import type { PayrollComponentDto } from "~/services/api/staff/staff-payroll/dto";
import { ComponentTypeConfig } from "~/services/api/staff/staff-payroll/staff-payroll.type";
import { FormSchema } from "~/services/schema/forms.schema";
import { useUpdatePayrollComponent } from "../../container/query.hooks";

const { AddPayrollComponentFormSchema } = FormSchema;

type FormValues = z.infer<typeof AddPayrollComponentFormSchema>;

interface EditComponentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  payrollId: string;
  component: PayrollComponentDto | null;
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

  const form = useForm({
    resolver: zodResolver(AddPayrollComponentFormSchema),
    defaultValues: {
      type: "Bonus",
      title: "",
      amount: 0,
      note: "",
    },
  });

  const selectedType = form.watch("type");

  useEffect(() => {
    if (component) {
      setDate(undefined);
      form.reset({
        type: component.type as any,
        title: component.title,
        amount: component.amount,
        note: component.note || "",
      });
    }
  }, [component, form]);

  const mutation = useUpdatePayrollComponent();

  const onSubmit = (data: FormValues) => {
    if (!component) return;
    mutation.mutate(
      { componentId: component.componentId, data, payrollId },
      {
        onSuccess: () => {
          onOpenChange(false);
          onSuccess?.();
        },
      }
    );
  };

  if (!component) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle>Chỉnh sửa phụ cấp / khấu trừ</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Loại khoản</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger className="h-10">
                        <SelectValue>
                          {field.value &&
                            (() => {
                              const isDeductionType = [
                                "Penalty",
                                "Advance",
                                "AdjustmentDecrease",
                              ].includes(field.value);
                              return (
                                <div className="flex items-center gap-2">
                                  <span
                                    className={`text-base font-bold ${
                                      isDeductionType
                                        ? "text-red-600"
                                        : "text-green-600"
                                    }`}
                                  >
                                    {isDeductionType ? "-" : "+"}
                                  </span>
                                  <span>
                                    {ComponentTypeConfig[field.value]?.label}
                                  </span>
                                </div>
                              );
                            })()}
                        </SelectValue>
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {Object.entries(ComponentTypeConfig).map(
                        ([key, config]) => {
                          const isDeductionType = [
                            "Penalty",
                            "Advance",
                            "AdjustmentDecrease",
                          ].includes(key);
                          return (
                            <SelectItem key={key} value={key}>
                              <div className="flex items-center gap-2">
                                <span
                                  className={`text-base font-bold ${
                                    isDeductionType
                                      ? "text-red-600"
                                      : "text-green-600"
                                  }`}
                                >
                                  {isDeductionType ? "-" : "+"}
                                </span>
                                <span>{config.label}</span>
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

            {/* Hàng 2: Số tiền + Ngày hiệu lực */}
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tên khoản</FormLabel>
                    <FormControl>
                      <Input
                        placeholder={
                          ComponentTypeConfig[selectedType]?.label ||
                          "Nhập tiêu đề"
                        }
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
                name="amount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Số tiền</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input
                          type="number"
                          placeholder="0"
                          value={field.value}
                          onChange={(e) =>
                            field.onChange(e.target.valueAsNumber)
                          }
                          endAddon={
                            <span className="text-sm text-muted-foreground">
                              VND
                            </span>
                          }
                        />
                      </div>
                    </FormControl>
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
                Lưu
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
