import {
  type ColumnDef,
  type ExpandedState,
  type RowSelectionState,
  flexRender,
  getCoreRowModel,
  getExpandedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import React, { useState, useEffect } from "react";
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
import useRoomDetail from "../../container/useRoomDetail";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";
import BookingHistoryRow from "../../fragments/booking-history.row";
import useRoomBookingHistory from "../../container/useRoomBookingHistory";

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

  const { isLoading: roomDetailLoading, data: roomDetailData } = useRoomDetail({
    id: Object.keys(expanded || {})[0] as string,
    params: {},
    expanded,
  });
  const { isLoading: roomBookingHistoryLoading, data: roomBookingHistoryData } =
    useRoomBookingHistory({
      id: Object.keys(expanded || {})[0] as string,
      params: {},
      expanded,
    });
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
    getRowId: (row) => row.roomId,
  });

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
              return (
                <React.Fragment key={row.id}>
                  <TableRow data-state={row.getIsSelected() && "selected"}>
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
                      <TableCell colSpan={columns.length} className="p-2">
                        <Tabs defaultValue="detail">
                          <TabsList>
                            <TabsTrigger value="detail">Chi tiết</TabsTrigger>
                            <TabsTrigger value="booking-history">
                              Lịch sử đặt phòng
                            </TabsTrigger>
                          </TabsList>
                          <TabsContent value="detail">
                            {roomDetailData ? (
                              <RoomDetailRow
                                roomDetail={roomDetailData}
                                isLoading={roomDetailLoading}
                              />
                            ) : (
                              <p className="text-center text-sm italic ">
                                Không có thông tin
                              </p>
                            )}
                          </TabsContent>
                          <TabsContent value="booking-history">
                            {roomBookingHistoryData ? (
                              <BookingHistoryRow
                                bookings={roomBookingHistoryData}
                                isLoading={roomBookingHistoryLoading}
                              />
                            ) : (
                              <p className="text-center text-sm italic ">
                                Không có thông tin
                              </p>
                            )}
                          </TabsContent>
                        </Tabs>
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
