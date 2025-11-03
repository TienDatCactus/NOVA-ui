import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { RadioGroup, RadioGroupItem } from "~/components/ui/radio-group";
import { Search } from "lucide-react";
import { Separator } from "~/components/ui/separator";

interface UnitsFilterSidebarProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  statusFilter: "all" | "active" | "inactive";
  setStatusFilter: (status: "all" | "active" | "inactive") => void;
}

export default function UnitsFilterSidebar({
  searchQuery,
  setSearchQuery,
  statusFilter,
  setStatusFilter,
}: UnitsFilterSidebarProps) {
  return (
    <div className="w-64 space-y-6 border-r bg-card p-6">
      {/* Search */}
      <div className="space-y-2">
        <Label className="text-sm font-medium">Tìm kiếm</Label>
        <div className="relative">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Theo mã, tên hàng"
            className="pl-9"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      <Separator />

      {/* Status Filter */}
      <div className="space-y-3">
        <Label className="text-sm font-medium">Trạng thái</Label>
        <RadioGroup value={statusFilter} onValueChange={setStatusFilter}>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="all" id="all" />
            <Label htmlFor="all" className="font-normal cursor-pointer">
              Tất cả
            </Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="active" id="active" />
            <Label htmlFor="active" className="font-normal cursor-pointer">
              Đang hoạt động
            </Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="inactive" id="inactive" />
            <Label htmlFor="inactive" className="font-normal cursor-pointer">
              Ngừng hoạt động
            </Label>
          </div>
        </RadioGroup>
      </div>
    </div>
  );
}
