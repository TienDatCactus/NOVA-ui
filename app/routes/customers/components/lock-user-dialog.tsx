import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { format, addDays, addWeeks, addMonths } from "date-fns";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "~/components/ui/dialog";
import { Button } from "~/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "~/components/ui/form";
import { Calendar } from "~/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "~/components/ui/popover";
import { Lock, Unlock, Loader2, Calendar as CalendarIcon, AlertTriangle } from "lucide-react";
import { useLockUser, useUnlockUser } from "../container/useCustomers.hooks";
import type { CustomerItem } from "~/services/api/customer/dto";
import { cn } from "~/lib/utils";
import { Separator } from "~/components/ui/separator";

interface LockUserDialogProps {
  customer: CustomerItem;
  open: boolean;
  onClose: () => void;
  mode: "lock" | "unlock";
}

const LockUserSchema = z.object({
  lockUntil: z.date({
    message: "Vui lòng chọn thời gian khóa",
  }),
});

type LockUserForm = z.infer<typeof LockUserSchema>;

const QUICK_LOCK_OPTIONS = [
  { label: "1 ngày", days: 1, getValue: () => addDays(new Date(), 1) },
  { label: "3 ngày", days: 3, getValue: () => addDays(new Date(), 3) },
  { label: "1 tuần", days: 7, getValue: () => addWeeks(new Date(), 1) },
  { label: "1 tháng", days: 30, getValue: () => addMonths(new Date(), 1) },
  { label: "3 tháng", days: 90, getValue: () => addMonths(new Date(), 3) },
  { label: "6 tháng", days: 180, getValue: () => addMonths(new Date(), 6) },
];

