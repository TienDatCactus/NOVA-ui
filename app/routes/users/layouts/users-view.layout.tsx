import type { ReactNode } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { getRoleDisplayName } from "~/services/types/users.types";
import type { UserFilters } from "../container/filter.hooks";
import { useRoles } from "../container/useUsers.hooks";

interface UsersViewLayoutProps {
  children: ReactNode;
  filters: UserFilters;
  updateFilter: <K extends keyof UserFilters>(
    key: K,
    value: UserFilters[K]
  ) => void;
  resetFilters: () => void;
  totalUsers: number;
}

export default function UsersViewLayout({
  children,
  filters,
  updateFilter,
  resetFilters,
  totalUsers,
}: UsersViewLayoutProps) {
  const { data: roles } = useRoles();
  return (
    <div className="flex gap-6 p-4 ">
      <main className="flex-1 space-y-4">
        <div className="flex items-center justify-between">
          <div className="grid gap-2">
            <h1 className="text-3xl font-bold">Quản lý tài khoản</h1>
            <p className="text-sm text-muted-foreground">
              Tổng{" "}
              <span className="font-semibold text-foreground">
                {totalUsers}
              </span>{" "}
              tài khoản
            </p>
          </div>

          <div>
            <Select
              value={filters.roleFilter}
              onValueChange={(value) => updateFilter("roleFilter", value)}
            >
              <SelectTrigger className="shadow-md bg-white w-full">
                <SelectValue placeholder="Chọn vai trò" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả vai trò</SelectItem>
                {roles?.map((role) => (
                  <SelectItem key={role} value={role}>
                    {getRoleDisplayName(role)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        {children}
      </main>
    </div>
  );
}
