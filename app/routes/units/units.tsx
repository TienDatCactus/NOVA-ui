import { useMemo, useState } from "react";
import { DataTable } from "./components/data-table";
import { columns } from "./components/columns";
import CreateUnitDialog from "./components/create-unit.dialog";
import EditUnitDialog from "./components/edit-unit.dialog";
import DeleteUnitDialog from "./components/delete-unit.dialog";
import UnitsFilterSidebar from "./components/units-filter-sidebar";
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
import { useUnits } from "./container/unit-query.hooks";

export function clientLoader() {
  return { title: "Đơn vị tính - NOVA" };
}

export default function Units() {
  const { data, isPending, refetch } = useUnits();
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [selectedUnit, setSelectedUnit] =
    useState<UnitItemDetailResponseDto | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<
    "all" | "active" | "inactive"
  >("all");

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

  // Filter and search
  const filteredData = useMemo(() => {
    if (!data) return [];

    return data.filter((unit) => {
      // Filter by status
      if (statusFilter === "active" && !unit.active) return false;
      if (statusFilter === "inactive" && unit.active) return false;

      // Filter by search query
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        return (
          unit.code.toLowerCase().includes(query) ||
          unit.name.toLowerCase().includes(query)
        );
      }

      return true;
    });
  }, [data, statusFilter, searchQuery]);

  const activeCount = data?.filter((u) => u.active).length || 0;
  const inactiveCount = data?.filter((u) => !u.active).length || 0;

  return (
    <div className="flex h-full flex-col gap-6 p-8">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight">Đơn vị tính</h1>
          <p className="text-sm text-muted-foreground">
            Quản lý các đơn vị tính cho sản phẩm
          </p>
        </div>
        <Button onClick={() => setShowCreateDialog(true)} size="default">
          <Plus className="mr-2 h-4 w-4" />
          Thêm đơn vị
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <div className="rounded-lg border bg-card p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-sm font-medium text-muted-foreground">
                Tổng đơn vị
              </p>
              <p className="text-2xl font-bold">{data?.length || 0}</p>
            </div>
            <div className="rounded-full bg-primary/10 p-3">
              <Package className="h-5 w-5 text-primary" />
            </div>
          </div>
        </div>

        <div className="rounded-lg border bg-card p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-sm font-medium text-muted-foreground">
                Đang hoạt động
              </p>
              <p className="text-2xl font-bold text-green-600">{activeCount}</p>
            </div>
            <div className="rounded-full bg-green-100 p-3 dark:bg-green-900/20">
              <div className="h-5 w-5 rounded-full bg-green-600" />
            </div>
          </div>
        </div>

        <div className="rounded-lg border bg-card p-6 shadow-sm sm:col-span-2 lg:col-span-1">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-sm font-medium text-muted-foreground">
                Ngừng hoạt động
              </p>
              <p className="text-2xl font-bold text-gray-600">
                {inactiveCount}
              </p>
            </div>
            <div className="rounded-full bg-gray-100 p-3 dark:bg-gray-800">
              <div className="h-5 w-5 rounded-full bg-gray-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Content with Sidebar */}
      <div className="flex flex-1 gap-6 overflow-hidden">
        {/* Left Sidebar - Filter */}
        <UnitsFilterSidebar
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          statusFilter={statusFilter}
          setStatusFilter={setStatusFilter}
        />

        {/* Main Content */}
        <div className="flex-1 overflow-hidden rounded-lg border bg-card shadow-sm">
          {/* Table Content */}
          <div className="p-6">
            {isPending ? (
              <div className="space-y-4">
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
            ) : filteredData.length === 0 ? (
              <Empty>
                <EmptyHeader>
                  <EmptyMedia variant="icon">
                    <Package />
                  </EmptyMedia>
                  <EmptyTitle>Không tìm thấy kết quả</EmptyTitle>
                  <EmptyDescription>
                    Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm
                  </EmptyDescription>
                </EmptyHeader>
              </Empty>
            ) : (
              <DataTable
                columns={columns}
                data={filteredData}
                onEdit={handleEdit}
                onDelete={handleDelete}
              />
            )}
          </div>
        </div>
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
