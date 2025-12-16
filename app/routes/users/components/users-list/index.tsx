import { Users } from "lucide-react";
import { useState } from "react";
import { Button } from "~/components/ui/button";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "~/components/ui/empty";
import { Skeleton } from "~/components/ui/skeleton";
import { AuthLoader } from "~/lib/auth/auth.loader";
import { hasRole } from "~/lib/auth/bouncer";
import { UserRole } from "~/lib/auth/roles";
import type { UserItem } from "~/services/api/user/dto";
import { CreateUserDialog } from "../user-create-dialog";
import { columns } from "./columns";
import { DataTable } from "./data-table";

interface UsersDataTableProps {
  users: UserItem[];
  isLoading?: boolean;
}

function UsersDataTable({ users, isLoading }: UsersDataTableProps) {
  const [openCreateDialog, setOpenCreateDialog] = useState(false);
  if (isLoading) {
    return (
      <div className="flex flex-col gap-2">
        {Array(8)
          .fill(0)
          .map((_, index) => (
            <Skeleton key={index} className="h-10 w-full" />
          ))}
      </div>
    );
  }

  if (!users || users.length === 0) {
    return (
      <div className="h-64 flex items-center justify-center">
        <Empty>
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <Users />
            </EmptyMedia>
            <EmptyTitle>Chưa có tài khoản nào</EmptyTitle>
            <EmptyDescription>
              Bắt đầu bằng cách thêm tài khoản đầu tiên cho hệ thống
            </EmptyDescription>
          </EmptyHeader>
          <EmptyContent>
            {hasRole(AuthLoader.getUser(), UserRole.Admin) && (
              <Button onClick={() => setOpenCreateDialog(true)}>
                Thêm tài khoản
              </Button>
            )}
          </EmptyContent>
        </Empty>
        <CreateUserDialog
          open={openCreateDialog}
          onClose={() => setOpenCreateDialog(false)}
        />
      </div>
    );
  }

  return (
    <div className="container mx-auto ">
      <DataTable columns={columns} data={users} />
    </div>
  );
}

export default UsersDataTable;
