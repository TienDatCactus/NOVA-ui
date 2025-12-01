import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import { Button } from "~/components/ui/button";
import {
  MoreHorizontal,
  FileText,
  Edit,
  RefreshCw,
  DollarSign,
} from "lucide-react";
import { useState } from "react";
import type { PayrollItemDto } from "~/services/api/staff/staff-payroll/dto";
import ApplyUnusedLeaveDialog from "../components/apply-unused-leave-dialog";
import UpdatePayrollDialog from "../components/update-payroll-dialog";
import CreateSalaryExpenseDialog from "../components/create-salary-expense-dialog";
import { toast } from "sonner";
import { useRefreshSinglePayroll } from "../container/query.hooks";

interface ActionsMenuCellProps {
  payroll: PayrollItemDto;
  onSuccess?: () => void;
}

export default function ActionsMenuCell({
  payroll,
  onSuccess,
}: ActionsMenuCellProps) {
  const [updateOpen, setUpdateOpen] = useState(false);
  const [applyLeaveOpen, setApplyLeaveOpen] = useState(false);
  const [createExpenseOpen, setCreateExpenseOpen] = useState(false);

  const { mutate: refreshSingle, isPending: isRefreshing } =
    useRefreshSinglePayroll();

  const handleRefreshSingle = () => {
    refreshSingle(payroll.payrollId, {
      onSuccess: () => {
        toast.success("Làm mới dữ liệu thành công");
        onSuccess?.();
      },
      onError: (error) => {
        toast.error("Không thể làm mới dữ liệu");
        console.error("Refresh single error:", error);
      },
    });
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="h-8 w-8 p-0">
            <span className="sr-only">Mở menu</span>
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={() => setUpdateOpen(true)}>
            <Edit className="mr-2 h-4 w-4" />
            <span>Cập nhật</span>
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => setApplyLeaveOpen(true)}
            disabled={payroll.locked}
            className={payroll.locked ? "opacity-50 cursor-not-allowed" : ""}
          >
            <FileText className="mr-2 h-4 w-4" />
            <span>Áp dụng chế độ xử lý phép dư</span>
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => setCreateExpenseOpen(true)}
            disabled={!payroll.locked || payroll.hasExpense}
            className={
              !payroll.locked || payroll.hasExpense
                ? "opacity-50 cursor-not-allowed"
                : ""
            }
          >
            <DollarSign className="mr-2 h-4 w-4" />
            <span>Tạo phiếu chi lương</span>
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={handleRefreshSingle}
            disabled={isRefreshing}
          >
            <RefreshCw
              className={`mr-2 h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`}
            />
            <span>Làm mới</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <UpdatePayrollDialog
        payroll={payroll}
        open={updateOpen}
        onOpenChange={setUpdateOpen}
        onSuccess={onSuccess}
      />

      {applyLeaveOpen && (
        <ApplyUnusedLeaveDialog
          payroll={payroll}
          open={applyLeaveOpen}
          onOpenChange={setApplyLeaveOpen}
          onSuccess={onSuccess}
        />
      )}

      {createExpenseOpen && (
        <CreateSalaryExpenseDialog
          payroll={payroll}
          open={createExpenseOpen}
          onOpenChange={setCreateExpenseOpen}
        />
      )}
    </>
  );
}
