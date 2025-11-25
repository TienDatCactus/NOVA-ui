import { DollarSign } from "lucide-react";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
} from "~/components/ui/empty";
import { Skeleton } from "~/components/ui/skeleton";
import type { ExpenseListResponseDto } from "~/services/api/expenses/dto";
import ExpensesDataTable from "./expenses-list";

interface ExpensesListViewProps {
  expenses: ExpenseListResponseDto;
  isLoading: boolean;
}

export default function ExpensesListView({
  expenses,
  isLoading,
}: ExpensesListViewProps) {
  return (
    <div>
      {isLoading ? (
        <LoadingSkeleton />
      ) : expenses.length === 0 ? (
        <EmptyState />
      ) : (
        <ExpensesDataTable expenses={expenses} />
      )}
    </div>
  );
}

function LoadingSkeleton() {
  return (
    <div className="space-y-2">
      {[1, 2, 3, 4, 5].map((i) => (
        <Skeleton key={i} className="h-16 w-full" />
      ))}
    </div>
  );
}

function EmptyState() {
  return (
    <Empty>
      <EmptyMedia variant="icon">
        <DollarSign />
      </EmptyMedia>
      <EmptyHeader>Không tìm thấy chi phí</EmptyHeader>
      <EmptyDescription>
        Thử thay đổi bộ lọc hoặc tạo chi phí mới
      </EmptyDescription>
    </Empty>
  );
}
