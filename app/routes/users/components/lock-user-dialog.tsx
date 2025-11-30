import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { format, addDays, addWeeks, addMonths, isBefore } from "date-fns";
import { vi } from "date-fns/locale"; // Assuming you have locale, optional
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
} from "~/components/ui/form";
import { Calendar } from "~/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "~/components/ui/popover";
import {
  Lock,
  Unlock,
  Loader2,
  Calendar as CalendarIcon,
  AlertTriangle,
  Clock,
  UserX,
  CheckCircle2,
} from "lucide-react";
import { useLockUser, useUnlockUser } from "../container/query.hooks";
import type { UserItem } from "~/services/api/user/dto";
import { cn } from "~/lib/utils";
import { Separator } from "~/components/ui/separator";
import { Badge } from "~/components/ui/badge";

interface LockUserDialogProps {
  user: UserItem;
  open: boolean;
  onClose: () => void;
  mode: "lock" | "unlock";
  onSuccess?: () => void;
}

const LockUserSchema = z.object({
  lockUntil: z.date("Vui lòng chọn thời gian khóa"),
});

type LockUserForm = z.infer<typeof LockUserSchema>;

// Quick options configuration
const PRESET_OPTIONS = [
  { label: "1 Ngày", duration: "24h", getValue: () => addDays(new Date(), 1) },
  { label: "3 Ngày", duration: "72h", getValue: () => addDays(new Date(), 3) },
  {
    label: "1 Tuần",
    duration: "7 ngày",
    getValue: () => addWeeks(new Date(), 1),
  },
  {
    label: "1 Tháng",
    duration: "30 ngày",
    getValue: () => addMonths(new Date(), 1),
  },
  {
    label: "Vĩnh viễn",
    duration: "100 năm",
    getValue: () => addMonths(new Date(), 1200),
  }, // "Permanent" logic
];

