import { BedDouble } from "lucide-react";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "~/components/ui/empty";
import { Skeleton } from "~/components/ui/skeleton";
import type { HolidayListItem } from "~/services/api/holiday/dto";
import { columns } from "./columns";
import { DataTable } from "./data-table";
import { Button } from "~/components/ui/button";
import { useState } from "react";
import CreateHolidayDialog from "../holiday-create-dialog";

interface HolidaysListProps {
  holidays: HolidayListItem[];
  onSuccess?: () => void;
  isLoading?: boolean;
}

export default function HolidaysList({
  holidays,
  isLoading,
}: HolidaysListProps) {
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
  if (!holidays || holidays.length === 0) {
    return (
      <Empty>
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <BedDouble />
          </EmptyMedia>
          <EmptyTitle>Chưa có ngày nghỉ lễ</EmptyTitle>
          <EmptyDescription>
            Bạn chưa có ngày nghỉ lễ nào trong hệ thống. Hãy bắt đầu bằng cách
            thêm ngày nghỉ lễ đầu tiên.
          </EmptyDescription>
        </EmptyHeader>
        <EmptyContent>
          <Button onClick={() => setOpenCreateDialog(true)}>
            Thêm ngày nghỉ lễ
          </Button>
        </EmptyContent>
      </Empty>
    );
  }

  return (
    <div className="container mx-auto ">
      <DataTable columns={columns} data={holidays} />
      <CreateHolidayDialog
        open={openCreateDialog}
        onOpenChange={setOpenCreateDialog}
      />
    </div>
  );
}
