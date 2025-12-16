import type { UnitItemDetailResponseDto } from "~/services/api/units/dto";
import { columns } from "./columns";
import { DataTable } from "./data-table";
import { Skeleton } from "~/components/ui/skeleton";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "~/components/ui/empty";
import { Package } from "lucide-react";
import { Button } from "~/components/ui/button";
import { useState } from "react";
import CreateUnitDialog from "../create-unit.dialog";
import { AuthLoader } from "~/lib/auth/auth.loader";
import { hasRole } from "~/lib/auth/bouncer";
import { UserRole } from "~/lib/auth/roles";

interface UnitsDataTableProps {
  units: UnitItemDetailResponseDto[];
  isLoading?: boolean;
}

function UnitsDataTable({ units, isLoading }: UnitsDataTableProps) {
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  if (isLoading) {
    return (
      <div className="space-y-2">
        {Array(8)
          .fill(0)
          .map((_, index) => (
            <Skeleton key={index} className="h-14 w-full" />
          ))}
      </div>
    );
  }

  if (!units || units.length === 0) {
    return (
      <Empty>
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <Package />
          </EmptyMedia>
          <EmptyTitle>Chưa có đơn vị tính nào</EmptyTitle>
          <EmptyDescription>
            Bắt đầu bằng cách thêm đơn vị tính đầu tiên cho hệ thống
          </EmptyDescription>
        </EmptyHeader>
        <EmptyContent>
          {hasRole(AuthLoader.getUser(), UserRole.HotelManager) && (
            <Button onClick={() => setCreateDialogOpen(true)}>
              Thêm đơn vị tính đầu tiên
            </Button>
          )}
        </EmptyContent>
        <CreateUnitDialog
          open={createDialogOpen}
          onOpenChange={setCreateDialogOpen}
        />
      </Empty>
    );
  }

  return (
    <div className="container mx-auto ">
      <DataTable columns={columns} data={units} />
    </div>
  );
}

export default UnitsDataTable;
