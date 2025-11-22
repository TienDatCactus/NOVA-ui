import type {
  WorkShiftListItem,
  WorkShiftListResponseDto,
} from "~/services/api/staff/work-shift/dto";
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
import { Clock } from "lucide-react";
import { Button } from "~/components/ui/button";
import { useState } from "react";
import CreateWorkShiftDialog from "../work-shift-create-dialog";

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
            <Button onClick={() => setOpenCreateDialog(true)}>
              Thêm ca làm việc
            </Button>
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
