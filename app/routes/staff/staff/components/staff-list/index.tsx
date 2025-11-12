import { StaffDataTable } from "./data-table";
import { createStaffColumns } from "./columns";
import type { StaffListItem } from "~/services/api/staff/dto";

interface StaffListProps {
  staffs: StaffListItem[];
  isPending?: boolean;
  onEdit?: (staff: StaffListItem) => void;
  onDelete?: (staff: StaffListItem) => void;
  onView?: (staff: StaffListItem) => void;
}

export default function StaffList({
  staffs,
  isPending,
  onEdit,
  onDelete,
  onView,
}: StaffListProps) {
  const columns = createStaffColumns({ onEdit, onDelete, onView });

  return (
    <StaffDataTable columns={columns} data={staffs} isPending={isPending} />
  );
}
