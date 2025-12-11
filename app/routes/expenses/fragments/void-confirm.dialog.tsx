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
import { useVoidExpense } from "../container/query.hooks";
import { formatMoney } from "~/lib/utils";
import { format, parseISO } from "date-fns";
import { vi } from "date-fns/locale";

interface VoidConfirmDialogProps {
  open: boolean;
  onClose: () => void;
  expense: ExpenseListItemDto;
}

export default function VoidConfirmDialog({
  open,
  onClose,
  expense,
}: VoidConfirmDialogProps) {
  const { mutate: voidExpense, isPending: isVoiding } = useVoidExpense();

  const handleVoid = () => {
    voidExpense(expense.id, {
      onSuccess: () => {
        onClose();
      },
    });
  };

  return (
    <AlertDialog open={open} onOpenChange={onClose}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Xác nhận hủy chi phí</AlertDialogTitle>
          <AlertDialogDescription>
            Bạn có chắc chắn muốn hủy chi phí này? Sau khi hủy, chi phí không
            thể thao tác gì.
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
          <AlertDialogCancel disabled={isVoiding}>Hủy</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleVoid}
            disabled={isVoiding}
            className="bg-destructive hover:bg-destructive/90"
          >
            {isVoiding ? "Đang hủy..." : "Hủy chi phí"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
