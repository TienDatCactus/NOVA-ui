import { UserCog } from "lucide-react";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "~/components/ui/empty";
import StaffRolesList from "./staff-roles-list";
import type { StaffRoleItem } from "~/services/api/staff/staff-role/dto";
import { Button } from "~/components/ui/button";
import { useState } from "react";
import CreateRoleDialog from "./create-role.dialog";
import { AuthLoader } from "~/lib/auth/auth.loader";
import { hasRole } from "~/lib/auth/bouncer";
import { UserRole } from "~/lib/auth/roles";

interface StaffRolesListViewProps {
  roles: StaffRoleItem[];
  isLoading: boolean;
}

export default function StaffRolesListView({
  roles,
  isLoading,
}: StaffRolesListViewProps) {
  const [openCreateDialog, setOpenCreateDialog] = useState(false);
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
      <>
        <Empty>
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <UserCog />
            </EmptyMedia>
            <EmptyTitle>Chưa có Chức vụ nhân sự nào.</EmptyTitle>
            <EmptyDescription>
              Tạo Chức vụ đầu tiên để bắt đầu quản lý nhân sự
            </EmptyDescription>
          </EmptyHeader>
          <EmptyContent>
            {hasRole(AuthLoader.getUser(), UserRole.HotelManager) && (
              <Button onClick={() => setOpenCreateDialog(true)}>
                Thêm Chức vụ
              </Button>
            )}
          </EmptyContent>
        </Empty>
        <CreateRoleDialog
          open={openCreateDialog}
          onClose={() => setOpenCreateDialog(false)}
        />
      </>
    );
  }

  return <StaffRolesList data={roles} />;
}
