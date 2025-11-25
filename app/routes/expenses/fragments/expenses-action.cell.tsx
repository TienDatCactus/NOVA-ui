import { MoreHorizontal, Pencil, Trash2 } from "lucide-react";
import React, { useState } from "react";
import { Button } from "~/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import type { ExpenseListItemDto } from "~/services/api/expenses/dto";
import EditExpenseDialog from "../components/edit-expense.dialog";
import DeleteConfirmDialog from "./delete-confirm.dialog";

interface ExpensesActionCellProps {
  expense: ExpenseListItemDto;
}

const ExpensesActionCell: React.FC<ExpensesActionCellProps> = ({ expense }) => {
  const [openEditDialog, setOpenEditDialog] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);

  return (
    <div className="flex justify-end">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="sm">
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>Thao tác</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => setOpenEditDialog(true)}>
            <Pencil className="mr-2 h-4 w-4" />
            Chỉnh sửa
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            className="text-destructive"
            onClick={() => setOpenDeleteDialog(true)}
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Xóa
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

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
    </div>
  );
};

export default ExpensesActionCell;
