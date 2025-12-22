import { format } from "date-fns";
import { Calendar as CalendarIcon, X } from "lucide-react";
import { Button } from "~/components/ui/button";
import { Calendar } from "~/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "~/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { cn } from "~/lib/utils";

interface TransactionFiltersProps {
  fromDate: Date | undefined;
  toDate: Date | undefined;
  transactionType: string;
  sourceType: string | undefined;
  onFromDateChange: (date: Date | undefined) => void;
  onToDateChange: (date: Date | undefined) => void;
  onTransactionTypeChange: (value: string) => void;
  onSourceTypeChange: (value: string) => void;
  onClearFilters: () => void;
}

export function TransactionFilters({
  fromDate,
  toDate,
  transactionType,
  sourceType,
  onFromDateChange,
  onToDateChange,
  onTransactionTypeChange,
  onSourceTypeChange,
  onClearFilters,
}: TransactionFiltersProps) {
  return (
    <div className="flex flex-wrap gap-4 items-end">
      {/* From Date */}
      <div className="flex flex-col gap-2">
        <label className="text-sm font-medium text-muted-foreground">
          Từ ngày
        </label>
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className={cn(
                "w-[200px] justify-start text-left font-normal",
                !fromDate && "text-muted-foreground"
              )}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {fromDate ? format(fromDate, "dd/MM/yyyy") : "Chọn ngày"}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0">
            <Calendar
              mode="single"
              selected={fromDate}
              onSelect={onFromDateChange}
            />
          </PopoverContent>
        </Popover>
      </div>

      {/* To Date */}
      <div className="flex flex-col gap-2">
        <label className="text-sm font-medium text-muted-foreground">
          Đến ngày
        </label>
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className={cn(
                "w-[200px] justify-start text-left font-normal",
                !toDate && "text-muted-foreground"
              )}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {toDate ? format(toDate, "dd/MM/yyyy") : "Chọn ngày"}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0">
            <Calendar
              mode="single"
              selected={toDate}
              onSelect={onToDateChange}
            />
          </PopoverContent>
        </Popover>
      </div>

      {/* Transaction Type */}
      <div className="flex flex-col gap-2">
        <label className="text-sm font-medium text-muted-foreground">
          Loại giao dịch
        </label>
        <Select value={transactionType} onValueChange={onTransactionTypeChange}>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Tất cả" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tất cả</SelectItem>
            <SelectItem value="OpeningBalance">Tồn đầu kỳ</SelectItem>
            <SelectItem value="PurchaseIn">Nhập hàng</SelectItem>
            <SelectItem value="ConsumptionOut">Xuất tiêu thụ</SelectItem>
            <SelectItem value="AdjustmentIn">Điều chỉnh +</SelectItem>
            <SelectItem value="AdjustmentOut">Điều chỉnh -</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Source Type */}
      <div className="flex flex-col gap-2">
        <label className="text-sm font-medium text-muted-foreground">
          Nguồn
        </label>
        <Select value={sourceType} onValueChange={onSourceTypeChange}>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Tất cả" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tất cả</SelectItem>
            <SelectItem value="Manual">Thủ công</SelectItem>
            <SelectItem value="PosOrder">Đơn hàng POS</SelectItem>
            <SelectItem value="PurchaseRequest">Yêu cầu mua hàng</SelectItem>
            <SelectItem value="StockAdjustment">Điều chỉnh kho</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Clear Filters */}
      <Button
        variant="outline"
        size="icon"
        onClick={onClearFilters}
        title="Xóa bộ lọc"
      >
        <X className="h-4 w-4" />
      </Button>
    </div>
  );
}
