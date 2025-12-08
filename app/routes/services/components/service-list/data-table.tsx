import {
  type ColumnDef,
  type ColumnFiltersState,
  type RowSelectionState,
  flexRender,
  getCoreRowModel,
  getExpandedRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { useState } from "react";
import { Plus, Search } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "~/components/ui/table";
import type { ServiceItem } from "~/services/api/services/dto";
import ServiceDetailRow from "../../fragments/services/detail.row";
import { DataTablePagination } from "~/components/table/table-pagination";
import { Input } from "~/components/ui/input";
import { Button } from "~/components/ui/button";
import CreateServiceTypeDialog from "../create-service-type.dialog";
import CreateServiceDialog from "../create-service.dialog";
import { useAuth } from "~/lib/auth/components";
import { RouteModule } from "~/lib/auth/roles";

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  onSelectionChange?: (selectedRows: TData[]) => void;
}

export function DataTable<TData extends ServiceItem, TValue>({
  columns,
  data,
  onSelectionChange,
}: DataTableProps<TData, TValue>) {
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const { can } = useAuth();
  const [open, setOpen] = useState(false);
  const table = useReactTable({
    data,
    columns,
    state: {
      rowSelection,
      columnFilters,
    },
    onRowSelectionChange: setRowSelection,
    onColumnFiltersChange: setColumnFilters,
    getFilteredRowModel: getFilteredRowModel(),
    getExpandedRowModel: getExpandedRowModel(),
    getCoreRowModel: getCoreRowModel(),
    getRowCanExpand: (row) => true,
    getRowId: (row) => row.serviceItemId,
    getPaginationRowModel: getPaginationRowModel(),
  });

  return (
    <div className="grid gap-2">
      <div className="flex items-center justify-between py-4">
        <Input
          startAddon={<Search />}
          placeholder="Tìm theo tên dịch vụ..."
          value={(table.getColumn("name")?.getFilterValue() as string) ?? ""}
          onChange={(event) =>
            table.getColumn("name")?.setFilterValue(event.target.value)
          }
          className="max-w-sm"
        />
        {can.create(RouteModule.Services) && (
          <Button onClick={() => setOpen(true)} size={"sm"}>
            <Plus className="h-4 w-4 " />
            Thêm dịch vụ
          </Button>
        )}
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
              table.getRowModel().rows.map((row) => (
                <>
                  <TableRow
                    key={row.id}
                    data-state={row.getIsSelected() && "selected"}
                    className="h-16"
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
                  {row.getIsExpanded() && (
                    <TableRow>
                      <TableCell colSpan={columns.length} className="p-0">
                        <ServiceDetailRow service={row.original} />
                      </TableCell>
                    </TableRow>
                  )}
                </>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center text-muted-foreground"
                >
                  Không có dữ liệu
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <DataTablePagination table={table} />
      <CreateServiceDialog onClose={() => setOpen(false)} open={open} />
    </div>
  );
}
