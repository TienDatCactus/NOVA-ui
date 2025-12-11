import { Loader2, Lock, Unlock } from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "~/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "~/components/ui/tooltip";
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
  // Local state for optimistic UI
  const [isLocked, setIsLocked] = useState(locked);

  // Sync prop changes
  useEffect(() => {
    setIsLocked(locked);
  }, [locked]);

  const { mutate: lockPayroll, isPending: isLocking } = useLockPayroll();
  const { mutate: unlockPayroll, isPending: isUnlocking } = useUnlockPayroll();

  const isLoading = isLocking || isUnlocking;

  const handleToggle = () => {
    if (isLoading) return;

    // 1. Determine action
    const nextStatus = !isLocked;
    const mutationFn = nextStatus ? lockPayroll : unlockPayroll;

    // 2. Optimistic Update (Cập nhật ngay lập tức)
    setIsLocked(nextStatus);

    // 3. Server Mutation
    mutationFn(payrollId, {
      onSuccess: () => {
        onSuccess?.();
      },
      onError: () => {
        // 4. Revert on Error (Hoàn tác nếu lỗi)
        setIsLocked(!nextStatus);
      },
    });
  };

  return (
    <div className="flex items-center justify-center">
      <TooltipProvider delayDuration={300}>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant={isLocked ? "destructive" : "info"}
              size="sm"
              onClick={handleToggle}
              disabled={isLoading}
            >
              {isLoading ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin mr-1.5" />
              ) : isLocked ? (
                <Lock className="h-3.5 w-3.5 mr-1.5" />
              ) : (
                <Unlock className="h-3.5 w-3.5 mr-1.5" />
              )}

              <span>{isLocked ? "Đã chốt" : "Tạm tính"}</span>
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>
              {isLocked
                ? "Click để mở khóa (cho phép chỉnh sửa)"
                : "Click để chốt lương (khóa chỉnh sửa)"}
            </p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </div>
  );
}
