import { MoreVertical, Pencil, Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
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
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import { Separator } from "~/components/ui/separator";
import { formatMoney } from "~/lib/utils";
import type { PayrollComponentDto } from "~/services/api/staff/staff-payroll/dto";
import {
  ComponentTypeConfig,
  type ComponentTypeKey,
} from "~/services/api/staff/staff-payroll/staff-payroll.type";
import { useDeletePayrollComponent } from "../../container/query.hooks";
import AddComponentDialog from "./add-component-dialog";
import EditComponentDialog from "./edit-component-dialog";
import { hasRole } from "~/lib/auth/bouncer";
import { AuthLoader, UserRole } from "~/lib/auth/auth.loader";

interface ComponentsListProps {
  payrollId: string;
  components: PayrollComponentDto[];
  componentsTotal: number;
  hasExpense?: boolean;
  locked?: boolean;
  onRefresh?: () => void;
}

export default function ComponentsList({
  payrollId,
  components,
  componentsTotal,
  hasExpense = false,
  onRefresh,
}: ComponentsListProps) {
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [selectedComponent, setSelectedComponent] =
    useState<PayrollComponentDto | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [componentToDelete, setComponentToDelete] =
    useState<PayrollComponentDto | null>(null);

  const { mutate: deleteComponent } = useDeletePayrollComponent();

  const handleEdit = (component: PayrollComponentDto) => {
    setSelectedComponent(component);
    setEditDialogOpen(true);
  };

  const handleDelete = (component: PayrollComponentDto) => {
    setComponentToDelete(component);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (componentToDelete) {
      deleteComponent(
        { componentId: componentToDelete.componentId, payrollId: payrollId },
        {
          onSuccess: () => {
            toast.success("Xóa component thành công");
            setDeleteDialogOpen(false);
            setComponentToDelete(null);
            onRefresh?.();
          },
          onError: () => {
            toast.error("Không thể xóa component");
          },
        },
      );
    }
  };

  const handleSuccess = () => {
    onRefresh?.();
  };

  return (
    <div className="flex flex-col h-full p-6">
      {/* Header */}
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="font-semibold text-base">
            Danh sách phụ cấp / khấu trừ
          </h3>
          <p className="text-sm text-muted-foreground mt-1">
            Quản lý các khoản thưởng, phạt, phụ cấp
          </p>
        </div>
        {hasRole(AuthLoader.getUser(), UserRole.Accountant) && (
          <Button
            size="sm"
            onClick={() => setAddDialogOpen(true)}
            disabled={hasExpense}
          >
            <Plus className="h-4 w-4 mr-1.5" />
            Thêm mới
          </Button>
        )}
      </div>

      {components && components.length > 0 ? (
        <>
          {/* Scrollable list */}
          <div className="flex-1 overflow-y-auto space-y-2.5 pr-2">
            {components.map((component) => {
              const config =
                ComponentTypeConfig[component.type as ComponentTypeKey];
              // Các loại component là khấu trừ
              const isDeductionType = [
                "Penalty",
                "Advance",
                "AdjustmentDecrease",
              ].includes(component.type);
              // Số tiền hiển thị: nếu là loại khấu trừ thì luôn âm, ngược lại dùng giá trị gốc
              const displayAmount = isDeductionType
                ? -Math.abs(component.amount)
                : component.amount;

              return (
                <div
                  key={component.componentId}
                  className="group rounded-lg border bg-card p-4 hover:shadow-md hover:border-primary/20 transition-all"
                >
                  <div className="flex items-start justify-between gap-3">
                    {/* Left: Title & Badge */}
                    <div className="flex-1 min-w-0 space-y-2">
                      <div className="flex items-center gap-2">
                        <h4 className="font-medium text-sm text-foreground truncate">
                          {component.title}
                        </h4>
                        <Badge variant="secondary" className="text-xs shrink-0">
                          {config?.label || component.type}
                        </Badge>
                      </div>
                      {component.note && (
                        <p className="text-xs text-muted-foreground line-clamp-2">
                          {component.note}
                        </p>
                      )}
                    </div>

                    {/* Right: Amount & Actions */}
                    <div className="flex items-center gap-3 shrink-0">
                      <div className="text-right">
                        <div
                          className={`font-mono text-base font-bold tabular-nums ${
                            isDeductionType
                              ? "text-red-600 dark:text-red-400"
                              : "text-green-600 dark:text-green-400"
                          }`}
                        >
                          {displayAmount >= 0 ? "+" : ""}
                          {formatMoney(displayAmount).vndFormatted}
                        </div>
                        <div className="text-xs text-muted-foreground mt-0.5">
                          VNĐ
                        </div>
                      </div>

                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            size="icon"
                            variant="ghost"
                            className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
                            disabled={hasExpense}
                          >
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            onClick={() => handleEdit(component)}
                            disabled={hasExpense}
                          >
                            <Pencil className="h-4 w-4 mr-2" />
                            Chỉnh sửa
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleDelete(component)}
                            className="text-destructive focus:text-destructive"
                            disabled={hasExpense}
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Xóa
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Fixed total at bottom */}
          <div className="flex-shrink-0 pt-4 space-y-4">
            <Separator />
            <div className="rounded-lg bg-primary/5 border border-primary/20 p-4">
              <div className="flex justify-between items-center">
                <span className="font-semibold text-sm text-foreground">
                  Tổng phụ cấp/khấu trừ
                </span>
                <div className="text-right">
                  <div
                    className={`font-mono text-xl font-bold tabular-nums ${
                      componentsTotal >= 0
                        ? "text-green-600 dark:text-green-400"
                        : "text-red-600 dark:text-red-400"
                    }`}
                  >
                    {componentsTotal >= 0 ? "+" : ""}
                    {formatMoney(componentsTotal).vndFormatted}
                  </div>
                  <div className="text-xs text-muted-foreground mt-0.5">
                    VNĐ
                  </div>
                </div>
              </div>
            </div>
          </div>
        </>
      ) : (
        <div className="flex flex-col items-center justify-center py-12 px-4 text-center rounded-lg border-2 border-dashed">
          <div className="rounded-full bg-muted p-3 mb-3">
            <svg
              className="h-6 w-6 text-muted-foreground"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
          </div>
          <p className="text-sm font-medium text-foreground">
            Chưa có phụ cấp hoặc khấu trừ
          </p>
          <p className="text-xs text-muted-foreground mt-1 mb-4">
            Nhấn "Thêm mới" để thêm các khoản thưởng, phạt, phụ cấp
          </p>
          {hasRole(AuthLoader.getUser(), UserRole.Accountant) && (
            <Button
              size="sm"
              onClick={() => setAddDialogOpen(true)}
              variant="outline"
            >
              <Plus className="h-4 w-4 mr-1.5" />
              Thêm phụ cấp/khấu trừ đầu tiên
            </Button>
          )}
        </div>
      )}

      <AddComponentDialog
        open={addDialogOpen}
        onOpenChange={setAddDialogOpen}
        payrollId={payrollId}
        onSuccess={handleSuccess}
      />

      <EditComponentDialog
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
        payrollId={payrollId}
        component={selectedComponent}
        onSuccess={handleSuccess}
      />

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xác nhận xóa</AlertDialogTitle>
            <AlertDialogDescription>
              Bạn có chắc chắn muốn xóa component "{componentToDelete?.title}"
              không? Hành động này không thể hoàn tác.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Hủy</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-destructive hover:bg-destructive/90"
            >
              Xóa
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
