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
import { usePostExpense } from "../container/query.hooks";
import { formatMoney } from "~/lib/utils";
import { format, parseISO } from "date-fns";
import { vi } from "date-fns/locale";

interface PostConfirmDialogProps {
  open: boolean;
  onClose: () => void;
  expense: ExpenseListItemDto;
}

export default function PostConfirmDialog({
  open,
  onClose,
  expense,
}: PostConfirmDialogProps) {
  const { mutate: postExpense, isPending: isPosting } = usePostExpense();

  const handlePost = () => {
    postExpense(expense.id, {
      onSuccess: () => {
        onClose();
      },
    });
  };

  return (
    <AlertDialog open={open} onOpenChange={onClose}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Xác nhận chốt chi phí</AlertDialogTitle>
          <AlertDialogDescription>
            Bạn có chắc chắn muốn chốt chi phí này? Sau khi chốt, chi phí không
            thể chỉnh sửa hoặc xóa.
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
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isPosting}>Hủy</AlertDialogCancel>
          <AlertDialogAction
            onClick={handlePost}
            disabled={isPosting}
            className="bg-green-600 hover:bg-green-700"
          >
            {isPosting ? "Đang chốt..." : "Chốt chi phí"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
