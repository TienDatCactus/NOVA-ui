import type { ReactNode } from "react";
import { Label } from "~/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { Switch } from "~/components/ui/switch";
import type { ServiceFilters } from "~/services/api/services/service.types";
import { useServiceTypes } from "../container/service-types/query.hooks";

interface ServicesViewLayoutProps {
  children: ReactNode;
  filters: ServiceFilters;
  updateFilter: <K extends keyof ServiceFilters>(
    key: K,
    value: ServiceFilters[K]
  ) => void;
  resetFilters: () => void;
  totalServices: number;
}

export default function ServicesViewLayout({
  children,
  filters,
  updateFilter,
  resetFilters,
  totalServices,
}: ServicesViewLayoutProps) {
  const { data: serviceTypes } = useServiceTypes();
  return (
    <div className="flex gap-6 p-4 ">
      <div className="flex-1 space-y-4">
        <div className="flex items-center justify-between">
          <div className="grid gap-2">
            <h1 className="text-3xl font-bold ">Quản lý dịch vụ</h1>
            <p className="text-muted-foreground ">
              Tổng{" "}
              <span className="font-semibold text-foreground">
                {totalServices}
              </span>{" "}
              dịch vụ
            </p>
          </div>

          <div className="flex items-center gap-2 w-xs">
            <div className="flex items-center gap-2 flex-1">
              <Label htmlFor="active-filter" className="cursor-pointer ">
                Tất cả dịch vụ
              </Label>
              <Switch
                id="active-filter"
                checked={filters.activeFilter === "active"}
                onCheckedChange={(checked) =>
                  updateFilter("activeFilter", checked ? "active" : "all")
                }
              />
            </div>
            <div>
              <Select
                value={filters.typeCode || ""}
                onValueChange={(value) => updateFilter("typeCode", value)}
              >
                <SelectTrigger className="shadow-md w-full bg-white">
                  <SelectValue placeholder="Chọn loại dịch vụ" />
                </SelectTrigger>
                <SelectContent>
                  {!!serviceTypes &&
                    serviceTypes.length > 0 &&
                    serviceTypes.map((type) => (
                      <SelectItem key={type.id} value={type.code}>
                        {type.name}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
        <main className="flex-1">{children}</main>
      </div>
    </div>
  );
}
