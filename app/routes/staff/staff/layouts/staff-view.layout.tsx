import type { ReactNode } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import type { StaffListParams } from "~/services/api/staff/staff/staff.types";
import { useStaffRoleList } from "../../staff-role/container/query.hooks";
import { RotateCcw } from "lucide-react";
import { Button } from "~/components/ui/button";

interface StaffViewLayoutProps {
  children: ReactNode;
  totalStaffs: number;
  filters: StaffListParams;
  onFilterChange: <K extends keyof StaffListParams>(
    key: K,
    value: StaffListParams[K]
  ) => void;
  onResetFilters: () => void;
}

export default function StaffViewLayout({
  children,
  totalStaffs,
  filters,
  onFilterChange,
  onResetFilters,
}: StaffViewLayoutProps) {
  const { data: roles } = useStaffRoleList();
  return (
    <div className="flex gap-6 p-4">
      <div className="flex-1 space-y-4">
        <div className="flex items-center justify-between">
          <div className="grid gap-2">
            <h1 className="text-3xl font-bold">Quản lý nhân sự</h1>
            <p className="text-muted-foreground">
              Tổng{" "}
              <span className="font-semibold text-foreground">
                {totalStaffs}
              </span>{" "}
              nhân sự
            </p>
          </div>
          <div className="flex items-center gap-2">
            <div>
              <Select
                value={filters.gender}
                onValueChange={(value) =>
                  onFilterChange("gender", value as any)
                }
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Lọc theo giới tính" />
                </SelectTrigger>
                <SelectContent>
                  {[
                    {
                      label: "Nam",
                      value: "Male",
                    },
                    {
                      label: "Nữ",
                      value: "Female",
                    },
                    {
                      label: "Khác",
                      value: "Other",
                    },
                  ].map((gender) => (
                    <SelectItem key={gender.value} value={gender.value}>
                      {gender.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Select
                value={filters.role}
                onValueChange={(value) => onFilterChange("role", value as any)}
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Lọc theo chức vụ" />
                </SelectTrigger>
                <SelectContent>
                  {roles?.map((role) => (
                    <SelectItem key={role.id} value={role.name}>
                      {role.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Button size="sm" variant="outline" onClick={onResetFilters}>
              <RotateCcw />
            </Button>
          </div>
        </div>
        <main className="flex-1 ">{children}</main>
      </div>
    </div>
  );
}
