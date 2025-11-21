import type { ReactNode } from "react";
import { Button } from "~/components/ui/button";
import type { StaffFilters } from "../container/staff/filter.hooks";
import { useStaffRoleList } from "../container/staff-roles/query.hooks";
import StaffFilterSidebar from "../fragments/filter.sidebar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "~/components/ui/popover";

import { ChevronsUpDown, Check } from "lucide-react";
import { cn } from "~/lib/utils";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "~/components/ui/command";

interface StaffViewLayoutProps {
  children: ReactNode;
  filters: StaffFilters;
  onFilterChange: <K extends keyof StaffFilters>(
    key: K,
    value: StaffFilters[K]
  ) => void;
  onResetFilters: () => void;
  totalStaffs: number;
  onCreateStaff?: () => void;
}

export default function StaffViewLayout({
  children,
  filters,
  onFilterChange,
  onResetFilters,
  totalStaffs,
}: StaffViewLayoutProps) {
  const { data: staffRoles, refetch } = useStaffRoleList();
  return (
    <div className="flex gap-6 h-[calc(100vh-4rem)]">
      <div className="w-72 flex-shrink-0">
        <StaffFilterSidebar
          filters={filters}
          onFilterChange={onFilterChange}
          onResetFilters={onResetFilters}
        />
      </div>
      <main className="flex-1 flex flex-col overflow-hidden">
        <div className="flex items-center justify-between mb-6 flex-shrink-0">
          <div>
            <h1 className="text-3xl font-bold">Quản lý nhân sự</h1>
            <p className="text-muted-foreground mt-1">
              Tổng{" "}
              <span className="font-semibold text-foreground">
                {totalStaffs}
              </span>{" "}
              nhân sự
            </p>
          </div>
          <div className="flex items-center gap-2 pr-5">
            <Popover open={open} onOpenChange={setOpen}>
              <PopoverTrigger asChild>
                <Button variant="outline" className="w-[200px] justify-between">
                  {value
                    ? frameworks.find((role) => role.value === value)?.label
                    : "Select role..."}
                  <ChevronsUpDown className="opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-[200px] p-0">
                <Command>
                  <CommandInput placeholder="Search role..." className="h-9" />
                  <CommandList>
                    <CommandEmpty>No framework found.</CommandEmpty>
                    <CommandGroup>
                      {staffRoles?.map((role) => (
                        <CommandItem
                          key={role.id}
                          value={role.id}
                          onSelect={(currentValue) => {
                            setValue(
                              currentValue === value ? "" : currentValue
                            );
                            setOpen(false);
                          }}
                        >
                          {role.label}
                          <Check
                            className={cn(
                              "ml-auto",
                              value === role.value ? "opacity-100" : "opacity-0"
                            )}
                          />
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
          </div>
        </div>
        <div className="flex-1 overflow-auto">{children}</div>
      </main>
    </div>
  );
}
