import { Plus, Upload, Download } from "lucide-react";
import { Button } from "~/components/ui/button";

interface MenuItemsHeaderLayoutProps {
  totalItems: number;
  selectedCount: number;
  onAddItem: () => void;
  onImport: () => void;
  onExport: () => void;
}

export default function MenuItemsHeaderLayout({
  totalItems,
  selectedCount,
  onAddItem,
  onImport,
  onExport,
}: MenuItemsHeaderLayoutProps) {
  return (
    <div className="border-b bg-card">
      <div className="p-6 pb-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Thực đơn</h1>
            <p className="text-muted-foreground mt-1">
              Quản lý món ăn và thức uống
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={onImport}>
              <Upload className="mr-2 h-4 w-4" />
              Import
            </Button>
            <Button variant="outline" size="sm" onClick={onExport}>
              <Download className="mr-2 h-4 w-4" />
              Xuất file
            </Button>
            <Button size="sm" onClick={onAddItem}>
              <Plus className="mr-2 h-4 w-4" />
              Thêm mới
            </Button>
          </div>
        </div>

        {/* Stats */}
        <div className="mt-4 flex items-center gap-6 text-sm">
          <div>
            <span className="text-muted-foreground">Tổng số: </span>
            <span className="font-semibold">{totalItems.toLocaleString()}</span>
          </div>
          {selectedCount > 0 && (
            <div>
              <span className="text-muted-foreground">Đã chọn: </span>
              <span className="font-semibold text-primary">
                {selectedCount}
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