export function LockUserDialog({
  user,
  open,
  onClose,
  mode,
  onSuccess,
}: LockUserDialogProps) {
  const { mutate: lockUser, isPending: isLocking } = useLockUser();
  const { mutate: unlockUser, isPending: isUnlocking } = useUnlockUser();

  // Track if user picked a custom date to highlight UI correctly
  const [isCustomDate, setIsCustomDate] = useState(false);

  const form = useForm<LockUserForm>({
    resolver: zodResolver(LockUserSchema),
    defaultValues: {
      lockUntil: addDays(new Date(), 7),
    },
  });

  // Reset form when dialog opens (avoids infinite loop)
  useEffect(() => {
    if (open && mode === "lock") {
      form.reset({ lockUntil: addDays(new Date(), 7) });
      setIsCustomDate(false);
    }
  }, [open, mode, form]);

  const isPending = isLocking || isUnlocking;

  const handleLock = (data: LockUserForm) => {
    // Safety check: Prevent locking in the past
    if (isBefore(data.lockUntil, new Date())) {
      form.setError("lockUntil", {
        message: "Thời gian khóa phải lớn hơn hiện tại",
      });
      return;
    }

    lockUser(
      {
        id: user.id,
        data: { lockUntil: data.lockUntil.toISOString() },
      },
      {
        onSuccess: () => {
          onClose();
          onSuccess?.();
        },
      }
    );
  };

  const handleUnlock = () => {
    unlockUser(user.id, {
      onSuccess: () => {
        onClose();
        onSuccess?.();
      },
    });
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md p-0 gap-0 overflow-hidden">
        {/* HEADER */}
        <DialogHeader className={cn("px-6 py-4 border-b bg-muted")}>
          <DialogTitle className="flex items-center gap-2.5 text-xl">
            {mode === "lock" ? (
              <span className="text-red-950">Khóa tài khoản</span>
            ) : (
              <span className="text-green-950">Mở khóa tài khoản</span>
            )}
          </DialogTitle>
          <DialogDescription>
            Thao tác với người dùng{" "}
            <span className="font-semibold text-foreground">
              {user.fullName}
            </span>
          </DialogDescription>
        </DialogHeader>

        {mode === "lock" ? (
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(handleLock)}
              className="flex flex-col"
            >
              <div className="p-6 space-y-6">
                {/* 1. PRESET GRID */}
                <div className="space-y-3">
                  <FormLabel className="text-xs font-bold text-muted-foreground uppercase">
                    Chọn thời gian khóa
                  </FormLabel>
                  <div className="grid grid-cols-3 gap-2">
                    {PRESET_OPTIONS.map((option) => {
                      const optionDate = option.getValue();
                      // Check if selected by comparing timestamps (ignoring milliseconds slightly)
                      const currentValue = form.getValues("lockUntil");
                      const isSelected =
                        !isCustomDate &&
                        currentValue &&
                        Math.abs(
                          currentValue.getTime() - optionDate.getTime()
                        ) < 5000;

                      return (
                        <div
                          key={option.label}
                          onClick={() => {
                            form.setValue("lockUntil", option.getValue());
                            setIsCustomDate(false);
                          }}
                          className={cn(
                            "cursor-pointer rounded-lg border p-3 flex flex-col items-center justify-center gap-1 transition-all hover:bg-muted/50",
                            isSelected
                              ? "bg-red-50 border-red-200 text-red-700 ring-1 ring-red-200"
                              : "bg-background text-muted-foreground"
                          )}
                        >
                          <span
                            className={cn(
                              "font-medium text-sm",
                              isSelected && "font-bold"
                            )}
                          >
                            {option.label}
                          </span>
                          <span className="text-[10px] opacity-70">
                            {option.duration}
                          </span>
                        </div>
                      );
                    })}

                    {/* CUSTOM DATE BUTTON */}
                    <Popover>
                      <PopoverTrigger asChild>
                        <div
                          className={cn(
                            "cursor-pointer rounded-lg border p-3 flex flex-col items-center justify-center gap-1 transition-all hover:bg-muted/50",
                            isCustomDate
                              ? "bg-red-50 border-red-200 text-red-700 ring-1 ring-red-200"
                              : "bg-background text-muted-foreground"
                          )}
                        >
                          <CalendarIcon className="h-4 w-4 mb-0.5" />
                          <span className="text-xs font-medium">Tùy chọn</span>
                        </div>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="end">
                        <Calendar
                          mode="single"
                          selected={form.watch("lockUntil")}
                          onSelect={(date) => {
                            if (date) {
                              form.setValue("lockUntil", date);
                              setIsCustomDate(true);
                            }
                          }}
                          disabled={(date) => date < new Date()}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                </div>

                {/* 2. SUMMARY CARD */}
                <FormField
                  control={form.control}
                  name="lockUntil"
                  render={({ field }) => (
                    <div className="bg-red-50/50 border border-red-100 rounded-lg p-4 flex items-start gap-3">
                      <UserX className="h-5 w-5 text-red-500 mt-0.5" />
                      <div className="space-y-1">
                        <p className="text-sm font-medium text-red-900">
                          Xác nhận khóa truy cập
                        </p>
                        <p className="text-sm text-red-700/80 leading-relaxed">
                          Tài khoản sẽ bị vô hiệu hóa ngay lập tức và tự động mở
                          khóa vào lúc:
                        </p>
                        <div className="flex items-center gap-2 mt-2 bg-white/60 w-fit px-3 py-1 rounded-md border border-red-100">
                          <Clock className="h-3.5 w-3.5 text-red-600" />
                          <span className="text-sm font-bold text-red-700 font-mono">
                            {field.value
                              ? format(field.value, "HH:mm - dd/MM/yyyy")
                              : "..."}
                          </span>
                        </div>
                      </div>
                    </div>
                  )}
                />
              </div>

              {/* FOOTER */}
              <DialogFooter className="px-6 py-4 bg-gray-50/50 border-t">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={onClose}
                  disabled={isPending}
                >
                  Hủy bỏ
                </Button>
                <Button
                  type="submit"
                  disabled={isPending}
                  className="bg-red-600 hover:bg-red-700 text-white min-w-[140px]"
                >
                  {isPending ? (
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  ) : (
                    <Lock className="h-4 w-4 mr-2" />
                  )}
                  Khóa tài khoản
                </Button>
              </DialogFooter>
            </form>
          </Form>
        ) : (
          <div className="flex flex-col">
            {/* UNLOCK UI */}
            <div className="p-6 space-y-6">
              {/* Info Card */}
              <div className="bg-muted/30 border rounded-lg p-4 space-y-4">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-muted-foreground">Email:</span>
                  <span className="font-medium">{user.email}</span>
                </div>
                <Separator />
                <div className="flex justify-between items-center text-sm">
                  <span className="text-muted-foreground">Trạng thái:</span>
                  <Badge
                    variant="destructive"
                    className="flex items-center gap-1"
                  >
                    <Lock className="h-3 w-3" /> Đang khóa
                  </Badge>
                </div>
                {user.lockoutEnd && (
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-muted-foreground">Hết hạn khóa:</span>
                    <span className="font-mono text-muted-foreground">
                      {format(new Date(user.lockoutEnd), " HH:mm dd/MM/yyyy")}
                    </span>
                  </div>
                )}
              </div>

              {/* Consequence Alert */}
              <div className="flex items-start gap-3 p-4 bg-green-50 border border-green-200 rounded-lg">
                <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                <div className="text-sm text-green-800">
                  <p className="font-semibold mb-1">Khôi phục quyền truy cập</p>
                  <p className="opacity-90">
                    Người dùng sẽ có thể đăng nhập và sử dụng hệ thống ngay sau
                    khi bạn xác nhận.
                  </p>
                </div>
              </div>
            </div>

            <DialogFooter className="px-6 py-4 bg-gray-50/50 border-t">
              <Button
                type="button"
                variant="ghost"
                onClick={onClose}
                disabled={isPending}
              >
                Hủy bỏ
              </Button>
              <Button
                type="button"
                onClick={handleUnlock}
                disabled={isPending}
                className="bg-green-600 hover:bg-green-700 text-white min-w-[140px]"
              >
                {isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : (
                  <Unlock className="h-4 w-4 mr-2" />
                )}
                Mở khóa ngay
              </Button>
            </DialogFooter>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
