import { ArrowRight, ImageIcon, MoreHorizontal, Tag } from "lucide-react";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardFooter } from "~/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import Image from "~/components/ui/image";
import { Skeleton } from "~/components/ui/skeleton";
import { cn, formatMoney } from "~/lib/utils";
import { useRoomDetail } from "~/routes/rooms/container/rooms/query.hooks";
import { RoomStatusEnum } from "~/services/api/rooms/room.types";

type RoomCardGridProps = {
  roomId: string;
};

// Helper: Status Colors (Pastel Modern Palette)
const getStatusStyles = (status?: string) => {
  switch (status) {
    case "Ready":
      return "bg-emerald-500/90 text-white hover:bg-emerald-600";
    case "Dirty":
      return "bg-amber-500/90 text-white hover:bg-amber-600";
    case "Occupied":
      return "bg-blue-500/90 text-white hover:bg-blue-600";
    case "Maintenance":
      return "bg-rose-500/90 text-white hover:bg-rose-600";
    default:
      return "bg-slate-500/90 text-white";
  }
};

function RoomCardGrid({ roomId }: RoomCardGridProps) {
  const { data: roomDetail, isPending: isLoadingDetail } = useRoomDetail({
    id: roomId,
  });

  if (isLoadingDetail) {
    return <RoomCardSkeleton />;
  }

  return (
    <Card className="group h-full flex flex-col overflow-hidden border-border/60 bg-card transition-all duration-300 hover:shadow-xl hover:-translate-y-1 hover:border-primary/20 p-0">
      {/* === 1. HERO IMAGE === */}
      <div className="relative aspect-[4/3] overflow-hidden bg-muted">
        {roomDetail?.imageUrls && roomDetail.imageUrls.length > 0 && (
          <Image
            src={roomDetail.imageUrls[0]}
            alt={roomDetail.roomName || "Phòng nghỉ"}
            className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
          />
        )}

        <div className="absolute left-3 top-3">
          <Badge
            className={cn(
              "backdrop-blur-md shadow-sm px-3 py-1 text-[10px] uppercase tracking-widest font-bold border-none",
              getStatusStyles(roomDetail?.status)
            )}
          >
            {RoomStatusEnum[
              roomDetail?.status as keyof typeof RoomStatusEnum
            ] || "Unknown"}
          </Badge>
        </div>

        {/* Context Menu */}
        <div className="absolute right-3 top-3 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                size="icon"
                variant="secondary"
                className="h-8 w-8 rounded-full bg-background/90 backdrop-blur-sm shadow-sm hover:bg-background"
              >
                <MoreHorizontal className="h-4 w-4 text-foreground" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem>Xem chi tiết</DropdownMenuItem>
              <DropdownMenuItem>Cập nhật trạng thái</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <CardContent className="flex flex-1 flex-col px-4 py-2">
        <div className="mb-2 flex items-center gap-1.5 text-primary/80">
          <Tag className="h-3 w-3" />
          <span className="text-[10px] font-bold uppercase tracking-widest">
            {roomDetail?.roomTypeName}
          </span>
        </div>

        <h3 className="line-clamp-2 font-bold text-lg leading-snug text-foreground group-hover:text-primary transition-colors">
          {roomDetail?.roomName}
        </h3>
      </CardContent>

      {/* === 3. FOOTER === */}
      <CardFooter className="p-4 pt-4 flex items-center justify-between border-t border-dashed">
        <div className="flex flex-col">
          <span className="text-[10px] text-muted-foreground font-medium uppercase tracking-wide">
            Giá mỗi đêm
          </span>
          <div className="flex items-baseline">
            <span className="text-xl font-black text-primary font-mono tracking-tight">
              {formatMoney(roomDetail?.dailyPrice || 0).vndFormatted}
            </span>
          </div>
        </div>

        <Button
          size="sm"
          className="rounded-full px-5 shadow-sm transition-transform active:scale-95 bg-foreground text-background hover:bg-primary hover:text-primary-foreground"
        >
          Chọn <ArrowRight className="ml-2 h-3.5 w-3.5" />
        </Button>
      </CardFooter>
    </Card>
  );
}

// Skeleton matched to new layout
function RoomCardSkeleton() {
  return (
    <Card className="h-full overflow-hidden rounded-xl border-border/50 flex flex-col">
      <Skeleton className="aspect-[4/3] w-full" />
      <div className="p-5 flex-1 space-y-3">
        <Skeleton className="h-3 w-20" /> {/* Type */}
        <Skeleton className="h-6 w-3/4" /> {/* Name */}
      </div>
      <div className="p-5 pt-0 flex justify-between items-end">
        <div className="space-y-1.5">
          <Skeleton className="h-2 w-16" />
          <Skeleton className="h-7 w-24" />
        </div>
        <Skeleton className="h-9 w-20 rounded-full" />
      </div>
    </Card>
  );
}

export default RoomCardGrid;
