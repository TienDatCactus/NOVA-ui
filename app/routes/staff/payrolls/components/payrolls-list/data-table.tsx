import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
  type ColumnDef,
  type ColumnFiltersState,
  type RowSelectionState,
  type SortingState,
  type VisibilityState,
} from "@tanstack/react-table";
import { ChevronDown, Plus, Search } from "lucide-react";
import { useState } from "react";
import { DataTablePagination } from "~/components/table/table-pagination";
import { Button } from "~/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import { Input } from "~/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "~/components/ui/table";
import { AuthLoader } from "~/lib/auth/auth.loader";
import { hasAnyRole } from "~/lib/auth/bouncer";
import { UserRole } from "~/lib/auth/roles";
import GeneratePayrollDialog from "../generate-payroll-dialog";

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  onSuccess?: () => void;
}

export function DataTable<TData, TValue>({
  columns,
  data,
  onSuccess,
}: DataTableProps<TData, TValue>) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [generateDialogOpen, setGenerateDialogOpen] = useState(false);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({
    paidLeaveDaysUsed: false,
    unpaidLeaveDays: false,
    baseSalaryFullMonth: false,
    baseSalaryCalculated: false,
    componentsTotal: false,
    paidAmount: false,
    remainingAmount: false,
    hasUnusedLeavePending: false,
  });
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
    },
    meta: {
      onSuccess,
    },
  });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-2">
        <Input
          startAddon={<Search />}
          placeholder="Tìm theo mã NV, tên NV..."
          value={
            (table.getColumn("staffName")?.getFilterValue() as string) ?? ""
          }
          onChange={(event) =>
            table.getColumn("staffName")?.setFilterValue(event.target.value)
          }
          className="max-w-sm"
        />

        <div className="flex items-center gap-2">
          {hasAnyRole(AuthLoader.getUser(), [UserRole.Accountant]) && (
            <Button onClick={() => setGenerateDialogOpen(true)} size="sm">
              <Plus />
              Thêm bảng lương
            </Button>
          )}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                <ChevronDown className="mr-2 h-4 w-4" />
                Hiển thị cột
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="end"
              className="w-[200px]"
              onCloseAutoFocus={(e) => e.preventDefault()}
            >
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
                    normalWorkDays: "Ngày công thường",
                    holidayWorkDays: "Ngày công lễ",
                    daysInMonth: "Số ngày trong tháng",
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
          <GeneratePayrollDialog
            open={generateDialogOpen}
            onOpenChange={setGenerateDialogOpen}
          />
        </div>
      </div>
      <div className="overflow-hidden rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id} className="h-12">
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext(),
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
                <TableRow key={row.id}>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext(),
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  Không có dữ liệu
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <DataTablePagination table={table} />
    </div>
  );
}
