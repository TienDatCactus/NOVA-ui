import { DataTable } from "./data-table";
import { columns } from "./columns";
import type { HolidayListItem } from "~/services/api/holiday/dto";
import { Loader2 } from "lucide-react";

interface HolidaysListProps {
  holidays: HolidayListItem[];
  onSuccess?: () => void;
  isLoading?: boolean;
}

export default function HolidaysList({
  holidays,
  onSuccess,
  isLoading,
}: HolidaysListProps) {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="w-full">
      <DataTable columns={columns} data={holidays} onSuccess={onSuccess} />
    </div>
  );
}
