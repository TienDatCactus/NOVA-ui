import { DollarSign, Edit, FileText, MoreHorizontal } from "lucide-react";
import { useState } from "react";
import { Button } from "~/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import type { PayrollItemDto } from "~/services/api/staff/staff-payroll/dto";
import ApplyUnusedLeaveDialog from "../components/apply-unused-leave-dialog";
import CreateSalaryExpenseDialog from "../components/create-salary-expense-dialog";
import UpdateBaseSalaryPayrollDialog from "../components/update-base-salary-payroll-dialog";
import UpdatePaidAmountPayrollDialog from "../components/update-paid-payroll-dialog";

interface ActionsMenuCellProps {
  payroll: PayrollItemDto;
  onSuccess?: () => void;
}

export default function ActionsMenuCell({
  payroll,
  onSuccess,
}: ActionsMenuCellProps) {
  const [updateBaseSalaryOpen, setUpdateBaseSalaryOpen] = useState(false);
  const [updatePaidAmountOpen, setUpdatePaidAmountOpen] = useState(false);
  const [applyLeaveOpen, setApplyLeaveOpen] = useState(false);
  const [createExpenseOpen, setCreateExpenseOpen] = useState(false);

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
          <DropdownMenuItem onClick={() => setUpdateBaseSalaryOpen(true)}>
            <Edit className="mr-2 h-4 w-4" />
            <span>Cập nhật lương cơ bản</span>
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setUpdatePaidAmountOpen(true)}>
            <DollarSign className="mr-2 h-4 w-4" />
            <span>Cập nhật số tiền đã trả</span>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
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
        </DropdownMenuContent>
      </DropdownMenu>

      <UpdateBaseSalaryPayrollDialog
        payroll={payroll}
        open={updateBaseSalaryOpen}
        onOpenChange={setUpdateBaseSalaryOpen}
        onSuccess={onSuccess}
      />
      <UpdatePaidAmountPayrollDialog
        payroll={payroll}
        open={updatePaidAmountOpen}
        onOpenChange={setUpdatePaidAmountOpen}
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