export function LockUserDialog({
  customer,
  open,
  onClose,
  mode,
}: LockUserDialogProps) {
  const { mutate: lockUser, isPending: isLocking } = useLockUser();
  const { mutate: unlockUser, isPending: isUnlocking } = useUnlockUser();
  const [calendarOpen, setCalendarOpen] = useState(false);

  const form = useForm<LockUserForm>({
    resolver: zodResolver(LockUserSchema),
    defaultValues: {
      lockUntil: addDays(new Date(), 7), // Default 7 days
    },
  });

  const isPending = isLocking || isUnlocking;

  const handleLock = (data: LockUserForm) => {
    const lockUntilISO = data.lockUntil.toISOString();

    lockUser(
      {
        id: customer.id,
        data: { lockUntil: lockUntilISO },
      },
      {
        onSuccess: () => {
          form.reset();
          onClose();
        },
      }
    );
  };

  const handleUnlock = () => {
    unlockUser(customer.id, {
      onSuccess: () => {
        onClose();
      },
    });
  };

  const handleQuickLock = (date: Date) => {
    form.setValue("lockUntil", date);
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-2xl flex items-center gap-3">
            <div
              className={cn(
                "p-2 rounded-lg",
                mode === "lock" ? "bg-destructive/10" : "bg-green-50"
              )}
            >
              {mode === "lock" ? (
                <Lock className="h-5 w-5 text-destructive" />
              ) : (
                <Unlock className="h-5 w-5 text-green-600" />
              )}
            </div>
            {mode === "lock" ? "Khóa tài khoản" : "Mở khóa tài khoản"}
          </DialogTitle>
          <DialogDescription>
            {mode === "lock"
              ? `Tài khoản của ${customer.fullName} sẽ bị khóa cho đến thời gian bạn chọn`
              : `Bạn có chắc muốn mở khóa tài khoản của ${customer.fullName}?`}
          </DialogDescription>
        </DialogHeader>

        {mode === "lock" ? (
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleLock)} className="space-y-6 py-4">
              {/* User Info */}
              <div className="p-4 bg-muted/30 rounded-lg space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Người dùng:</span>
                  <span className="font-semibold">{customer.fullName}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Email:</span>
                  <span className="text-sm">{customer.email}</span>
                </div>
              </div>

              <Separator />

              <FormField
                control={form.control}
                name="lockUntil"
                render={({ field }) => (
                  <FormItem className="flex flex-col space-y-4">
                    {/* Quick Lock Options */}
                    <div className="space-y-3">
                      <FormLabel>Chọn nhanh thời gian khóa</FormLabel>
                      <div className="grid grid-cols-3 gap-2">
                        {QUICK_LOCK_OPTIONS.map((option) => {
                          const optionDate = option.getValue();
                          const isSelected = field.value && 
                            Math.abs(field.value.getTime() - optionDate.getTime()) < 1000;
                          
                          return (
                            <Button
                              key={option.label}
                              type="button"
                              variant={isSelected ? "default" : "outline"}
                              onClick={() => handleQuickLock(option.getValue())}
                              className={cn(
                                "text-sm",
                                isSelected && "ring-2 ring-primary ring-offset-2"
                              )}
                            >
                              {option.label}
                            </Button>
                          );
                        })}
                      </div>
                    </div>

                    <Separator />

                    {/* Calendar Picker */}
                    <div className="space-y-3">
                      <FormLabel>Hoặc chọn ngày cụ thể</FormLabel>
                      <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant="outline"
                              className={cn(
                                "w-full pl-3 text-left font-normal",
                                !field.value && "text-muted-foreground"
                              )}
                            >
                              {field.value ? (
                                format(field.value, "dd/MM/yyyy HH:mm")
                              ) : (
                                <span>Chọn ngày khóa</span>
                              )}
                              <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={field.value}
                            onSelect={(date) => {
                              if (date) {
                                field.onChange(date);
                                setCalendarOpen(false);
                              }
                            }}
                            disabled={(date) => date < new Date()}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                      <FormDescription className="flex items-start gap-2">
                        <AlertTriangle className="h-4 w-4 text-amber-500 mt-0.5 flex-shrink-0" />
                        <span className="text-xs">
                          Tài khoản sẽ tự động mở khóa vào{" "}
                          <span className="font-semibold text-foreground">
                            {format(field.value, "dd/MM/yyyy HH:mm")}
                          </span>
                        </span>
                      </FormDescription>
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <DialogFooter className="gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={onClose}
                  disabled={isPending}
                >
                  Hủy
                </Button>
                <Button
                  type="submit"
                  disabled={isPending}
                  variant="destructive"
                  className="gap-2"
                >
                  {isPending && <Loader2 className="h-4 w-4 animate-spin" />}
                  <Lock className="h-4 w-4" />
                  Khóa tài khoản
                </Button>
              </DialogFooter>
            </form>
          </Form>
        ) : (
          <div className="space-y-6 py-4">
            {/* User Info */}
            <div className="p-4 bg-green-50 border border-green-200 rounded-lg space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Người dùng:</span>
                <span className="font-semibold">{customer.fullName}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Email:</span>
                <span className="text-sm">{customer.email}</span>
              </div>
              {customer.lockoutEnd && (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Khóa đến:</span>
                  <span className="text-sm font-semibold text-destructive">
                    {format(new Date(customer.lockoutEnd), "dd/MM/yyyy HH:mm")}
                  </span>
                </div>
              )}
            </div>

            <div className="flex items-start gap-3 p-4 bg-amber-50 border border-amber-200 rounded-lg">
              <AlertTriangle className="h-5 w-5 text-amber-600 mt-0.5 flex-shrink-0" />
              <div className="text-sm text-amber-800">
                <p className="font-semibold mb-1">Lưu ý</p>
                <p>
                  Sau khi mở khóa, người dùng sẽ có thể đăng nhập và sử dụng hệ thống ngay lập
                  tức.
                </p>
              </div>
            </div>

            <DialogFooter className="gap-2">
              <Button type="button" variant="outline" onClick={onClose} disabled={isPending}>
                Hủy
              </Button>
              <Button
                type="button"
                onClick={handleUnlock}
                disabled={isPending}
                className="gap-2 bg-green-600 hover:bg-green-700"
              >
                {isPending && <Loader2 className="h-4 w-4 animate-spin" />}
                <Unlock className="h-4 w-4" />
                Mở khóa tài khoản
              </Button>
            </DialogFooter>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
