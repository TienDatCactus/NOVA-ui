import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import { Button } from "~/components/ui/button";
import { MoreHorizontal, FileText, Edit } from "lucide-react";
import { useState } from "react";
import type { PayrollItem } from "~/services/api/staff-payroll/dto";
import ApplyUnusedLeaveDialog from "../components/apply-unused-leave-dialog";
import UpdatePayrollDialog from "../components/update-payroll-dialog";

interface ActionsMenuCellProps {
  payroll: PayrollItem;
  onSuccess?: () => void;
}

export default function ActionsMenuCell({
  payroll,
  onSuccess,
}: ActionsMenuCellProps) {
  const [updateOpen, setUpdateOpen] = useState(false);
  const [applyLeaveOpen, setApplyLeaveOpen] = useState(false);

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
          {payroll.hasUnusedLeavePending && (
            <DropdownMenuItem onClick={() => setApplyLeaveOpen(true)}>
              <FileText className="mr-2 h-4 w-4" />
              <span>Áp dụng chế độ xử lý phép dư</span>
            </DropdownMenuItem>
          )}
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
    </>
  );
}
