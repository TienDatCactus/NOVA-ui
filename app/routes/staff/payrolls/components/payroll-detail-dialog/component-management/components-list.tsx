import { useState } from "react";
import { Button } from "~/components/ui/button";
import { Badge } from "~/components/ui/badge";
import { Separator } from "~/components/ui/separator";
import type { PayrollComponent } from "~/services/api/staff-payroll/dto";
import { ComponentTypeConfig, type ComponentTypeKey } from "~/services/api/staff-payroll/staff-payroll.type";
import { Plus, Pencil, Trash2, MoreVertical } from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import { StaffPayrollService } from "~/services/api/staff-payroll";
import { toast } from "sonner";
import AddComponentDialog from "./add-component-dialog";
import EditComponentDialog from "./edit-component-dialog";
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";

interface ComponentsListProps {
  payrollId: string;
  components: PayrollComponent[];
  componentsTotal: number;
  onRefresh?: () => void;
}

export default function ComponentsList({
  payrollId,
  components,
  componentsTotal,
  onRefresh,
}: ComponentsListProps) {
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [selectedComponent, setSelectedComponent] = useState<PayrollComponent | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [componentToDelete, setComponentToDelete] = useState<PayrollComponent | null>(null);

  const deleteMutation = useMutation({
    mutationFn: (componentId: string) =>
      StaffPayrollService.deleteComponent(componentId),
    onSuccess: () => {
      toast.success("Xóa component thành công");
      setDeleteDialogOpen(false);
      setComponentToDelete(null);
      onRefresh?.();
    },
    onError: () => {
      toast.error("Không thể xóa component");
    },
  });

  const handleEdit = (component: PayrollComponent) => {
    setSelectedComponent(component);
    setEditDialogOpen(true);
  };

  const handleDelete = (component: PayrollComponent) => {
    setComponentToDelete(component);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (componentToDelete) {
      deleteMutation.mutate(componentToDelete.componentId);
    }
  };

  const handleSuccess = () => {
    onRefresh?.();
  };

  return (
    <div className="space-y-4 p-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h3 className="font-semibold text-base">Danh sách phụ cấp / khấu trừ</h3>
          <p className="text-sm text-muted-foreground mt-1">
            Quản lý các khoản thưởng, phạt, phụ cấp
          </p>
        </div>
        <Button size="sm" onClick={() => setAddDialogOpen(true)}>
          <Plus className="h-4 w-4 mr-1.5" />
          Thêm mới
        </Button>
      </div>

      {components && components.length > 0 ? (
        <>
          <div className="space-y-2.5">
            {components.map((component) => {
              const config = ComponentTypeConfig[component.type as ComponentTypeKey];
              // Các loại component là khấu trừ
              const isDeductionType = ["Penalty", "Advance", "AdjustmentDecrease"].includes(component.type);
              // Số tiền hiển thị: nếu là loại khấu trừ thì luôn âm, ngược lại dùng giá trị gốc
              const displayAmount = isDeductionType ? -Math.abs(component.amount) : component.amount;
              
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
                        <Badge 
                          variant="secondary" 
                          className="text-xs shrink-0"
                        >
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
                          {displayAmount.toLocaleString("vi-VN")}
                        </div>
                        <div className="text-xs text-muted-foreground mt-0.5">VNĐ</div>
                      </div>

                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            size="icon"
                            variant="ghost"
                            className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleEdit(component)}>
                            <Pencil className="h-4 w-4 mr-2" />
                            Chỉnh sửa
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleDelete(component)}
                            className="text-destructive focus:text-destructive"
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

          <Separator className="my-4" />

          {/* Total */}
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
                  {componentsTotal.toLocaleString("vi-VN")}
                </div>
                <div className="text-xs text-muted-foreground mt-0.5">VNĐ</div>
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
          <Button size="sm" onClick={() => setAddDialogOpen(true)} variant="outline">
            <Plus className="h-4 w-4 mr-1.5" />
            Thêm component đầu tiên
          </Button>
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
              Bạn có chắc chắn muốn xóa component "{componentToDelete?.title}" không?
              Hành động này không thể hoàn tác.
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
