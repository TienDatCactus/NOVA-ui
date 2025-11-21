import type { RowSelectionState } from "@tanstack/react-table";
import { BedDouble } from "lucide-react";
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
import type { RoomTypesListItemDto } from "~/services/api/room-types/dto";
import { DataTable } from "./data-table";
import { columns } from "./columns";

interface RoomTypesTableProps {
  roomTypes: RoomTypesListItemDto[];
  isLoading: boolean;
  onAddRoomType: () => void;
  onSelectionChange?: (selectedRows: RoomTypesListItemDto[]) => void;
}

function RoomTypesDataTable({
  roomTypes,
  isLoading,
  onAddRoomType,
  onSelectionChange,
}: RoomTypesTableProps) {
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

  if (!roomTypes || roomTypes.length === 0) {
    return (
      <Empty>
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <BedDouble />
          </EmptyMedia>
          <EmptyTitle>Chưa có loại phòng</EmptyTitle>
          <EmptyDescription>
            Bạn chưa có loại phòng nào trong hệ thống. Hãy bắt đầu bằng cách
            thêm loại phòng đầu tiên.
          </EmptyDescription>
        </EmptyHeader>
        <EmptyContent>
          <Button onClick={onAddRoomType}>Thêm loại phòng đầu tiên</Button>
        </EmptyContent>
      </Empty>
    );
  }

  return (
    <div className="container mx-auto ">
      <DataTable
        columns={columns}
        data={roomTypes}
        onSelectionChange={onSelectionChange}
      />
    </div>
  );
}

export default RoomTypesDataTable;
