import { UserCog } from "lucide-react";
import {
  Empty,
  EmptyDescription,
  EmptyMedia,
  EmptyTitle,
} from "~/components/ui/empty";
import StaffRolesList from "./staff-roles-list";
import type { StaffRoleItem } from "~/services/api/staff/staff-role/dto";

interface StaffRolesListViewProps {
  roles: StaffRoleItem[];
  isLoading: boolean;
}

export default function StaffRolesListView({
  roles,
  isLoading,
}: StaffRolesListViewProps) {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="mb-4 inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent"></div>
          <p className="text-sm text-muted-foreground">Đang tải...</p>
        </div>
      </div>
    );
  }

  if (!roles || roles.length === 0) {
    return (
      <Empty>
        <EmptyMedia variant="icon">
          <UserCog />
        </EmptyMedia>
        <EmptyTitle>Chưa có vai trò nhân sự nào.</EmptyTitle>
        <EmptyDescription>
          Tạo vai trò đầu tiên để bắt đầu quản lý nhân sự
        </EmptyDescription>
      </Empty>
    );
  }

  return <StaffRolesList data={roles} />;
}
