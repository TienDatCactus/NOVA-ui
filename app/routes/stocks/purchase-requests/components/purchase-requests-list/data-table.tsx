import {
  type ColumnDef,
  type ColumnFiltersState,
  type RowSelectionState,
  type VisibilityState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { Plus, Search, TriangleAlert } from "lucide-react";
import React, { useState } from "react";
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
import type { PurchaseRequestListItemDto } from "~/services/api/stocks/purchase-requests/dto";
import CreatePurchaseRequestDialog from "../create-purchase-request.dialog";
import LowStockDialog from "~/routes/stocks/stock-adjustments/fragments/low-stock.dialog";
import { useLowStockItems } from "~/routes/stocks/items/container/query.hooks";

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
}

export function DataTable<TData extends PurchaseRequestListItemDto, TValue>({
  columns,
  data,
}: DataTableProps<TData, TValue>) {
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    []
  );
  const [openLowStockDialog, setOpenLowStockDialog] = useState(false);
  const [openCreateDialog, setOpenCreateDialog] = useState(false);
  const [prefillLowStockItems, setPrefillLowStockItems] = useState(false);

  const { data: lowStockItems = [] } = useLowStockItems();

  const handleCreateFromLowStock = () => {
    setPrefillLowStockItems(true);
    setOpenCreateDialog(true);
  };

  const handleCreateDialogClose = (open: boolean) => {
    setOpenCreateDialog(open);
    if (!open) {
      setPrefillLowStockItems(false);
    }
  };

  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>({});

  const table = useReactTable({
    data,
    columns,
    state: {
      rowSelection,
      columnFilters,
      columnVisibility,
    },
    onRowSelectionChange: setRowSelection,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onColumnFiltersChange: setColumnFilters,
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    getRowId: (row) => row.id,
  });

  return (
    <div className="grid gap-2">
      <div className="flex items-center justify-between py-4">
        <Input
          startAddon={<Search />}
          placeholder="Tìm theo số phiếu..."
          value={
            (table.getColumn("requestNumber")?.getFilterValue() as string) ?? ""
          }
          onChange={(event) =>
            table.getColumn("requestNumber")?.setFilterValue(event.target.value)
          }
          className="max-w-sm"
        />
        <div className="flex gap-2">
          <Button
            size="sm"
            variant={"warning-outline"}
            onClick={() => setOpenLowStockDialog(true)}
          >
            <TriangleAlert />
            Các mặt hàng sắp hết
          </Button>
          <Button size={"sm"} onClick={() => setOpenCreateDialog(true)}>
            <Plus />
            Tạo yêu cầu mua hàng
          </Button>
        </div>
      </div>
      <div className="overflow-hidden rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id}>
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
              table.getRowModel().rows.map((row) => {
                return (
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
                );
              })
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
      <DataTablePagination table={table} />{" "}
      <LowStockDialog
        onOpenChange={setOpenLowStockDialog}
        open={openLowStockDialog}
        onCreatePurchaseRequest={handleCreateFromLowStock}
      />
      <CreatePurchaseRequestDialog
        open={openCreateDialog}
        onOpenChange={handleCreateDialogClose}
        initialItems={prefillLowStockItems ? lowStockItems : undefined}
      />
    </div>
  );
}
