import {
  type ColumnDef,
  type ColumnFiltersState,
  flexRender,
  getCoreRowModel,
  getExpandedRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { Search } from "lucide-react";
import React, { useState } from "react";
import { DataTablePagination } from "~/components/table/table-pagination";
import { Input } from "~/components/ui/input";
import { Card } from "~/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "~/components/ui/table";
import { formatMoney } from "~/lib/utils";
import type { InvoiceListItemDto } from "~/services/api/invoices/dto";
import { PAYMENT_METHODS } from "~/services/types/payment.types";
import { InvoiceActions } from "../invoice-actions";

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
}

export function DataTable<TData extends InvoiceListItemDto, TValue>({
  columns,
  data,
}: DataTableProps<TData, TValue>) {
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);

  const table = useReactTable({
    data,
    columns,
    state: {
      columnFilters,
    },
    onColumnFiltersChange: setColumnFilters,
    getExpandedRowModel: getExpandedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getRowCanExpand: () => true,
    getRowId: (row) => row.invoiceId ?? "",
  });

  return (
    <div className="grid gap-2">
      <div className="overflow-hidden rounded-md">
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
                  <React.Fragment key={row.id}>
                    <TableRow>
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
                        <TableCell
                          colSpan={columns.length}
                          className="p-0 border-b"
                        >
                          <div className="flex flex-col md:flex-row gap-6 p-6 bg-muted/30 shadow-[inset_0_2px_4px_rgba(0,0,0,0.02)]">
                            {/* SECTION 1: CONTEXT (Left Side) */}
                            <div className="flex-1 space-y-4">
                              <div>
                                <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold">
                                  Thông tin khách hàng
                                </span>
                                <div className="mt-1 flex items-center gap-2">
                                  <span className="text-base font-semibold text-foreground">
                                    {row.original.customerName}
                                  </span>
                                  <span className="text-sm text-muted-foreground">
                                    • {row.original.itemCount} mục
                                  </span>
                                </div>
                              </div>

                              <div className="flex items-center gap-2 text-sm">
                                <span className="text-muted-foreground">
                                  Phương thức:
                                </span>
                                <span className="font-medium text-foreground">
                                  {PAYMENT_METHODS.find(
                                    (m) =>
                                      m.value === row.original.paymentMethod
                                  )?.label || row.original.paymentMethod}
                                </span>
                              </div>

                              {/* Action buttons live here for quick access */}
                              <div className="pt-2">
                                <InvoiceActions invoice={row.original} />
                              </div>
                            </div>

                            {/* SECTION 2: FINANCIAL BREAKDOWN (Right Side - Receipt Style) */}
                            <div className="w-full md:w-[300px] bg-background/50 rounded-lg border border-border/50 p-4">
                              <div className="space-y-2 text-sm">
                                {/* Row Item */}
                                <div className="flex justify-between items-center">
                                  <span className="text-muted-foreground">
                                    Tạm tính
                                  </span>
                                  <span className="font-mono text-foreground">
                                    {
                                      formatMoney(row.original.subTotal ?? 0)
                                        .vndFormatted
                                    }
                                  </span>
                                </div>

                                <div className="flex justify-between items-center">
                                  <span className="text-muted-foreground">
                                    VAT
                                  </span>
                                  <span className="font-mono text-foreground">
                                    {
                                      formatMoney(row.original.vatAmount ?? 0)
                                        .vndFormatted
                                    }
                                  </span>
                                </div>

                                <div className="flex justify-between items-center">
                                  <span className="text-muted-foreground">
                                    Phí dịch vụ
                                  </span>
                                  <span className="font-mono text-foreground">
                                    {
                                      formatMoney(
                                        row.original.serviceChargeAmount ?? 0
                                      ).vndFormatted
                                    }
                                  </span>
                                </div>

                                <div className="my-2 h-px bg-border border-dashed" />

                                <div className="flex justify-between items-center">
                                  <span className="text-muted-foreground">
                                    Đã thanh toán
                                  </span>
                                  <span className="font-mono text-foreground">
                                    {
                                      formatMoney(row.original.paidAmount ?? 0)
                                        .vndFormatted
                                    }
                                  </span>
                                </div>

                                {/* Highlight the Balance */}
                                <div className="flex justify-between items-center pt-2 mt-2 border-t border-dashed">
                                  <span className="font-medium text-foreground">
                                    Còn lại
                                  </span>
                                  <span className="font-mono font-bold text-lg text-primary">
                                    {
                                      formatMoney(row.original.balance ?? 0)
                                        .vndFormatted
                                    }
                                  </span>
                                </div>
                              </div>
                            </div>
                          </div>
                        </TableCell>
                      </TableRow>
                    )}
                  </React.Fragment>
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
      <DataTablePagination table={table} />
    </div>
  );
}
