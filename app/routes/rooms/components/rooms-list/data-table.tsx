import {
  type ColumnDef,
  type ExpandedState,
  type RowSelectionState,
  flexRender,
  getCoreRowModel,
  getExpandedRowModel,
  useReactTable,
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
import { Skeleton } from "~/components/ui/skeleton";
import type { RoomListItemDto } from "~/services/api/rooms/dto";
import { RoomsService } from "~/services/api/rooms";
import RoomDetailRow from "../../fragments/rooms-detail.row";

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  onSelectionChange?: (selectedRows: TData[]) => void;
}

export function DataTable<TData extends RoomListItemDto, TValue>({
  columns,
  data,
  onSelectionChange,
}: DataTableProps<TData, TValue>) {
  const [expanded, setExpanded] = useState<any>();
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});
  const [roomDetails, setRoomDetails] = useState<Record<string, any>>({});
  const [loadingDetails, setLoadingDetails] = useState<Record<string, boolean>>(
    {}
  );

  const table = useReactTable({
    data,
    columns,
    state: {
      expanded,
      rowSelection,
    },
    onExpandedChange: setExpanded,
    onRowSelectionChange: setRowSelection,
    getExpandedRowModel: getExpandedRowModel(),
    getCoreRowModel: getCoreRowModel(),
    getRowCanExpand: () => true,
  });

  //   useEffect(() => {
  //     const expandedRowIds = Object.keys(expanded).filter(
  //       (key: any) => expanded[key]
  //     );

  //     expandedRowIds.forEach(async (rowId) => {
  //       const row = table.getRow(rowId);
  //       const roomId = row.original.roomId;

  //       // Skip if already loading or loaded
  //       if (loadingDetails[roomId] || roomDetails[roomId]) return;

  //       setLoadingDetails((prev) => ({ ...prev, [roomId]: true }));

  //       try {
  //         const details = await RoomsService.getRoomDetails(roomId, {});
  //         setRoomDetails((prev) => ({ ...prev, [roomId]: details }));
  //       } catch (error) {
  //         console.error(`Failed to load details for room ${roomId}:`, error);
  //       } finally {
  //         setLoadingDetails((prev) => ({ ...prev, [roomId]: false }));
  //       }
  //     });
  //   }, [expanded, table]);

  // Notify parent of selection changes
  useEffect(() => {
    if (onSelectionChange) {
      const selectedRows = table
        .getSelectedRowModel()
        .rows.map((row) => row.original);
      onSelectionChange(selectedRows);
    }
  }, [rowSelection, table, onSelectionChange]);

  return (
    <div className="rounded-md border">
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
              const roomId = row.original.roomId;
              const isExpanded = row.getIsExpanded();
              const isLoading = loadingDetails[roomId];
              const details = roomDetails[roomId];

              return (
                <>
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
                  {isExpanded && (
                    <TableRow>
                      <TableCell colSpan={columns.length} className="p-0">
                        {isLoading ? (
                          <div className="p-4 space-y-2">
                            <Skeleton className="h-20 w-full" />
                            <Skeleton className="h-20 w-full" />
                          </div>
                        ) : details ? (
                          <RoomDetailRow roomDetail={details} />
                        ) : (
                          <div className="p-4 text-center text-muted-foreground">
                            Không thể tải thông tin chi tiết
                          </div>
                        )}
                      </TableCell>
                    </TableRow>
                  )}
                </>
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
