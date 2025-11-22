import { MoreHorizontal, Pencil, Trash2, PackageCheck } from "lucide-react";
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
import EditItemDialog from "../components/edit-item.dialog";
import type { StockItemsListItemDto } from "~/services/api/stocks/items/dto";
import DeleteConfirmDialog from "./delete-confirm.dialog";
import { QuickAdjustDialog } from "./quick-adjust.dialog";

interface ItemsActionCellProps {
  item: StockItemsListItemDto;
}
const ItemsActionCell: React.FC<ItemsActionCellProps> = ({ item }) => {
  const [openEditDialog, setOpenEditDialog] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [openQuickAdjustDialog, setOpenQuickAdjustDialog] = useState(false);
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
          <DropdownMenuItem onClick={() => setOpenQuickAdjustDialog(true)}>
            <PackageCheck className="mr-2 h-4 w-4" />
            Điều chỉnh kho
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
      <EditItemDialog
        open={openEditDialog}
        onOpenChange={setOpenEditDialog}
        itemId={item.id}
      />
      <QuickAdjustDialog
        open={openQuickAdjustDialog}
        onOpenChange={setOpenQuickAdjustDialog}
        item={item}
      />
      <DeleteConfirmDialog
        item={item}
        onClose={() => setOpenDeleteDialog(false)}
        open={openDeleteDialog}
      />
    </div>
  );
};

export default ItemsActionCell;
