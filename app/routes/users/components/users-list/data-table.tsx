import {
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  useReactTable,
  type ColumnDef,
  type ColumnFiltersState,
  getFilteredRowModel,
} from "@tanstack/react-table";
import { Plus, Search } from "lucide-react";
import { useState } from "react";
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
import type { UserItem } from "~/services/api/user/dto";
import { CreateUserDialog } from "../user-create-dialog";

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  onViewDetail?: (user: UserItem) => void;
  onSuccess?: () => void;
}

export function DataTable<TData, TValue>({
  columns,
  data,
  onViewDetail,
  onSuccess,
}: DataTableProps<TData, TValue>) {
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [openCreateDialog, setOpenCreateDialog] = useState(false);
  const table = useReactTable({
    data,
    columns,
    state: {
      columnFilters,
    },
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    meta: {
      onViewDetail,
      onSuccess,
    },
    getPaginationRowModel: getPaginationRowModel(),
  });

  return (
    <div className="grid gap-2">
      <div className="flex justify-between items-center py-4">
        <Input
          startAddon={<Search />}
          placeholder="Tìm theo tên..."
          value={
            (table.getColumn("fullName")?.getFilterValue() as string) ?? ""
          }
          onChange={(event) =>
            table.getColumn("fullName")?.setFilterValue(event.target.value)
          }
          className="max-w-sm"
        />
        <Button size="sm" onClick={() => setOpenCreateDialog(true)}>
          <Plus />
          Thêm tài khoản
        </Button>
      </div>
      <div className="overflow-hidden rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              {table
                .getHeaderGroups()
                .map((headerGroup) =>
                  headerGroup.headers.map((header) => (
                    <TableHead key={header.id}>
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </TableHead>
                  ))
                )}
            </TableRow>
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  className="hover:bg-muted/30 transition-colors"
                >
                  {row.getVisibleCells().map((cell) => {
                    const isActionsColumn = cell.column.id === "actions";

                    return (
                      <TableCell
                        key={cell.id}
                        className={!isActionsColumn ? "cursor-pointer" : ""}
                        onClick={(e) => {
                          if (!isActionsColumn) {
                            e.stopPropagation();
                            onViewDetail?.(row.original as UserItem);
                          }
                        }}
                      >
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext()
                        )}
                      </TableCell>
                    );
                  })}
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
      <CreateUserDialog
        onClose={() => setOpenCreateDialog(false)}
        open={openCreateDialog}
      />
    </div>
  );
}
