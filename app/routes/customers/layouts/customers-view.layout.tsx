import type { ReactNode } from "react";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import { UserPlus } from "lucide-react";
import CustomersCommandBar from "../fragments/command-bar";
import type { CustomerFilters } from "../container/filter.hooks";

interface CustomersViewLayoutProps {
  children: ReactNode;
  filters: CustomerFilters;
  updateFilter: <K extends keyof CustomerFilters>(
    key: K,
    value: CustomerFilters[K]
  ) => void;
  resetFilters: () => void;
  totalCustomers: number;
  onAddCustomer: () => void;
  roles: string[];
}

export default function CustomersViewLayout({
  children,
  filters,
  updateFilter,
  resetFilters,
  totalCustomers,
  onAddCustomer,
  roles,
}: CustomersViewLayoutProps) {
  return (
    <div className="flex gap-6">
      <CustomersCommandBar
        filters={filters}
        updateFilter={updateFilter}
        resetFilters={resetFilters}
        roles={roles}
      />
      <main className="flex-1 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold">Quản lý tài khoản</h1>
              <Badge variant="secondary">{totalCustomers} tài khoản</Badge>
            </div>
            <p className="text-sm text-muted-foreground mt-1">
              Quản lý thông tin và tài khoản người dùng
            </p>
          </div>
          <Button onClick={onAddCustomer}>
            <UserPlus className="mr-2 h-4 w-4" />
            Thêm tài khoản
          </Button>
        </div>
        {children}
      </main>
    </div>
  );
}
