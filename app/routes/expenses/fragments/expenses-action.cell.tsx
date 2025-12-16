import {
  CheckCircle2,
  MoreHorizontal,
  Pencil,
  Trash2,
  XCircle,
} from "lucide-react";
import React, { useMemo, useState } from "react";
import { Button } from "~/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "~/components/ui/tooltip";
import type { ExpenseListItemDto } from "~/services/api/expenses/dto";
import EditExpenseDialog from "../components/edit-expense.dialog";
import DeleteConfirmDialog from "./delete-confirm.dialog";
import PostConfirmDialog from "./post-confirm.dialog";
import VoidConfirmDialog from "./void-confirm.dialog";

interface ExpensesActionCellProps {
  expense: ExpenseListItemDto;
}

const ExpensesActionCell: React.FC<ExpensesActionCellProps> = ({ expense }) => {
  const [openEditDialog, setOpenEditDialog] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [openPostDialog, setOpenPostDialog] = useState(false);
  const [openVoidDialog, setOpenVoidDialog] = useState(false);

  // Business rules for actions
  const permissions = useMemo(() => {
    const isManual = expense.sourceType === "Manual";
    const isDraft = expense.status === "Draft";
    const isPosted = expense.status === "Posted";

    return {
      canEdit: isManual && isDraft,
      canDelete: isManual && isDraft,
      canPost: isManual && isDraft,
      canVoid: isManual && isPosted,
    };
  }, [expense.sourceType, expense.status]);

  // Tooltip messages for disabled actions
  const getDisabledTooltip = (action: string) => {
    if (expense.sourceType !== "Manual") {
      const sourceTypeLabels: Record<string, string> = {
        StaffPayroll: "lương",
        Procurement: "nhập hàng",
        OtherModule: "module khác",
      };
      return `Chi phí từ ${sourceTypeLabels[expense.sourceType] || expense.sourceType} không được ${action} từ đây`;
    }
    if (expense.status === "Posted") {
      return "Chi phí đã chốt, vui lòng hủy trước khi sửa";
    }
    if (expense.status === "Voided") {
      return "Chi phí đã hủy, không thể thao tác";
    }
    return "";
  };

  return (
    <div className="flex justify-end">
      <TooltipProvider>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Thao tác</DropdownMenuLabel>
            <DropdownMenuSeparator />

            {/* Edit */}
            <Tooltip>
              <TooltipTrigger asChild>
                <div>
                  <DropdownMenuItem
                    onClick={() => setOpenEditDialog(true)}
                    disabled={!permissions.canEdit}
                  >
                    <Pencil className="mr-2 h-4 w-4" />
                    Chỉnh sửa
                  </DropdownMenuItem>
                </div>
              </TooltipTrigger>
              {!permissions.canEdit && (
                <TooltipContent side="left">
                  <p>{getDisabledTooltip("sửa")}</p>
                </TooltipContent>
              )}
            </Tooltip>

            {/* Delete */}
            <Tooltip>
              <TooltipTrigger asChild>
                <div>
                  <DropdownMenuItem
                    onClick={() => setOpenDeleteDialog(true)}
                    disabled={!permissions.canDelete}
                    variant="destructive"
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Xóa
                  </DropdownMenuItem>
                </div>
              </TooltipTrigger>
              {!permissions.canDelete && (
                <TooltipContent side="left">
                  <p>{getDisabledTooltip("xóa")}</p>
                </TooltipContent>
              )}
            </Tooltip>

            {/* Post - only show if canPost */}
            {permissions.canPost && (
              <>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => setOpenPostDialog(true)}
                  className="text-green-600"
                >
                  <CheckCircle2 className="mr-2 h-4 w-4" />
                  Chốt
                </DropdownMenuItem>
              </>
            )}

            {/* Void - only show if canVoid */}
            {permissions.canVoid && (
              <>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => setOpenVoidDialog(true)}
                  variant="destructive"
                >
                  <XCircle className="mr-2 h-4 w-4" />
                  Hủy
                </DropdownMenuItem>
              </>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </TooltipProvider>

      <EditExpenseDialog
        open={openEditDialog}
        onOpenChange={setOpenEditDialog}
        expenseId={expense.id}
      />
      <DeleteConfirmDialog
        expense={expense}
        onClose={() => setOpenDeleteDialog(false)}
        open={openDeleteDialog}
      />
      <PostConfirmDialog
        expense={expense}
        onClose={() => setOpenPostDialog(false)}
        open={openPostDialog}
      />
      <VoidConfirmDialog
        expense={expense}
        onClose={() => setOpenVoidDialog(false)}
        open={openVoidDialog}
      />
    </div>
  );
};

export default ExpensesActionCell;
