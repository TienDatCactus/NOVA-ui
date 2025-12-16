import { DollarSign } from "lucide-react";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "~/components/ui/empty";
import { Skeleton } from "~/components/ui/skeleton";
import type { ExpenseListResponseDto } from "~/services/api/expenses/dto";
import ExpensesDataTable from "./expenses-list";
import { useState } from "react";
import { Button } from "~/components/ui/button";
import CreateExpenseDialog from "./create-expense.dialog";
import { hasRole } from "~/lib/auth/bouncer";
import { AuthLoader } from "~/lib/auth/auth.loader";
import { UserRole } from "~/lib/auth/roles";

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
  const [openCreateDialog, setOpenCreateDialog] = useState(false);
  return (
    <Empty>
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <DollarSign />
        </EmptyMedia>
        <EmptyTitle>Không tìm thấy chi phí</EmptyTitle>
        <EmptyDescription>
          Thử thay đổi bộ lọc hoặc tạo chi phí mới
        </EmptyDescription>
      </EmptyHeader>
      <EmptyContent>
        {hasRole(AuthLoader.getUser(), UserRole.Accountant) && (
          <Button onClick={() => setOpenCreateDialog(true)}>
            Tạo chi phí mới
          </Button>
        )}
      </EmptyContent>
      <CreateExpenseDialog
        open={openCreateDialog}
        onOpenChange={setOpenCreateDialog}
      />
    </Empty>
  );
}
