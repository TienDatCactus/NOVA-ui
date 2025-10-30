import { useState } from "react";
import { useUnitList } from "./container/use-unit-list.hooks";
import { DataTable } from "./components/data-table";
import { columns } from "./components/columns";
import CreateUnitDialog from "./components/create-unit.dialog";
import EditUnitDialog from "./components/edit-unit.dialog";
import DeleteUnitDialog from "./components/delete-unit.dialog";
import { Button } from "~/components/ui/button";
import { Plus } from "lucide-react";
import { Skeleton } from "~/components/ui/skeleton";
import {
  Empty,
  EmptyHeader,
  EmptyTitle,
  EmptyDescription,
  EmptyMedia,
} from "~/components/ui/empty";
import { Package } from "lucide-react";
import type { UnitItemDetailResponseDto } from "~/services/api/units/dto";

export function clientLoader() {
  return { title: "Đơn vị tính - NOVA" };
}

export default function Units() {
  const { data, isPending, refetch } = useUnitList();
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [selectedUnit, setSelectedUnit] = useState<UnitItemDetailResponseDto | null>(null);

  const handleEdit = (unit: UnitItemDetailResponseDto) => {
    setSelectedUnit(unit);
    setShowEditDialog(true);
  };

  const handleDelete = (unit: UnitItemDetailResponseDto) => {
    setSelectedUnit(unit);
    setShowDeleteDialog(true);
  };

  const handleCloseEdit = () => {
    setShowEditDialog(false);
    setSelectedUnit(null);
  };

  const handleCloseDelete = () => {
    setShowDeleteDialog(false);
    setSelectedUnit(null);
  };

  return (
    <div className="flex h-full flex-col gap-6 p-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Đơn vị tính</h1>
          <p className="text-sm text-muted-foreground">
            Quản lý các đơn vị tính cho sản phẩm
          </p>
        </div>
        <Button onClick={() => setShowCreateDialog(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Thêm đơn vị
        </Button>
      </div>

      {/* Stats */}
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <span>Tổng số: <span className="font-semibold text-foreground">{data?.length || 0}</span> đơn vị</span>
      </div>

      {/* Content */}
      <div className="flex-1 rounded-lg border bg-card">
        {isPending ? (
          <div className="space-y-4 p-6">
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-64 w-full" />
          </div>
        ) : !data || data.length === 0 ? (
          <Empty>
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <Package />
              </EmptyMedia>
              <EmptyTitle>Chưa có đơn vị tính nào</EmptyTitle>
              <EmptyDescription>
                Bắt đầu thêm đơn vị tính cho sản phẩm của bạn
              </EmptyDescription>
            </EmptyHeader>
          </Empty>
        ) : (
          <DataTable columns={columns} data={data} onEdit={handleEdit} onDelete={handleDelete} />
        )}
      </div>

      {/* Dialogs */}
      <CreateUnitDialog
        open={showCreateDialog}
        onOpenChange={setShowCreateDialog}
        onSuccess={refetch}
      />

      <EditUnitDialog
        open={showEditDialog}
        onOpenChange={handleCloseEdit}
        unit={selectedUnit}
        onSuccess={refetch}
      />

      <DeleteUnitDialog
        open={showDeleteDialog}
        onOpenChange={handleCloseDelete}
        unit={selectedUnit}
        onSuccess={refetch}
      />
    </div>
  );
}
