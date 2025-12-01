import { Loader2, Lock, Unlock } from "lucide-react";
import { useEffect, useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { cn } from "~/lib/utils";
import { useLockPayroll, useUnlockPayroll } from "../container/query.hooks";

interface StatusSelectCellProps {
  payrollId: string;
  locked: boolean;
  onSuccess?: () => void;
}

export default function StatusSelectCell({
  payrollId,
  locked,
  onSuccess,
}: StatusSelectCellProps) {
  // Local state for optimistic UI updates
  const [currentStatus, setCurrentStatus] = useState(locked);

  // Sync local state if parent prop changes (e.g. after refetch)
  useEffect(() => {
    setCurrentStatus(locked);
  }, [locked]);

  const { mutate: lockPayroll, isPending: isLocking } = useLockPayroll();
  const { mutate: unlockPayroll, isPending: isUnlocking } = useUnlockPayroll();

  const handleStatusChange = (value: string) => {
    const isLockingAction = value === "locked";

    // Optimistic update
    setCurrentStatus(isLockingAction);

    const mutationFn = isLockingAction ? lockPayroll : unlockPayroll;

    mutationFn(payrollId, {
      onSuccess: () => {
        onSuccess?.();
      },
      onError: () => {
        // Revert on error
        setCurrentStatus(!isLockingAction);
      },
    });
  };

  const isLoading = isLocking || isUnlocking;

  return (
    <div className="flex items-center justify-center">
      <Select
        value={currentStatus ? "locked" : "unlocked"}
        onValueChange={handleStatusChange}
        disabled={isLoading}
      >
        <SelectTrigger
          className={cn(
            "h-8 w-[130px] text-xs font-medium transition-colors duration-200",
            currentStatus
              ? "bg-primary/10 text-primary border-primary/20 hover:bg-primary/20 hover:border-primary/30"
              : "bg-muted text-muted-foreground border-transparent hover:bg-muted/80 hover:text-foreground"
          )}
        >
          {isLoading ? (
            <div className="flex items-center gap-2">
              <Loader2 className="h-3 w-3 animate-spin" />
              <span>Đang xử lý...</span>
            </div>
          ) : (
            <SelectValue />
          )}
        </SelectTrigger>
        <SelectContent align="end">
          <SelectItem value="unlocked" className="text-xs">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Unlock className="h-3.5 w-3.5" />
              <span>Tạm tính (Mở)</span>
            </div>
          </SelectItem>
          <SelectItem value="locked" className="text-xs">
            <div className="flex items-center gap-2 text-primary font-medium">
              <Lock className="h-3.5 w-3.5" />
              <span>Đã chốt (Khóa)</span>
            </div>
          </SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}
