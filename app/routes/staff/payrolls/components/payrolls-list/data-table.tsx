import {
  flexRender,
  getCoreRowModel,
  useReactTable,
  getSortedRowModel,
  type SortingState,
  type ColumnDef,
  type VisibilityState,
} from "@tanstack/react-table";
import { useState, useEffect } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "~/components/ui/table";
import { Button } from "~/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import { ChevronDown } from "lucide-react";

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  onSuccess?: () => void;
  onRowClick?: (row: TData) => void;
}

const STORAGE_KEY = "payroll-column-visibility";

const getDefaultColumnVisibility = (): VisibilityState => {
  // Try to load from localStorage
  if (typeof window !== "undefined") {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (error) {
        console.error("Failed to parse saved column visibility:", error);
      }
    }
  }

  // Default visible columns
  return {
    select: true,
    index: true,
    staffCode: true,
    staffName: true,
    workDays: true,
    totalAmount: true,
    remainingAmount: true,
    locked: true,
    actions: true,
    // Hidden by default
    paidLeaveDaysUsed: false,
    unpaidLeaveDays: false,
    assignedDays: false,
    baseSalaryFullMonth: false,
    baseSalaryCalculated: false,
    componentsTotal: false,
    paidAmount: false,
  };
};

export function DataTable<TData, TValue>({
  columns,
  data,
  onSuccess,
  onRowClick,
}: DataTableProps<TData, TValue>) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>(
    getDefaultColumnVisibility()
  );

  // Save column visibility to localStorage whenever it changes
  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(columnVisibility));
    }
  }, [columnVisibility]);

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    onSortingChange: setSorting,
    onColumnVisibilityChange: setColumnVisibility,
    state: {
      sorting,
      columnVisibility,
    },
    meta: {
      onSuccess,
    },
  });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="text-sm text-muted-foreground">
          {table.getFilteredRowModel().rows.length} bản ghi
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm">
              <ChevronDown className="mr-2 h-4 w-4" />
              Hiển thị cột
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-[200px]" onCloseAutoFocus={(e) => e.preventDefault()}>
            {table
              .getAllColumns()
              .filter((column) => column.getCanHide())
              .map((column) => {
                const columnLabels: Record<string, string> = {
                  index: "STT",
                  staffCode: "Mã nhân viên",
                  staffName: "Tên nhân viên",
                  assignedDays: "Ngày công định mức",
                  workDays: "Ngày công thực tế",
                  paidLeaveDaysUsed: "Phép có lương",
                  unpaidLeaveDays: "Phép không lương",
                  baseSalaryFullMonth: "Lương cơ bản (tháng đủ)",
                  baseSalaryCalculated: "Lương cơ bản tính theo công",
                  componentsTotal: "Phụ cấp/Khấu trừ",
                  totalAmount: "Tổng thu nhập kỳ này",
                  hasUnusedLeavePending: "Còn ngày dư chưa xử lý",
                  paidAmount: "Đã thanh toán",
                  remainingAmount: "Còn phải trả",
                  locked: "Trạng thái",
                };
                return (
                  <DropdownMenuCheckboxItem
                    key={column.id}
                    className="capitalize"
                    checked={column.getIsVisible()}
                    onCheckedChange={(value) =>
                      column.toggleVisibility(!!value)
                    }
                    onSelect={(e) => e.preventDefault()}
                  >
                    {columnLabels[column.id] || column.id}
                  </DropdownMenuCheckboxItem>
                );
              })}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      <div className="rounded-md border">
        <Table>
        <TableHeader>
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id} className="hover:bg-transparent">
              {headerGroup.headers.map((header) => {
                return (
                  <TableHead key={header.id} className="h-12">
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                  </TableHead>
                );
              })}
            </TableRow>
          ))}
        </TableHeader>
        <TableBody>
          {table.getRowModel().rows?.length ? (
            table.getRowModel().rows.map((row) => (
              <TableRow
                key={row.id}
                data-state={row.getIsSelected() && "selected"}
                className="cursor-pointer"
                onClick={(e) => {
                  // Don't trigger row click if clicking on checkbox, actions, or inside dialog/popover
                  const target = e.target as HTMLElement;
                  const isCheckbox = target.closest('[type="checkbox"]');
                  const isButton = target.closest('button');
                  const isInput = target.closest('input');
                  const isDialog = target.closest('[role="dialog"]');
                  const isDropdown = target.closest('[role="menu"]');
                  
                  if (!isCheckbox && !isButton && !isInput && !isDialog && !isDropdown && onRowClick) {
                    onRowClick(row.original);
                  }
                }}
              >
                {row.getVisibleCells().map((cell) => (
                  <TableCell key={cell.id}>
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                ))}
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={columns.length} className="h-24 text-center">
                Không có dữ liệu
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
      </div>
    </div>
  );
}
