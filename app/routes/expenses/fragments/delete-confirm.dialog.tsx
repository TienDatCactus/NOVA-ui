import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "~/components/ui/alert-dialog";
import type { ExpenseListItemDto } from "~/services/api/expenses/dto";
import { useDeleteExpense } from "../container/query.hooks";
import { formatMoney } from "~/lib/utils";
import { format, parseISO } from "date-fns";
import { vi } from "date-fns/locale";

interface DeleteConfirmDialogProps {
  open: boolean;
  onClose: () => void;
  expense: ExpenseListItemDto;
}

export default function DeleteConfirmDialog({
  open,
  onClose,
  expense,
}: DeleteConfirmDialogProps) {
  const { mutate: deleteExpense, isPending: isDeleting } = useDeleteExpense();

  const handleDelete = () => {
    deleteExpense(expense.id, {
      onSuccess: () => {
        onClose();
      },
    });
  };

  return (
    <AlertDialog open={open} onOpenChange={onClose}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Xác nhận xóa chi phí</AlertDialogTitle>
          <AlertDialogDescription>
            Bạn có chắc chắn muốn xóa chi phí này?
            <div className="mt-3 space-y-2 rounded-md bg-muted p-3">
              <div className="text-sm">
                <span className="font-medium text-foreground">Ngày chi:</span>{" "}
                {format(parseISO(expense.expenseDate), "dd/MM/yyyy", {
                  locale: vi,
                })}
              </div>
              <div className="text-sm">
                <span className="font-medium text-foreground">Danh mục:</span>{" "}
                {expense.categoryName}
              </div>
              <div className="text-sm">
                <span className="font-medium text-foreground">Số tiền:</span>{" "}
                <span className="font-semibold">
                  {formatMoney(expense.amount).vndFormatted}
                </span>
              </div>
              <div className="text-sm">
                <span className="font-medium text-foreground">Mô tả:</span>{" "}
                {expense.description}
              </div>
            </div>
            <span className="mt-3 block text-destructive font-medium">
              Hành động này không thể hoàn tác.
            </span>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isDeleting}>Hủy</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            disabled={isDeleting}
            className="bg-destructive hover:bg-destructive/90"
          >
            {isDeleting ? "Đang xóa..." : "Xóa chi phí"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
