import {
  type ColumnDef,
  flexRender,
  getCoreRowModel,
  getExpandedRowModel,
  getPaginationRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { ChevronLeft, ChevronRight } from "lucide-react";
import React from "react";
import { Button } from "~/components/ui/button";
import { Card } from "~/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
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
  const table = useReactTable({
    data,
    columns,
    getExpandedRowModel: getExpandedRowModel(),
    getCoreRowModel: getCoreRowModel(),
    getRowCanExpand: () => true,
    getRowId: (row) => row.invoiceId ?? "",
  });

  return (
    <div className="rounded-md border bg-card shadow-sm">
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
                        className="p-4 bg-card space-y-4"
                      >
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div className="space-y-1">
                            <span className="text-xs text-muted-foreground block">
                              Khách hàng
                            </span>
                            <span className="font-medium text-foreground">
                              {row.original.customerName}
                            </span>
                          </div>
                          <div className="space-y-1">
                            <span className="text-xs text-muted-foreground block">
                              Số lượng mục
                            </span>
                            <span className="font-medium text-foreground">
                              {row.original.itemCount}
                            </span>
                          </div>
                          <div className="space-y-1">
                            <span className="text-xs text-muted-foreground block">
                              Tạm tính
                            </span>
                            <span className="font-medium text-foreground">
                              {
                                formatMoney(row.original.subTotal ?? 0)
                                  .vndFormatted
                              }
                            </span>
                          </div>
                          <div className="space-y-1">
                            <span className="text-xs text-muted-foreground block">
                              VAT
                            </span>
                            <span className="font-medium text-foreground">
                              {
                                formatMoney(row.original.vatAmount ?? 0)
                                  .vndFormatted
                              }
                            </span>
                          </div>
                          <div className="space-y-1">
                            <span className="text-xs text-muted-foreground block">
                              Phí dịch vụ
                            </span>
                            <span className="font-medium text-foreground">
                              {
                                formatMoney(
                                  row.original.serviceChargeAmount ?? 0
                                ).vndFormatted
                              }
                            </span>
                          </div>
                          <div className="space-y-1">
                            <span className="text-xs text-muted-foreground block">
                              Đã thanh toán
                            </span>
                            <span className="font-medium text-foreground">
                              {
                                formatMoney(row.original.paidAmount ?? 0)
                                  .vndFormatted
                              }
                            </span>
                          </div>
                          <div className="space-y-1">
                            <span className="text-xs text-muted-foreground block">
                              Còn lại
                            </span>
                            <span className="font-medium text-foreground">
                              {
                                formatMoney(row.original.balance ?? 0)
                                  .vndFormatted
                              }
                            </span>
                          </div>
                          <div className="space-y-1">
                            <span className="text-xs text-muted-foreground block">
                              Phương thức
                            </span>
                            <span className="font-medium text-foreground">
                              {
                                PAYMENT_METHODS.find(
                                  (method) =>
                                    method.value === row.original.paymentMethod
                                )?.label
                              }
                            </span>
                          </div>
                        </div>
                        <div className="mt-4 flex justify-end">
                          <InvoiceActions invoice={row.original} />
                        </div>
                      </TableCell>
                    </TableRow>
                  )}
                </React.Fragment>
              );
            })
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
  );
}
