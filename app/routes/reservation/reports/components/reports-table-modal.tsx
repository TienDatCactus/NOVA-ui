"use client";

import { useState } from "react";
import { format, startOfWeek, endOfWeek, addDays } from "date-fns";
import { vi } from "date-fns/locale";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "~/components/ui/popover";
import { Calendar } from "~/components/ui/calendar";
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
  Calendar as CalendarIcon,
  ChevronDownIcon,
} from "lucide-react";
import { cn } from "~/lib/utils";
import type z from "zod";
import { ReportsSchema } from "~/services/api/reports/reports.schema";
import { ReportsService } from "~/services/api/reports";
import { useQuery } from "@tanstack/react-query";

const { ReservationReportsSchema } = ReportsSchema;
type ReservationReportsData = z.infer<typeof ReservationReportsSchema>;

interface ReportsTableModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ReportsTableModal({
  open,
  onOpenChange,
}: ReportsTableModalProps) {
  const [expandedRows, setExpandedRows] = useState<Set<string>>(
    new Set([]) // Start with all sections collapsed to show totals
  );

  const [openCalendar, setOpenCalendar] = useState<{
    from: boolean;
    to: boolean;
  }>({
    from: false,
    to: false,
  });

  // Initialize with current week (max 7 days)
  const today = new Date();
  const [dateRange, setDateRange] = useState<{
    from: Date | undefined;
    to: Date | undefined;
  }>({
    from: today,
    to: addDays(today, 6), // 7 days total (today + 6)
  });

  // Format dates for API call
  const fromDateStr = dateRange.from ? format(dateRange.from, "yyyy-MM-dd") : "";
  const toDateStr = dateRange.to ? format(dateRange.to, "yyyy-MM-dd") : "";

  // Fetch dashboard data
  const {
    data: dashboardData,
    isLoading,
    refetch,
  } = useQuery({
    queryKey: ["daily-booking-dashboard-modal", fromDateStr, toDateStr],
    queryFn: async () => await ReportsService.getReservationReports(fromDateStr, toDateStr),
    enabled: Boolean(open && fromDateStr && toDateStr),
    staleTime: 5 * 60 * 1000,
  });

  const data = dashboardData;

  const toggleRow = (rowKey: string) => {
    const newExpanded = new Set(expandedRows);
    if (newExpanded.has(rowKey)) {
      newExpanded.delete(rowKey);
    } else {
      newExpanded.add(rowKey);
    }
    setExpandedRows(newExpanded);
  };

  const handleNextWeek = () => {
    if (dateRange.from && dateRange.to) {
      const nextWeekStart = addDays(dateRange.from, 7);
      const nextWeekEnd = addDays(dateRange.to, 7);
      setDateRange({ from: nextWeekStart, to: nextWeekEnd });
    }
  };

  const handlePrevWeek = () => {
    if (dateRange.from && dateRange.to) {
      const prevWeekStart = addDays(dateRange.from, -7);
      const prevWeekEnd = addDays(dateRange.to, -7);
      setDateRange({ from: prevWeekStart, to: prevWeekEnd });
    }
  };

  const handleResetToToday = () => {
    const today = new Date();
    setDateRange({
      from: today,
      to: addDays(today, 6), // 7 days max
    });
  };

  // Extract unique dates from bookingData
  const dates = data?.bookingData?.map((item: { date: string }) => item.date) || [];
  const todayStr = format(new Date(), "dd/MM");

  // Export to CSV
  const handleExport = () => {
    if (!data || !data.bookingData || !data.availableRoomsTrendData) return;

    const csvRows = [];
    csvRows.push(["Danh mục", ...dates].join(","));
    
    // Phòng trống - Calculate totals from availableRoomsTrendData
    const availableTotals = data.availableRoomsTrendData.map((dayData: any) => {
      return Object.entries(dayData).reduce((sum, [key, value]) => {
        if (key !== "date" && typeof value === "number") {
          return sum + value;
        }
        return sum;
      }, 0);
    });
    csvRows.push(["Phòng trống", ...availableTotals].join(","));
    
    // Đã đặt
    csvRows.push(["Đã đặt", ...data.bookingData.map((d: { booked: number }) => d.booked)].join(","));
    
    // Check-in
    csvRows.push(["Check-in", ...data.bookingData.map((d: { checkin: number }) => d.checkin)].join(","));
    
    // Check-out
    csvRows.push(["Check-out", ...data.bookingData.map((d: { checkout: number }) => d.checkout)].join(","));

    const csvContent = csvRows.join("\n");
    const blob = new Blob(["\ufeff" + csvContent], {
      type: "text/csv;charset=utf-8;",
    });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);

    link.setAttribute("href", url);
    link.setAttribute(
      "download",
      `bao-cao-le-tan-${format(new Date(), "yyyy-MM-dd")}.csv`
    );
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const dateRangeText =
    dateRange.from && dateRange.to
      ? `Từ ${format(dateRange.from, "dd/MM/yyyy", { locale: vi })} đến ${format(dateRange.to, "dd/MM/yyyy", { locale: vi })}`
      : "Chưa chọn khoảng thời gian";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[95vw] max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CalendarIcon className="h-5 w-5" />
              Báo cáo lễ tân
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={handleExport}
              className="gap-2"
              disabled={!data || !data.bookingData}
            >
              <Download className="h-4 w-4" />
              Xuất file
            </Button>
          </DialogTitle>
          <DialogDescription>{dateRangeText}</DialogDescription>
        </DialogHeader>

        {/* Date Range Picker */}
        <div className="flex gap-4 items-center flex-wrap border-b pb-4">
          <Button variant="outline" size="icon" onClick={handlePrevWeek}>
            ‹
          </Button>
          <div className="flex gap-2 items-center">
            <p className="text-sm text-muted-foreground">Từ</p>
            <Popover
              open={openCalendar.from}
              onOpenChange={() => {
                setOpenCalendar({ ...openCalendar, from: !openCalendar.from });
              }}
            >
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className="w-56 justify-between font-normal"
                >
                  <span className="flex items-center gap-2">
                    <CalendarIcon className="h-4 w-4" />
                    {dateRange.from
                      ? format(dateRange.from, "EEEE, dd 'Thg' MM, yyyy", {
                          locale: vi,
                        })
                      : "Chọn ngày"}
                  </span>
                  <ChevronDownIcon className="h-4 w-4" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto overflow-hidden p-0" align="start">
                <Calendar
                  locale={vi}
                  mode="single"
                  selected={dateRange.from}
                  captionLayout="dropdown"
                  onSelect={(data) => {
                    setDateRange({ ...dateRange, from: data });
                    setOpenCalendar({
                      ...openCalendar,
                      from: false,
                    });
                  }}
                />
              </PopoverContent>
            </Popover>
          </div>

          <div className="flex gap-2 items-center">
            <p className="text-sm text-muted-foreground">đến</p>
            <Popover
              open={openCalendar.to}
              onOpenChange={() => {
                setOpenCalendar({ ...openCalendar, to: !openCalendar.to });
              }}
            >
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className="w-56 justify-between font-normal"
                >
                  <span className="flex items-center gap-2">
                    <CalendarIcon className="h-4 w-4" />
                    {dateRange.to
                      ? format(dateRange.to, "EEEE, dd 'Thg' MM, yyyy", {
                          locale: vi,
                        })
                      : "Chọn ngày"}
                  </span>
                  <ChevronDownIcon className="h-4 w-4" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto overflow-hidden p-0" align="start">
                <Calendar
                  locale={vi}
                  mode="single"
                  selected={dateRange.to}
                  captionLayout="dropdown"
                  onSelect={(data) => {
                    setDateRange({ ...dateRange, to: data });
                    setOpenCalendar({
                      ...openCalendar,
                      to: false,
                    });
                  }}
                />
              </PopoverContent>
            </Popover>
          </div>
          <Button variant="outline" size="icon" onClick={handleNextWeek}>
            ›
          </Button>

          <Button variant="outline" onClick={handleResetToToday}>
            Hiện tại
          </Button>
        </div>

        <div className="flex-1 overflow-x-auto overflow-y-auto">
          {isLoading ? (
            <div className="flex items-center justify-center h-64 text-muted-foreground">
              Đang tải dữ liệu...
            </div>
          ) : !data || !data.bookingData || !data.availableRoomsTrendData || !data.roomTypeComparisonData ||
             data.bookingData.length === 0 || data.availableRoomsTrendData.length === 0 ? (
            <div className="flex items-center justify-center h-64 text-muted-foreground">
              Không có dữ liệu để hiển thị
            </div>
          ) : (
            <div className="relative">
              <Table>
                <TableHeader className="sticky top-0 bg-background z-10">
                  <TableRow>
                    <TableHead className="sticky left-0 bg-background z-20 w-[200px] font-semibold border-r">
                      Phòng
                    </TableHead>
                    {dates.map((date: string) => {
                      const isToday = date === todayStr;
                      // Parse date from dd/MM format to get day of week
                      const [day, month] = date.split("/");
                      const year = new Date().getFullYear();
                      const dateObj = new Date(year, parseInt(month) - 1, parseInt(day));
                      const dayOfWeek = dateObj.getDay(); // 0=Sunday, 1=Monday, ..., 6=Saturday
                      
                      // Map to Vietnamese day labels
                      const dayLabels = ["CN", "T2", "T3", "T4", "T5", "T6", "T7"];
                      const dayLabel = dayLabels[dayOfWeek];
                      
                      return (
                        <TableHead
                          key={date}
                          className={cn(
                            "text-center font-semibold min-w-[100px]",
                            isToday && "bg-primary text-primary-foreground"
                          )}
                        >
                          <div className="flex flex-col gap-0.5">
                            <span className="text-base">{dayLabel}</span>
                            <span className="text-xs font-normal opacity-90">
                              {date}
                            </span>
                          </div>
                        </TableHead>
                      );
                    })}
                  </TableRow>
                </TableHeader>
              <TableBody>
                {/* Phòng trống Section */}
                <TableRow className="bg-muted/30 hover:bg-muted/50 cursor-pointer" onClick={() => toggleRow("available-rooms")}>
                  <TableCell className="font-semibold sticky left-0 bg-muted/30 z-10 border-r">
                    <div className="flex items-center gap-2">
                      {expandedRows.has("available-rooms") ? (
                        <ChevronDown className="h-4 w-4" />
                      ) : (
                        <ChevronRight className="h-4 w-4" />
                      )}
                      Phòng trống
                    </div>
                  </TableCell>
                  {data.availableRoomsTrendData?.map((dayData: any) => {
                    const isToday = dayData.date === todayStr;
                    // Calculate total available rooms for this day (sum all room types)
                    const total = Object.entries(dayData).reduce((sum, [key, value]) => {
                      if (key !== "date" && typeof value === "number") {
                        return sum + value;
                      }
                      return sum;
                    }, 0);
                    
                    return (
                      <TableCell
                        key={dayData.date}
                        className={cn(
                          "text-center tabular-nums text-foreground font-semibold",
                          isToday && "bg-primary/10"
                        )}
                      >
                        {total}
                      </TableCell>
                    );
                  })}
                </TableRow>

                {/* Room Type Breakdown for Available - Show when expanded */}
                {expandedRows.has("available-rooms") && data.availableRoomsTrendData && (() => {
                  // Extract unique room types from first day's data
                  const firstDay = data.availableRoomsTrendData[0];
                  const roomTypes = Object.keys(firstDay).filter(key => key !== "date");
                  
                  return roomTypes.map((roomType: string) => (
                    <TableRow key={roomType} className="hover:bg-muted/20">
                      <TableCell className="sticky left-0 bg-background pl-8 border-r">{roomType}</TableCell>
                      {data.availableRoomsTrendData.map((dayData: any) => {
                        const isToday = dayData.date === todayStr;
                        return (
                          <TableCell
                            key={dayData.date}
                            className={cn(
                              "text-center tabular-nums text-foreground",
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

                {/* Đã đặt Section */}
                <TableRow className="bg-muted/30 hover:bg-muted/50 cursor-pointer" onClick={() => toggleRow("booked-rooms")}>
                  <TableCell className="font-semibold sticky left-0 bg-muted/30 z-10 border-r">
                    <div className="flex items-center gap-2">
                      {expandedRows.has("booked-rooms") ? (
                        <ChevronDown className="h-4 w-4" />
                      ) : (
                        <ChevronRight className="h-4 w-4" />
                      )}
                      Đã đặt
                    </div>
                  </TableCell>
                  {data.bookingData.map((dayData: { date: string; booked: number }) => {
                    const isToday = dayData.date === todayStr;
                    return (
                      <TableCell
                        key={dayData.date}
                        className={cn(
                          "text-center tabular-nums text-foreground font-semibold",
                          isToday && "bg-primary/10"
                        )}
                      >
                        {dayData.booked}
                      </TableCell>
                    );
                  })}
                </TableRow>

                {/* Room Type Breakdown for Booked - Show when expanded */}
                {expandedRows.has("booked-rooms") && data.roomTypeComparisonData && data.roomTypeComparisonData.map((roomType: { type: string; booked: number }) => (
                  <TableRow key={roomType.type} className="hover:bg-muted/20">
                    <TableCell className="sticky left-0 bg-background pl-8 border-r">{roomType.type}</TableCell>
                    {dates.map((date: string) => {
                      const isToday = date === todayStr;
                      return (
                        <TableCell
                          key={date}
                          className={cn(
                            "text-center tabular-nums text-foreground",
                            isToday && "bg-primary/5"
                          )}
                        >
                          {roomType.booked}
                        </TableCell>
                      );
                    })}
                  </TableRow>
                ))}

                {/* Check-in Section */}
                <TableRow className="bg-muted/30 hover:bg-muted/50 cursor-pointer" onClick={() => toggleRow("checkin-rooms")}>
                  <TableCell className="font-semibold sticky left-0 bg-muted/30 z-10 border-r">
                    <div className="flex items-center gap-2">
                      {expandedRows.has("checkin-rooms") ? (
                        <ChevronDown className="h-4 w-4" />
                      ) : (
                        <ChevronRight className="h-4 w-4" />
                      )}
                      Check-in
                    </div>
                  </TableCell>
                  {data.bookingData.map((dayData: { date: string; checkin: number }) => {
                    const isToday = dayData.date === todayStr;
                    return (
                      <TableCell
                        key={dayData.date}
                        className={cn(
                          "text-center tabular-nums text-foreground font-semibold",
                          isToday && "bg-primary/10"
                        )}
                      >
                        {dayData.checkin}
                      </TableCell>
                    );
                  })}
                </TableRow>

                {/* Room Type Breakdown for Check-in - Show when expanded */}
                {expandedRows.has("checkin-rooms") && data.roomTypeComparisonData && data.roomTypeComparisonData.map((roomType: { type: string; checkin: number }) => (
                  <TableRow key={roomType.type} className="hover:bg-muted/20">
                    <TableCell className="sticky left-0 bg-background pl-8 border-r">{roomType.type}</TableCell>
                    {dates.map((date: string) => {
                      const isToday = date === todayStr;
                      return (
                        <TableCell
                          key={date}
                          className={cn(
                            "text-center tabular-nums text-foreground",
                            isToday && "bg-primary/5"
                          )}
                        >
                          {roomType.checkin}
                        </TableCell>
                      );
                    })}
                  </TableRow>
                ))}

                {/* Check-out Section */}
                <TableRow className="bg-muted/30 hover:bg-muted/50 cursor-pointer" onClick={() => toggleRow("checkout-rooms")}>
                  <TableCell className="font-semibold sticky left-0 bg-muted/30 z-10 border-r">
                    <div className="flex items-center gap-2">
                      {expandedRows.has("checkout-rooms") ? (
                        <ChevronDown className="h-4 w-4" />
                      ) : (
                        <ChevronRight className="h-4 w-4" />
                      )}
                      Check-out
                    </div>
                  </TableCell>
                  {data.bookingData.map((dayData: { date: string; checkout: number }) => {
                    const isToday = dayData.date === todayStr;
                    return (
                      <TableCell
                        key={dayData.date}
                        className={cn(
                          "text-center tabular-nums text-foreground font-semibold",
                          isToday && "bg-primary/10"
                        )}
                      >
                        {dayData.checkout}
                      </TableCell>
                    );
                  })}
                </TableRow>

                {/* Room Type Breakdown for Check-out - Show when expanded */}
                {expandedRows.has("checkout-rooms") && data.roomTypeComparisonData && data.roomTypeComparisonData.map((roomType: { type: string; available: number }) => {
                  // For checkout, we might want to show a different calculation
                  // For now, showing available value (can be adjusted based on business logic)
                  const checkoutValue = roomType.available < 0 ? Math.abs(roomType.available) : 0;
                  return (
                    <TableRow key={roomType.type} className="hover:bg-muted/20">
                      <TableCell className="sticky left-0 bg-background pl-8 border-r">{roomType.type}</TableCell>
                      {dates.map((date: string) => {
                        const isToday = date === todayStr;
                        return (
                          <TableCell
                            key={date}
                            className={cn(
                              "text-center tabular-nums text-foreground",
                              isToday && "bg-primary/5"
                            )}
                          >
                            {checkoutValue}
                          </TableCell>
                        );
                      })}
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
