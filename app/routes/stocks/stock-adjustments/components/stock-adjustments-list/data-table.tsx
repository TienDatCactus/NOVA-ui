import { Plus, Search } from "lucide-react";
import { useState } from "react";
import {
  useReactTable,
  getCoreRowModel,
  getPaginationRowModel,
  getFilteredRowModel,
  type ColumnDef,
  type ColumnFiltersState,
  type RowSelectionState,
  flexRender,
} from "@tanstack/react-table";
import { DataTablePagination } from "~/components/table/table-pagination";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "~/components/ui/table";
import type { StockAdjustmentListItemDto } from "~/services/api/stocks/stock-adjustments/dto";
import CreateStockAdjustmentDialog from "../create-stock-adjustment.dialog";

interface DataTableProps<TData extends StockAdjustmentListItemDto, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
}

export function DataTable<TData extends StockAdjustmentListItemDto, TValue>({
  columns,
  data,
}: DataTableProps<TData, TValue>) {
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [openCreateDialog, setOpenCreateDialog] = useState(false);

  const table = useReactTable({
    data,
    columns,
    state: {
      rowSelection,
      columnFilters,
    },
    onRowSelectionChange: setRowSelection,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnFiltersChange: setColumnFilters,
    getRowId: (row) => row.id,
  });

  return (
    <div className="grid gap-2">
      {/* Toolbar */}
      <div className="flex items-center justify-between py-4">
        <Input
          startAddon={<Search />}
          placeholder="Tìm theo mã phiếu, lý do..."
          value={
            (table.getColumn("reference")?.getFilterValue() as string) ?? ""
          }
          onChange={(e) =>
            table.getColumn("reference")?.setFilterValue(e.target.value)
          }
          className="max-w-sm"
        />
        <Button size="sm" onClick={() => setOpenCreateDialog(true)}>
          <Plus />
          Tạo phiếu mới
        </Button>
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
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

      <CreateStockAdjustmentDialog
        open={openCreateDialog}
        onOpenChange={setOpenCreateDialog}
      />
    </div>
  );
}
