import { Button } from "~/components/ui/button";
import { Plus } from "lucide-react";

interface HeaderLayoutProps {
  onCreateClick: () => void;
}

export default function HeaderLayout({ onCreateClick }: HeaderLayoutProps) {
  return (
    <div className="flex items-center justify-between">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Ngày nghỉ lễ</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Quản lý các ngày nghỉ lễ trong khách sạn
        </p>
      </div>
      <Button onClick={onCreateClick} className="gap-2">
        <Plus className="h-4 w-4" />
        Thêm ngày nghỉ
      </Button>
    </div>
  );
}
