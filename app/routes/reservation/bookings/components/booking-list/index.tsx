import type { BookingListResponseDto } from "~/services/api/booking/dto";
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
import { FolderCode, ArrowUpRightIcon } from "lucide-react";
import CreateBookingDialog from "~/features/create-booking";
import { Button } from "~/components/ui/button";
import { useState } from "react";

interface BookingListProps {
  bookings: BookingListResponseDto;
  isLoading?: boolean;
  refetch: () => void;
}

function BookingList({ bookings, isLoading, refetch }: BookingListProps) {
  const [open, setOpen] = useState(false);
  if (isLoading) {
    return (
      <div className="flex flex-col gap-2">
        {Array(8)
          .fill(0)
          .map((_, index) => (
            <Skeleton key={index} className="h-8 w-full rounded-sm" />
          ))}
      </div>
    );
  }
  if (bookings?.length === 0) {
    return (
      <Empty>
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <FolderCode />
          </EmptyMedia>
          <EmptyTitle>Chưa có đặt phòng</EmptyTitle>
          <EmptyDescription>
            Bạn chưa có đặt phòng nào. Hãy bắt đầu bằng cách tạo đơn đặt phòng
            đầu tiên.
          </EmptyDescription>
        </EmptyHeader>
        <EmptyContent>
          <div className="flex gap-2">
            <Button onClick={() => setOpen(true)}>Tạo đơn đặt phòng</Button>
            <CreateBookingDialog open={open} close={() => setOpen(false)} />
            <Button variant="outline" onClick={refetch}>
              Tải lại
            </Button>
          </div>
        </EmptyContent>
        <Button
          variant="link"
          asChild
          className="text-muted-foreground"
          size="sm"
        >
          <a href="#">
            Learn More <ArrowUpRightIcon />
          </a>
        </Button>
      </Empty>
    );
  }
  return <DataTable columns={columns} data={bookings!} />;
}

export default BookingList;
