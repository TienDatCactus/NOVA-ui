import { Plus } from "lucide-react";
import { Button } from "~/components/ui/button";

interface RoomsHeaderProps {
  totalRooms: number;
  onAddRoom: () => void;
}

function RoomsHeader({ totalRooms, onAddRoom }: RoomsHeaderProps) {
  return (
    <div className="flex items-center justify-between mb-6">
      <div>
        <h1 className="text-3xl font-bold">Quản lý phòng</h1>
        <p className="text-muted-foreground mt-1">
          Tổng{" "}
          <span className="font-semibold text-foreground">{totalRooms}</span>{" "}
          phòng
        </p>
      </div>
      <div className="flex items-center gap-2">
        <Button onClick={onAddRoom} className="gap-2">
          <Plus className="h-4 w-4" />
          Thêm phòng
        </Button>
      </div>
    </div>
  );
}

export default RoomsHeader;
