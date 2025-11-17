import {
  flexRender,
  getCoreRowModel,
  useReactTable,
  getSortedRowModel,
  type SortingState,
  type ColumnDef,
  type VisibilityState,
} from "@tanstack/react-table";
import { useState } from "react";
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

export function DataTable<TData, TValue>({
  columns,
  data,
  onSuccess,
  onRowClick,
}: DataTableProps<TData, TValue>) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({
    // Default visible columns
    select: true,
    index: true,
    staffCode: true,
    staffName: true,
    workDays: true,
    totalAmount: true,
    locked: true,
    actions: true,
    // Hidden by default
    paidLeaveDaysUsed: false,
    unpaidLeaveDays: false,
    baseSalaryFullMonth: false,
    baseSalaryCalculated: false,
    componentsTotal: false,
    paidAmount: false,
    remainingAmount: false,
  });

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
          <DropdownMenuContent align="end" className="w-[200px]">
            {table
              .getAllColumns()
              .filter((column) => column.getCanHide())
              .map((column) => {
                const columnLabels: Record<string, string> = {
                  index: "STT",
                  staffCode: "Mã nhân viên",
                  staffName: "Tên nhân viên",
                  workDays: "Ngày công",
                  paidLeaveDaysUsed: "Phép có lương",
                  unpaidLeaveDays: "Phép không lương",
                  baseSalaryFullMonth: "Lương tháng đầy đủ",
                  baseSalaryCalculated: "Lương cơ bản",
                  componentsTotal: "Phụ cấp/Khấu trừ",
                  totalAmount: "Tổng lương",
                  hasUnusedLeavePending: "Xử lý phép dư",
                  paidAmount: "Đã trả",
                  remainingAmount: "Còn lại",
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
