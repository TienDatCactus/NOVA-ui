import { CheckCircle, MoreHorizontal, Pencil, Trash2 } from "lucide-react";
import { useState } from "react";
import { Button } from "~/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import type { StockAdjustmentListItemDto } from "~/services/api/stocks/stock-adjustments/dto";
import EditStockAdjustmentDialog from "../components/edit-stock-adjustment.dialog";
import DeleteConfirmDialog from "./delete-confirm.dialog";
import ApplyConfirmDialog from "./apply-confirm.dialog";

interface StockAdjustmentActionCellProps {
  adjustment: StockAdjustmentListItemDto;
}

export default function StockAdjustmentActionCell({
  adjustment,
}: StockAdjustmentActionCellProps) {
  const [openEditDialog, setOpenEditDialog] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [openApplyDialog, setOpenApplyDialog] = useState(false);

  // Conditional actions based on isApplied
  const canEdit = !adjustment.isApplied;
  const canDelete = !adjustment.isApplied;
  const canApply = !adjustment.isApplied;

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

          {canEdit && (
            <DropdownMenuItem onClick={() => setOpenEditDialog(true)}>
              <Pencil className="mr-2 h-4 w-4" />
              Chỉnh sửa
            </DropdownMenuItem>
          )}

          {canApply && (
            <DropdownMenuItem onClick={() => setOpenApplyDialog(true)}>
              <CheckCircle className="mr-2 h-4 w-4" />
              Áp dụng phiếu
            </DropdownMenuItem>
          )}

          {canDelete && (
            <>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="text-destructive"
                onClick={() => setOpenDeleteDialog(true)}
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Xóa
              </DropdownMenuItem>
            </>
          )}

          {adjustment.isApplied && (
            <DropdownMenuItem disabled>
              Phiếu đã áp dụng - Không thể chỉnh sửa
            </DropdownMenuItem>
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Conditionally render dialogs */}
      {canEdit && (
        <EditStockAdjustmentDialog
          open={openEditDialog}
          onOpenChange={setOpenEditDialog}
          adjustmentId={adjustment.id}
        />
      )}

      <DeleteConfirmDialog
        open={openDeleteDialog}
        onClose={() => setOpenDeleteDialog(false)}
        adjustment={adjustment}
      />

      {canApply && (
        <ApplyConfirmDialog
          open={openApplyDialog}
          onClose={() => setOpenApplyDialog(false)}
          adjustment={adjustment}
        />
      )}
    </div>
  );
}
