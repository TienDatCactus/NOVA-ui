import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog";
import { Button } from "~/components/ui/button";
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
import { Loader2 } from "lucide-react";
import type { PayrollItemDto } from "~/services/api/staff/staff-payroll/dto";
import { FormSchema } from "~/services/schema/forms.schema";
import { useApplyUnusedLeave } from "../container/query.hooks";
import type { z } from "zod";

const { ApplyUnusedLeaveFormSchema } = FormSchema;

type ApplyUnusedLeaveFormData = z.infer<typeof ApplyUnusedLeaveFormSchema>;

interface ApplyUnusedLeaveDialogProps {
  payroll: PayrollItemDto;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export default function ApplyUnusedLeaveDialog({
  payroll,
  open,
  onOpenChange,
  onSuccess,
}: ApplyUnusedLeaveDialogProps) {
  const form = useForm<ApplyUnusedLeaveFormData>({
    resolver: zodResolver(ApplyUnusedLeaveFormSchema),
    defaultValues: {
      mode: "PayOut",
    },
  });

  const applyMutation = useApplyUnusedLeave();

  const mode = form.watch("mode");

  const handleSubmit = form.handleSubmit((data) => {
    applyMutation.mutate(
      { id: payroll.payrollId, data },
      {
        onSuccess: () => {
          onSuccess?.();
          onOpenChange(false);
        },
      }
    );
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Áp dụng chế độ xử lý phép dư</DialogTitle>
          <DialogDescription>
            Nhân viên <strong>{payroll.staffName}</strong> còn{" "}
            <strong>{payroll.paidLeaveDaysRemaining} ngày phép</strong> chưa sử
            dụng
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={handleSubmit} className="space-y-4 py-4">
            <FormField
              control={form.control}
              name="mode"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Chọn chế độ xử lý</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Chọn chế độ" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="PayOut">Trả tiền phép dư</SelectItem>
                      <SelectItem value="CarryOver">
                        Cộng dồn sang tháng sau
                      </SelectItem>
                    </SelectContent>
                  </Select>
                  {mode === "PayOut" && (
                    <p className="text-xs text-muted-foreground animate-in fade-in slide-in-from-top-1 duration-200">
                      Quy đổi ngày phép thành tiền
                    </p>
                  )}
                  {mode === "CarryOver" && (
                    <p className="text-xs text-muted-foreground animate-in fade-in slide-in-from-top-1 duration-200">
                      Giữ lại cho kỳ tiếp theo
                    </p>
                  )}
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="rounded-lg bg-muted p-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Nhân viên:</span>
                <span className="font-medium">{payroll.staffName}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Mã NV:</span>
                <span className="font-mono">{payroll.staffCode}</span>
              </div>
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={applyMutation.isPending}
              >
                Hủy
              </Button>
              <Button type="submit" disabled={applyMutation.isPending}>
                {applyMutation.isPending && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                Áp dụng
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
