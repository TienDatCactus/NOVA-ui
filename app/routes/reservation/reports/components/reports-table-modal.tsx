"use client";

import { useState } from "react";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "~/components/ui/table";
import { Button } from "~/components/ui/button";
import {
  ChevronDown,
  ChevronRight,
  Download,
  FileSpreadsheet,
} from "lucide-react";
import { cn } from "~/lib/utils";
import type z from "zod";
import { ReportsSchema } from "~/services/api/reports/reports.schema";

const { ReservationReportsSchema } = ReportsSchema;
type ReportsDataDto = z.infer<typeof ReservationReportsSchema>;

interface ReportsTableModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  data?: ReportsDataDto;
  dateRange?: { from: Date; to: Date };
}

export function ReportsTableModal({
  open,
  onOpenChange,
  data,
  dateRange,
}: ReportsTableModalProps) {
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());

  const toggleRow = (rowKey: string) => {
    const newExpanded = new Set(expandedRows);
    if (newExpanded.has(rowKey)) {
      newExpanded.delete(rowKey);
    } else {
      newExpanded.add(rowKey);
    }
    setExpandedRows(newExpanded);
  };

  // Extract unique dates from bookingData
  const dates = data?.bookingData?.map((item) => item.date) || [];
  const today = format(new Date(), "yyyy-MM-dd");

  // Export to CSV
  const handleExport = () => {
    if (!data || !data.bookingData) return;

    const csvRows = [];

    // Header row
    csvRows.push(["Danh mục", ...dates].join(","));

    // Booking status rows
    csvRows.push(
      ["Đã đặt", ...data.bookingData.map((d) => d.booked)].join(",")
    );

    csvRows.push(
      ["Check-in", ...data.bookingData.map((d) => d.checkin)].join(",")
    );

    csvRows.push(
      ["Check-out", ...data.bookingData.map((d) => d.checkout)].join(",")
    );

    csvRows.push(
      ["Phòng trống", ...data.bookingData.map((d) => d.available)].join(",")
    );

    // Room type trend rows (if available)
    if (
      data.availableRoomsTrendData &&
      data.availableRoomsTrendData.length > 0
    ) {
      csvRows.push([""]); // Empty row
      csvRows.push(["Xu hướng theo loại phòng"]);

      const roomTypes = Object.keys(data.availableRoomsTrendData[0]).filter(
        (key) => key !== "date"
      );

      roomTypes.forEach((roomType) => {
        csvRows.push(
          [
            roomType,
            ...data.availableRoomsTrendData.map((d) => d[roomType] || 0),
          ].join(",")
        );
      });
    }

    const csvContent = csvRows.join("\n");
    const blob = new Blob(["\ufeff" + csvContent], {
      type: "text/csv;charset=utf-8;",
    });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);

    link.setAttribute("href", url);
    link.setAttribute(
      "download",
      `bao-cao-phong-${format(new Date(), "yyyy-MM-dd")}.csv`
    );
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const dateRangeText = dateRange
    ? `${format(dateRange.from, "dd/MM/yyyy")} - ${format(dateRange.to, "dd/MM/yyyy")}`
    : "Chưa chọn khoảng thời gian";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[95vw] max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FileSpreadsheet className="h-5 w-5" />
              Báo cáo chi tiết - Dạng bảng
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={handleExport}
              className="gap-2"
            >
              <Download className="h-4 w-4" />
              Xuất CSV
            </Button>
          </DialogTitle>
          <DialogDescription>{dateRangeText}</DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-auto">
          {!data || !data.bookingData || data.bookingData.length === 0 ? (
            <div className="flex items-center justify-center h-64 text-muted-foreground">
              Không có dữ liệu để hiển thị
            </div>
          ) : (
            <Table>
              <TableHeader className="sticky top-0 bg-background z-10">
                <TableRow>
                  <TableHead className="w-[200px] font-semibold">
                    Danh mục
                  </TableHead>
                  {dates.map((date) => {
                    const isToday = date === today;
                    return (
                      <TableHead
                        key={date}
                        className={cn(
                          "text-center font-semibold",
                          isToday && "bg-primary/10 text-primary"
                        )}
                      >
                        <div className="flex flex-col gap-0.5">
                          <span>{format(new Date(date), "dd/MM")}</span>
                          <span className="text-xs font-normal text-muted-foreground">
                            {format(new Date(date), "EEE", { locale: vi })}
                          </span>
                        </div>
                      </TableHead>
                    );
                  })}
                </TableRow>
              </TableHeader>
              <TableBody>
                {/* Booking Status Section */}
                <TableRow className="bg-muted/50">
                  <TableCell
                    colSpan={dates.length + 1}
                    className="font-semibold"
                  >
                    TRẠNG THÁI ĐẶT PHÒNG
                  </TableCell>
                </TableRow>

                <TableRow className="hover:bg-muted/50">
                  <TableCell className="font-medium">Đã đặt</TableCell>
                  {data.bookingData.map((dayData) => {
                    const isToday = dayData.date === today;
                    return (
                      <TableCell
                        key={dayData.date}
                        className={cn(
                          "text-center tabular-nums",
                          isToday && "bg-primary/5"
                        )}
                      >
                        <span className="text-blue-600 font-semibold">
                          {dayData.booked}
                        </span>
                      </TableCell>
                    );
                  })}
                </TableRow>

                <TableRow className="hover:bg-muted/50">
                  <TableCell className="font-medium">Check-in</TableCell>
                  {data.bookingData.map((dayData) => {
                    const isToday = dayData.date === today;
                    return (
                      <TableCell
                        key={dayData.date}
                        className={cn(
                          "text-center tabular-nums",
                          isToday && "bg-primary/5"
                        )}
                      >
                        <span className="text-green-600 font-semibold">
                          {dayData.checkin}
                        </span>
                      </TableCell>
                    );
                  })}
                </TableRow>

                <TableRow className="hover:bg-muted/50">
                  <TableCell className="font-medium">Check-out</TableCell>
                  {data.bookingData.map((dayData) => {
                    const isToday = dayData.date === today;
                    return (
                      <TableCell
                        key={dayData.date}
                        className={cn(
                          "text-center tabular-nums",
                          isToday && "bg-primary/5"
                        )}
                      >
                        <span className="text-yellow-600 font-semibold">
                          {dayData.checkout}
                        </span>
                      </TableCell>
                    );
                  })}
                </TableRow>

                <TableRow className="hover:bg-muted/50">
                  <TableCell className="font-medium">Phòng trống</TableCell>
                  {data.bookingData.map((dayData) => {
                    const isToday = dayData.date === today;
                    return (
                      <TableCell
                        key={dayData.date}
                        className={cn(
                          "text-center tabular-nums",
                          isToday && "bg-primary/5"
                        )}
                      >
                        <span className="text-gray-600 font-semibold">
                          {dayData.available}
                        </span>
                      </TableCell>
                    );
                  })}
                </TableRow>

                {/* Room Type Trend Section - Expandable */}
                {data.availableRoomsTrendData &&
                  data.availableRoomsTrendData.length > 0 && (
                    <>
                      <TableRow className="bg-muted/50">
                        <TableCell
                          colSpan={dates.length + 1}
                          className="font-semibold cursor-pointer"
                          onClick={() => toggleRow("room-types")}
                        >
                          <div className="flex items-center gap-2">
                            {expandedRows.has("room-types") ? (
                              <ChevronDown className="h-4 w-4" />
                            ) : (
                              <ChevronRight className="h-4 w-4" />
                            )}
                            XU HƯỚNG THEO LOẠI PHÒNG
                          </div>
                        </TableCell>
                      </TableRow>

                      {expandedRows.has("room-types") &&
                        (() => {
                          const roomTypes = Object.keys(
                            data.availableRoomsTrendData[0]
                          ).filter((key) => key !== "date");

                          return roomTypes.map((roomType) => (
                            <TableRow
                              key={roomType}
                              className="hover:bg-muted/50"
                            >
                              <TableCell className="font-medium pl-8">
                                {roomType}
                              </TableCell>
                              {data.availableRoomsTrendData.map((dayData) => {
                                const isToday = dayData.date === today;
                                return (
                                  <TableCell
                                    key={dayData.date}
                                    className={cn(
                                      "text-center tabular-nums",
                                      isToday && "bg-primary/5"
                                    )}
                                  >
                                    {dayData[roomType] || 0}
                                  </TableCell>
                                );
                              })}
                            </TableRow>
                          ));
                        })()}
                    </>
                  )}

                {/* Room Type Comparison Section - Expandable */}
                {data.roomTypeComparisonData &&
                  data.roomTypeComparisonData.length > 0 && (
                    <>
                      <TableRow className="bg-muted/50">
                        <TableCell
                          colSpan={dates.length + 1}
                          className="font-semibold cursor-pointer"
                          onClick={() => toggleRow("room-comparison")}
                        >
                          <div className="flex items-center gap-2">
                            {expandedRows.has("room-comparison") ? (
                              <ChevronDown className="h-4 w-4" />
                            ) : (
                              <ChevronRight className="h-4 w-4" />
                            )}
                            SO SÁNH LOẠI PHÒNG
                          </div>
                        </TableCell>
                      </TableRow>

                      {expandedRows.has("room-comparison") && (
                        <>
                          {data.roomTypeComparisonData.map((roomData) => (
                            <TableRow
                              key={roomData.type}
                              className="hover:bg-muted/50"
                            >
                              <TableCell className="font-medium pl-8">
                                {roomData.type}
                              </TableCell>
                              <TableCell
                                colSpan={dates.length}
                                className="text-sm"
                              >
                                <div className="flex gap-6">
                                  <span>
                                    Trống:{" "}
                                    <span className="font-semibold text-green-600">
                                      {roomData.available}%
                                    </span>
                                  </span>
                                  <span>
                                    Đã đặt:{" "}
                                    <span className="font-semibold text-blue-600">
                                      {roomData.booked}%
                                    </span>
                                  </span>
                                  <span>
                                    Check-in:{" "}
                                    <span className="font-semibold text-orange-600">
                                      {roomData.checkin}%
                                    </span>
                                  </span>
                                </div>
                              </TableCell>
                            </TableRow>
                          ))}
                        </>
                      )}
                    </>
                  )}
              </TableBody>
            </Table>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
