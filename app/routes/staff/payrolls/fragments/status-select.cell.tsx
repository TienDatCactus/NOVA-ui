import { useState, useEffect } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { useMutation } from "@tanstack/react-query";
import { StaffPayrollService } from "~/services/api/staff-payroll";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

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
  const [currentStatus, setCurrentStatus] = useState(locked);
  useEffect(() => {
    setCurrentStatus(locked);
  }, [locked, payrollId]);

  const lockMutation = useMutation({
    mutationFn: () => StaffPayrollService.lockPayroll(payrollId),
    onSuccess: () => {
      toast.success("Đã khóa bảng lương");
      setCurrentStatus(true);
      onSuccess?.();
    },
    onError: () => {
      toast.error("Không thể khóa bảng lương");
    },
  });

  const unlockMutation = useMutation({
    mutationFn: () => StaffPayrollService.unlockPayroll(payrollId),
    onSuccess: () => {
      toast.success("Đã mở khóa bảng lương");
      setCurrentStatus(false);
      onSuccess?.();
    },
    onError: () => {
      toast.error("Không thể mở khóa bảng lương");
    },
  });

  const handleStatusChange = (value: string) => {
    if (value === "locked") {
      lockMutation.mutate();
    } else {
      unlockMutation.mutate();
    }
  };

  const isLoading = lockMutation.isPending || unlockMutation.isPending;

  return (
    <div className="flex items-center justify-center">
      <Select
        value={currentStatus ? "locked" : "unlocked"}
        onValueChange={handleStatusChange}
        disabled={isLoading}
      >
        <SelectTrigger
          className={`w-[120px] h-8 text-xs ${
            currentStatus
              ? "bg-green-100 text-green-700 border-green-200 hover:bg-green-100 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800"
              : "bg-gray-100 text-gray-700 border-gray-200 hover:bg-gray-100 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-700"
          }`}
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
        <SelectContent>
          <SelectItem value="unlocked" className="text-xs">
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-gray-500" />
              <span>Tạm tính</span>
            </div>
          </SelectItem>
          <SelectItem value="locked" className="text-xs">
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-green-500" />
              <span>Đã khóa</span>
            </div>
          </SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}
