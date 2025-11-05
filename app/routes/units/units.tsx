import { useState } from "react";
import { DataTable } from "./components/data-table";
import { columns } from "./components/columns";
import CreateUnitDialog from "./components/create-unit.dialog";
import EditUnitDialog from "./components/edit-unit.dialog";
import DeleteUnitDialog from "./components/delete-unit.dialog";
import UnitsViewLayout from "./layouts/units-view.layout";
import useUnitsContainer from "./container/container.hooks";
import { Card } from "~/components/ui/card";
import { Skeleton } from "~/components/ui/skeleton";
import { Package } from "lucide-react";
import {
  Empty,
  EmptyHeader,
  EmptyTitle,
  EmptyDescription,
  EmptyMedia,
} from "~/components/ui/empty";
import type { UnitItemDetailResponseDto } from "~/services/api/units/dto";
import { useUnits } from "./container/unit-query.hooks";

export function clientLoader() {
  return { title: "Đơn vị tính - NOVA" };
}

export default function Units() {
  const { refetch } = useUnits();
  const {
    filteredUnits,
    isPending,
    filters,
    updateFilter,
    resetFilters,
    stats,
    createDialogOpen,
    setCreateDialogOpen,
  } = useUnitsContainer();

  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [selectedUnit, setSelectedUnit] =
    useState<UnitItemDetailResponseDto | null>(null);

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
    <UnitsViewLayout
      filters={filters}
      onFilterChange={updateFilter}
      onResetFilters={resetFilters}
      totalUnits={stats.total}
      activeUnits={stats.active}
      inactiveUnits={stats.inactive}
      onAddUnit={() => setCreateDialogOpen(true)}
    >
      <Card className="flex-1 overflow-hidden shadow-sm">
        <div className="p-6">
          {isPending ? (
            <div className="space-y-4">
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-64 w-full" />
            </div>
          ) : !filteredUnits || filteredUnits.length === 0 ? (
            filters.searchQuery || filters.isActive !== "all" ? (
              <Empty>
                <EmptyHeader>
                  <EmptyMedia variant="icon">
                    <Package />
                  </EmptyMedia>
                  <EmptyTitle>Không tìm thấy kết quả</EmptyTitle>
                  <EmptyDescription>
                    Thử điều chỉnh bộ lọc hoặc thay đổi từ khóa tìm kiếm
                  </EmptyDescription>
                </EmptyHeader>
              </Empty>
            ) : (
              <Empty>
                <EmptyHeader>
                  <EmptyMedia variant="icon">
                    <Package />
                  </EmptyMedia>
                  <EmptyTitle>Chưa có đơn vị tính nào</EmptyTitle>
                  <EmptyDescription>
                    Bắt đầu bằng cách thêm đơn vị tính đầu tiên cho hệ thống
                  </EmptyDescription>
                </EmptyHeader>
              </Empty>
            )
          ) : (
            <DataTable
              columns={columns}
              data={filteredUnits}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          )}
        </div>
      </Card>

      {/* Dialogs */}
      <CreateUnitDialog
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
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
    </UnitsViewLayout>
  );
}
