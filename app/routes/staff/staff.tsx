import { useState } from "react";
import StaffViewLayout from "./layouts/staff-view.layout";
import StaffList from "./components/staff-list";
import StaffDialog from "./components/staff-dialog";
import StaffUpdateDialog from "./components/staff-update-dialog";
import StaffDetailDialog from "./components/staff-detail-dialog";
import StaffDeleteDialog from "./components/staff-delete-dialog";
import { useStaffContainer } from "./container/container.hooks";
import type { StaffListItem, StaffDetailItem } from "~/services/api/staff/dto";
import { toast } from "sonner";
import { StaffService } from "~/services/api/staff";

export default function StaffPage() {
  const {
    staffs,
    totalStaffs,
    filters,
    isPending,
    isError,
    error,
    refetch,
    onFilterChange,
    onResetFilters,
  } = useStaffContainer();

  const [staffToDelete, setStaffToDelete] = useState<StaffListItem | null>(
    null
  );
  const [isDeleting, setIsDeleting] = useState(false);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isUpdateDialogOpen, setIsUpdateDialogOpen] = useState(false);
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false);
  const [staffToEdit, setStaffToEdit] = useState<StaffDetailItem | undefined>(
    undefined
  );
  const [staffIdToView, setStaffIdToView] = useState<string>("");

  const handleCreateStaff = () => {
    setIsCreateDialogOpen(true);
  };

  const handleEditStaff = async (staff: StaffListItem) => {
    try {
      const response = await StaffService.getStaffById(staff.id);
      setStaffToEdit(response.data);
      setIsUpdateDialogOpen(true);
    } catch (error) {
      console.error("Error fetching staff detail:", error);
    }
  };

  const handleViewStaff = (staff: StaffListItem) => {
    setStaffIdToView(staff.id);
    setIsDetailDialogOpen(true);
  };

  const handleDeleteStaff = (staff: StaffListItem) => {
    setStaffToDelete(staff);
  };

  const confirmDelete = async () => {
    if (!staffToDelete) return;

    setIsDeleting(true);
    try {
      await StaffService.deleteStaff(staffToDelete.id);
      toast.success(`Đã xóa nhân sự ${staffToDelete.fullName}`);
      setStaffToDelete(null);
      refetch();
    } catch (error) {
      console.error("Delete staff error:", error);
      toast.error("Không thể xóa nhân sự. Vui lòng thử lại.");
    } finally {
      setIsDeleting(false);
    }
  };

  if (isError) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-destructive mb-2">
            Có lỗi xảy ra
          </h2>
          <p className="text-muted-foreground mb-4">
            {error instanceof Error ? error.message : "Không thể tải dữ liệu"}
          </p>
          <button
            onClick={() => refetch()}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-md"
          >
            Thử lại
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      <StaffViewLayout
        filters={filters}
        onFilterChange={onFilterChange}
        onResetFilters={onResetFilters}
        totalStaffs={totalStaffs}
        onCreateStaff={handleCreateStaff}
      >
        <StaffList
          staffs={staffs}
          isPending={isPending}
          onEdit={handleEditStaff}
          onDelete={handleDeleteStaff}
          onView={handleViewStaff}
        />
      </StaffViewLayout>

      {/* Create Staff Dialog */}
      <StaffDialog
        open={isCreateDialogOpen}
        onOpenChange={setIsCreateDialogOpen}
        onSuccess={() => {
          refetch();
        }}
      />

      {/* Update Staff Dialog */}
      {staffToEdit && (
        <StaffUpdateDialog
          open={isUpdateDialogOpen}
          onOpenChange={setIsUpdateDialogOpen}
          staff={staffToEdit}
          onSuccess={() => {
            refetch();
            setStaffToEdit(undefined);
          }}
        />
      )}

      {/* Detail Staff Dialog */}
      <StaffDetailDialog
        open={isDetailDialogOpen}
        onOpenChange={setIsDetailDialogOpen}
        staffId={staffIdToView}
      />

      {/* Delete Confirmation Dialog */}
      <StaffDeleteDialog
        open={!!staffToDelete}
        onOpenChange={(open) => !open && setStaffToDelete(null)}
        staff={staffToDelete}
        onConfirm={confirmDelete}
        isDeleting={isDeleting}
      />
    </>
  );
}
