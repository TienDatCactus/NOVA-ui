import type { ReactNode } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import type { UserFilters } from "../container/filter.hooks";
import { useRoles } from "../container/query.hooks";
import { Button } from "~/components/ui/button";
import { ROLE_LABELS } from "~/lib/auth/roles";

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

          <div className="flex items-center gap-2">
            <Select
              value={filters.roleFilter}
              onValueChange={(value) => updateFilter("roleFilter", value)}
            >
              <SelectTrigger className="shadow-md bg-background w-full">
                <SelectValue placeholder="Chọn vai trò" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả vai trò</SelectItem>
                {roles?.map((role) => (
                  <SelectItem key={role} value={role}>
                    {ROLE_LABELS[role as keyof typeof ROLE_LABELS] || role}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button variant="outline" onClick={resetFilters}>
              Đặt lại bộ lọc
            </Button>
          </div>
        </div>
        {children}
      </main>
    </div>
  );
}
