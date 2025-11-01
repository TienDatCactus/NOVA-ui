import {
  flexRender,
  getCoreRowModel,
  useReactTable,
  getSortedRowModel,
  type SortingState,
  type ColumnDef,
  getExpandedRowModel,
  type Row,
  type RowSelectionState,
} from "@tanstack/react-table";
import { useState, Fragment, useEffect } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "~/components/ui/table";
import { ChevronDown, ChevronRight, Package } from "lucide-react";
import { Button } from "~/components/ui/button";
import { Badge } from "~/components/ui/badge";
import type { MenuItem } from "~/services/api/menu-item/dto";

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  onSelectionChange?: (selectedRows: TData[]) => void;
}

function MenuItemExpandedRow({ menuItem }: { menuItem: MenuItem }) {
  const hasComponents = menuItem.components && menuItem.components.length > 0;
  const [activeTab, setActiveTab] = useState("details");

  return (
    <TableRow>
      <TableCell colSpan={8} className="p-0">
        <div className="border-t bg-background">
          {/* Top Horizontal Tabs */}
          <div className="border-b bg-muted/10">
            <div className="flex items-center gap-1 px-2 py-1.5">
              <button
                onClick={() => setActiveTab("details")}
                className={`rounded px-4 py-2 text-sm font-medium transition-all ${
                  activeTab === "details"
                    ? "bg-background text-foreground shadow-sm"
                    : "text-muted-foreground hover:bg-background/60 hover:text-foreground"
                }`}
              >
                Chi tiết
              </button>
              <button
                onClick={() => setActiveTab("components")}
                className={`flex items-center gap-2 rounded px-4 py-2 text-sm font-medium transition-all ${
                  activeTab === "components"
                    ? "bg-background text-foreground shadow-sm"
                    : "text-muted-foreground hover:bg-background/60 hover:text-foreground"
                }`}
              >
                <span>Nguyên liệu</span>
                {hasComponents && (
                  <span className="text-xs opacity-60">
                    {menuItem.components.length}
                  </span>
                )}
              </button>
            </div>
          </div>

          {/* Content */}
          <div>
            {/* Chi tiết Tab */}
            {activeTab === "details" && (
              <div className="p-6">
                <div className="grid gap-8 lg:grid-cols-2">
                  {/* Left: Image Container - Fixed Height */}
                  <div className="rounded-lg border bg-card p-4">
                    <div className="flex h-full min-h-[400px] items-center justify-center overflow-hidden rounded-md border bg-muted/30">
                      {menuItem.imageUrls && menuItem.imageUrls.length > 0 ? (
                        <img
                          src={menuItem.imageUrls[0]}
                          alt={menuItem.name}
                          className="max-h-full max-w-full object-contain"
                        />
                      ) : (
                        <div className="flex h-full items-center justify-center text-muted-foreground">
                          <div className="text-center">
                            <Package className="mx-auto mb-3 h-16 w-16 opacity-30" />
                            <p className="text-sm">Đang tải...</p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Right: Details */}
                  <div className="space-y-5">
                    <div className="border-b pb-4">
                      <h3 className="text-2xl font-semibold">
                        {menuItem.name}
                      </h3>
                      <p className="mt-1.5 text-sm text-muted-foreground">
                        Mã:{" "}
                        <code className="rounded bg-muted px-1.5 py-0.5 text-xs font-mono">
                          {menuItem.code}
                        </code>
                      </p>
                    </div>

                    <div className="space-y-4">
                      <div className="flex items-baseline justify-between border-b pb-3">
                        <span className="text-sm font-medium text-muted-foreground">
                          Đơn vị:
                        </span>
                        <span className="text-base font-semibold">
                          {menuItem.unitName}
                        </span>
                      </div>

                      <div className="flex items-baseline justify-between border-b pb-3">
                        <span className="text-sm font-medium text-muted-foreground">
                          Giá bán:
                        </span>
                        <span className="text-2xl font-bold text-primary">
                          {new Intl.NumberFormat("vi-VN", {
                            style: "currency",
                            currency: "VND",
                          }).format(menuItem.price)}
                        </span>
                      </div>

                      <div className="flex items-center justify-between border-b pb-3">
                        <span className="text-sm font-medium text-muted-foreground">
                          Trạng thái:
                        </span>
                        <Badge
                          variant={menuItem.active ? "default" : "secondary"}
                          className="font-semibold"
                        >
                          {menuItem.active ? "Đang bán" : "Ngừng bán"}
                        </Badge>
                      </div>

                      {menuItem.description && (
                        <div className="pt-2">
                          <div className="mb-2 text-sm font-semibold text-muted-foreground">
                            Mô tả:
                          </div>
                          <p className="text-sm leading-relaxed text-foreground/90">
                            {menuItem.description}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Nguyên liệu Tab */}
            {activeTab === "components" && (
              <div className="p-6">
                {!hasComponents ? (
                  <div className="flex h-64 items-center justify-center text-muted-foreground">
                    <div className="text-center">
                      <Package className="mx-auto mb-3 h-16 w-16 opacity-30" />
                      <p className="text-sm font-medium">
                        Không có nguyên liệu
                      </p>
                    </div>
                  </div>
                ) : (
                  <div>
                    <div className="mb-4">
                      <h4 className="text-lg font-semibold">
                        Danh sách nguyên liệu tiêu hao
                      </h4>
                      <p className="text-sm text-muted-foreground">
                        Tổng số: {menuItem.components.length} nguyên liệu
                      </p>
                    </div>
                    <div className="overflow-hidden rounded-lg border bg-card">
                      <Table>
                        <TableHeader>
                          <TableRow className="bg-muted/40 hover:bg-muted/40">
                            <TableHead className="h-11 w-16 text-center font-semibold">
                              STT
                            </TableHead>
                            <TableHead className="h-11 w-40 font-semibold">
                              Mã hàng hóa
                            </TableHead>
                            <TableHead className="h-11 font-semibold">
                              Tên nguyên liệu tiêu hao
                            </TableHead>
                            <TableHead className="h-11 font-semibold">
                              Ghi chú
                            </TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {menuItem.components.map((component, idx) => (
                            <TableRow key={idx} className="hover:bg-muted/20">
                              <TableCell className="text-center font-semibold text-muted-foreground">
                                {idx + 1}
                              </TableCell>
                              <TableCell>
                                <code className="rounded bg-muted px-2 py-1 text-xs font-mono font-semibold">
                                  {component.itemId}
                                </code>
                              </TableCell>
                              <TableCell className="font-medium">
                                {component.itemName}
                              </TableCell>
                              <TableCell className="text-sm text-muted-foreground">
                                {component.notes || "—"}
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </TableCell>
    </TableRow>
  );
}

export function MenuItemsDataTable<TData extends MenuItem, TValue>({
  columns,
  data,
  onSelectionChange,
}: DataTableProps<TData, TValue>) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getExpandedRowModel: getExpandedRowModel(),
    onSortingChange: setSorting,
    onRowSelectionChange: setRowSelection,
    getRowId: (row) => row.itemId,
    state: {
      sorting,
      rowSelection,
    },
  });

  // Notify parent of selection changes
  useEffect(() => {
    if (onSelectionChange) {
      const selectedRows = table
        .getSelectedRowModel()
        .rows.map((row) => row.original);
      onSelectionChange(selectedRows);
    }
  }, [rowSelection, onSelectionChange, table]);

  const toggleRow = (rowId: string) => {
    setExpanded((prev) => ({
      ...prev,
      [rowId]: !prev[rowId],
    }));
  };

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id}>
              <TableHead className="w-[50px]" />
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
            table.getRowModel().rows.map((row) => {
              const isExpanded = expanded[row.id];
              const hasComponents =
                row.original.components && row.original.components.length > 0;

              return (
                <Fragment key={row.id}>
                  <TableRow data-state={row.getIsSelected() && "selected"}>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => toggleRow(row.id)}
                        className="h-8 w-8 p-0"
                      >
                        {isExpanded ? (
                          <ChevronDown className="h-4 w-4" />
                        ) : (
                          <ChevronRight className="h-4 w-4" />
                        )}
                      </Button>
                    </TableCell>
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id}>
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext()
                        )}
                      </TableCell>
                    ))}
                  </TableRow>
                  {isExpanded && (
                    <MenuItemExpandedRow menuItem={row.original} />
                  )}
                </Fragment>
              );
            })
          ) : (
            <TableRow>
              <TableCell
                colSpan={columns.length + 1}
                className="h-24 text-center"
              >
                Không có dữ liệu
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}
