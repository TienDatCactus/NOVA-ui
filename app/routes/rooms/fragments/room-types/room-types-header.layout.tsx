import { Button } from "~/components/ui/button";
import { Badge } from "~/components/ui/badge";
import { Plus, Download } from "lucide-react";

interface RoomTypesHeaderProps {
  totalRoomTypes: number;
  onAddRoomType: () => void;
}

export function RoomTypesHeader({
  totalRoomTypes,
  onAddRoomType,
}: RoomTypesHeaderProps) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-3">
        <h1 className="text-2xl font-bold">Quản lý hạng phòng</h1>
        <Badge variant="secondary" className="text-sm">
          {totalRoomTypes} hạng phòng
        </Badge>
      </div>
      <div className="flex items-center gap-2">
        <Button variant="outline">
          <Download className="mr-2 h-4 w-4" />
          Xuất CSV
        </Button>
        <Button onClick={onAddRoomType}>
          <Plus className="mr-2 h-4 w-4" />
          Thêm hạng phòng
        </Button>
      </div>
    </div>
  );
}
