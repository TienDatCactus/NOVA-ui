import { type ReactNode } from "react";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { Button } from "~/components/ui/button";
import { Plus } from "lucide-react";

interface POSOrderViewLayoutProps {
  children: ReactNode;
  selectedInvoiceId: string;
  onInvoiceSelect: (invoiceId: string) => void;
}

function POSOrderViewLayout({
  children,
  selectedInvoiceId,
  onInvoiceSelect,
}: POSOrderViewLayoutProps) {
  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Đơn hàng POS</h1>
          <p className="text-sm text-muted-foreground">
            Quản lý đơn hàng thực phẩm và dịch vụ
          </p>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Tạo đơn hàng mới
        </Button>
      </div>

      {/* Filters Section */}
      <div className="flex flex-col gap-4 rounded-lg border bg-card p-4">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {/* Invoice Filter */}
          <div className="space-y-2">
            <Label htmlFor="invoice-filter">Hóa đơn</Label>
            <Input
              id="invoice-filter"
              placeholder="Nhập mã hóa đơn..."
              value={selectedInvoiceId}
              onChange={(e) => onInvoiceSelect(e.target.value)}
            />
          </div>

          {/* Status Filter - TODO: Implement when status filter hook is ready */}
          <div className="space-y-2">
            <Label htmlFor="status-filter">Trạng thái</Label>
            <Select>
              <SelectTrigger id="status-filter">
                <SelectValue placeholder="Tất cả trạng thái" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả</SelectItem>
                <SelectItem value="pending">Đang chờ</SelectItem>
                <SelectItem value="completed">Hoàn thành</SelectItem>
                <SelectItem value="cancelled">Đã hủy</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Date Filter - TODO: Implement date range picker */}
          <div className="space-y-2">
            <Label htmlFor="date-filter">Ngày tạo</Label>
            <Input id="date-filter" type="date" />
          </div>
        </div>

        {/* Filter Actions */}
        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={() => onInvoiceSelect("")}>
            Đặt lại
          </Button>
          <Button>Áp dụng</Button>
        </div>
      </div>

      {/* Content */}
      <main className="rounded-sm">{children}</main>
    </div>
  );
}

export default POSOrderViewLayout;
