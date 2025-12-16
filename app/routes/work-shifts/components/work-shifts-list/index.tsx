import { Clock } from "lucide-react";
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
import type { WorkShiftListResponseDto } from "~/services/api/work-shift/dto";
import CreateWorkShiftDialog from "../work-shift-create-dialog";
import { columns } from "./columns";
import { DataTable } from "./data-table";
import { hasRole } from "~/lib/auth/bouncer";
import { AuthLoader } from "~/lib/auth/auth.loader";
import { UserRole } from "~/lib/auth/roles";

interface WorkShiftsDataTableProps {
  workShifts: WorkShiftListResponseDto;
  isLoading?: boolean;
}

export default function WorkShiftsDataTable({
  workShifts,
  isLoading,
}: WorkShiftsDataTableProps) {
  const [openCreateDialog, setOpenCreateDialog] = useState(false);
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

  if (!workShifts || workShifts.length === 0) {
    return (
      <>
        <Empty>
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <Clock />
            </EmptyMedia>
            <EmptyTitle>Chưa có ca làm việc nào</EmptyTitle>
            <EmptyDescription>
              Bắt đầu bằng cách thêm ca làm việc đầu tiên cho hệ thống
            </EmptyDescription>
          </EmptyHeader>
          <EmptyContent>
            {hasRole(AuthLoader.getUser(), UserRole.HotelManager) && (
              <Button onClick={() => setOpenCreateDialog(true)}>
                Thêm ca làm việc
              </Button>
            )}
          </EmptyContent>
        </Empty>
        <CreateWorkShiftDialog
          open={openCreateDialog}
          onOpenChange={setOpenCreateDialog}
        />
      </>
    );
  }

  return (
    <div className="container mx-auto ">
      <DataTable columns={columns} data={workShifts} />
    </div>
  );
}
