import type { ReactNode } from "react";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import { UserPlus } from "lucide-react";
import UsersCommandBar from "../fragments/command-bar";
import type { UserFilters } from "../container/filter.hooks";

interface UsersViewLayoutProps {
  children: ReactNode;
  filters: UserFilters;
  updateFilter: <K extends keyof UserFilters>(
    key: K,
    value: UserFilters[K]
  ) => void;
  resetFilters: () => void;
  totalUsers: number;
  onAddUser: () => void;
  roles: string[];
}

export default function UsersViewLayout({
  children,
  filters,
  updateFilter,
  resetFilters,
  totalUsers,
  onAddUser,
  roles,
}: UsersViewLayoutProps) {
  return (
    <div className="flex gap-6 p-4 ">
      <UsersCommandBar
        filters={filters}
        updateFilter={updateFilter}
        resetFilters={resetFilters}
        roles={roles}
      />
      <main className="flex-1 space-y-4">
        <div className="mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold">Quản lý tài khoản</h1>
              <Badge variant="secondary" className="text-sm">
                {totalUsers} tài khoản
              </Badge>
            </div>
            <div className="flex items-center gap-2">
              <Button onClick={onAddUser}>
                <UserPlus className="mr-2 h-4 w-4" />
                Thêm tài khoản
              </Button>
            </div>
          </div>
          <p className="text-muted-foreground mt-2">
            Quản lý thông tin và tài khoản người dùng
          </p>
        </div>
        {children}
      </main>
    </div>
  );
}
