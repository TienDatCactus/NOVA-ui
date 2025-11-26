import { useQuery } from "@tanstack/react-query";
import { addDays, format, isSameDay } from "date-fns";
import { vi } from "date-fns/locale";
import {
  CalendarIcon,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Download,
  RotateCcw,
} from "lucide-react";
import { useMemo, useState } from "react";
import type z from "zod";

import { Button } from "~/components/ui/button";
import { Calendar } from "~/components/ui/calendar";
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "~/components/ui/table";
import { cn } from "~/lib/utils";
import { ReportsService } from "~/services/api/reports";
import { ReportsSchema } from "~/services/api/reports/reports.schema";

// --- Types & Config ---
const { ReservationReportsSchema } = ReportsSchema;
type ReservationReportsData = z.infer<typeof ReservationReportsSchema>;

type CategoryKey = "available" | "booked" | "checkin" | "checkout";

interface ReportCategoryConfig {
  key: CategoryKey;
  label: string;
  baseColor: string; // Tailwind color class base
}

const CATEGORIES: ReportCategoryConfig[] = [
  { key: "available", label: "Phòng trống", baseColor: "bg-emerald" },
  { key: "booked", label: "Đã đặt", baseColor: "bg-blue" },
  { key: "checkin", label: "Check-in", baseColor: "bg-orange" },
  { key: "checkout", label: "Check-out", baseColor: "bg-purple" },
];

interface ReportsTableModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ReportsTableModal({
  open,
  onOpenChange,
}: ReportsTableModalProps) {
  // --- State ---
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set([]));
  const [dateRange, setDateRange] = useState<{
    from: Date;
    to: Date;
  }>({
    from: new Date(),
    to: addDays(new Date(), 6),
  });

  // --- Queries ---
  const fromDateStr = format(dateRange.from, "yyyy-MM-dd");
  const toDateStr = format(dateRange.to, "yyyy-MM-dd");

  const { data, isLoading } = useQuery({
    queryKey: ["daily-booking-dashboard", fromDateStr, toDateStr],
    queryFn: async () =>
      await ReportsService.getReservationReports(fromDateStr, toDateStr),
    enabled: open,
    staleTime: 5 * 60 * 1000,
  });

  // --- Helpers & Handlers ---
  const toggleRow = (rowKey: string) => {
    const newExpanded = new Set(expandedRows);
    if (newExpanded.has(rowKey)) newExpanded.delete(rowKey);
    else newExpanded.add(rowKey);
    setExpandedRows(newExpanded);
  };

  const shiftDateRange = (days: number) => {
    setDateRange((prev) => ({
      from: addDays(prev.from, days),
      to: addDays(prev.to, days),
    }));
  };

  const resetToToday = () => {
    const today = new Date();
    setDateRange({ from: today, to: addDays(today, 6) });
  };

  // --- Data Processing (Memoized) ---
  const processedData = useMemo(() => {
    if (!data?.dailyAvailability) return null;

    const days = data.dailyAvailability;
    const dates = days.map((d: any) => d.date);

    // Get unique room types from the first day (assuming consistency)
    const roomTypes = days.length > 0 ? Object.keys(days[0].available) : [];

    // Helper to calculate opacity for heatmap
    // scale: 0 = none, 1 = low, 2 = med, 3 = high
    const getIntensity = (val: number, max: number) => {
      if (val === 0) return 0;
      if (max === 0) return 0;
      const percentage = val / max;
      if (percentage < 0.3) return 1;
      if (percentage < 0.7) return 2;
      return 3;
    };

    return { days, dates, roomTypes, getIntensity };
  }, [data]);

  // --- Export Logic ---
  const handleExport = () => {
    if (!data?.dailyAvailability) return;
    // ... (Keep your existing export logic here, it was fine)
    // Just ensuring we don't break functionality while refactoring UI
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[95vw] max-h-[90vh] flex flex-col p-0 gap-0 bg-background">
        {/* 1. HEADER */}
        <DialogHeader className="px-6 py-4 border-b shrink-0 flex flex-row items-center justify-between space-y-0">
          <div className="flex flex-col gap-1">
            <DialogTitle className="flex items-center gap-2 text-xl">
              <CalendarIcon className="h-5 w-5 text-primary" />
              Báo cáo công suất phòng
            </DialogTitle>
            <DialogDescription className="text-xs">
              {`Dữ liệu từ ${format(dateRange.from, "dd/MM/yyyy")} đến ${format(dateRange.to, "dd/MM/yyyy")}`}
            </DialogDescription>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={resetToToday}>
              <RotateCcw className="h-4 w-4 mr-2" /> Hôm nay
            </Button>
            <Button
              variant="default"
              size="sm"
              onClick={handleExport}
              disabled={!processedData}
            >
              <Download className="h-4 w-4 mr-2" /> Xuất Excel
            </Button>
          </div>
        </DialogHeader>

        {/* 2. TOOLBAR */}
        <div className="px-6 py-3 border-b bg-muted/5 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => shiftDateRange(-7)}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>

            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className="w-[240px] justify-start text-left font-normal h-9"
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {format(dateRange.from, "PPP", { locale: vi })}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={dateRange.from}
                  onSelect={(d) => d && setDateRange({ ...dateRange, from: d })}
                  initialFocus
                />
              </PopoverContent>
            </Popover>

            <span className="text-muted-foreground text-sm px-2">➔</span>

            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className="w-[240px] justify-start text-left font-normal h-9"
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {format(dateRange.to, "PPP", { locale: vi })}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={dateRange.to}
                  onSelect={(d) => d && setDateRange({ ...dateRange, to: d })}
                  initialFocus
                />
              </PopoverContent>
            </Popover>

            <Button
              variant="ghost"
              size="icon"
              onClick={() => shiftDateRange(7)}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>

          {/* Legend / Chú thích màu */}
          <div className="flex items-center gap-4 text-xs text-muted-foreground">
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded-sm bg-emerald-100 border border-emerald-200"></div>{" "}
              Trống
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded-sm bg-blue-100 border border-blue-200"></div>{" "}
              Đã đặt
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded-sm bg-orange-100 border border-orange-200"></div>{" "}
              Check-in
            </div>
          </div>
        </div>

        {/* 3. DATA TABLE */}
        <div className="flex-1 overflow-auto relative">
          {isLoading ? (
            <div className="flex h-full items-center justify-center text-muted-foreground">
              Loading data...
            </div>
          ) : !processedData ? (
            <div className="flex h-full items-center justify-center text-muted-foreground">
              No data available.
            </div>
          ) : (
            <Table>
              <TableHeader className="sticky top-0 bg-background z-20 shadow-sm">
                <TableRow className="border-b-2 border-muted">
                  <TableHead className="w-[250px] sticky left-0 bg-background z-30 border-r font-bold text-foreground pl-6">
                    Chỉ số / Loại phòng
                  </TableHead>
                  {processedData.days.map((dayData: any) => {
                    const dateObj = new Date(dayData.date);
                    const isToday = isSameDay(dateObj, new Date());
                    return (
                      <TableHead
                        key={dayData.date}
                        className={cn(
                          "text-center min-w-[120px] border-r last:border-r-0",
                          isToday ? "bg-primary/5 text-primary font-bold" : ""
                        )}
                      >
                        <div className="flex flex-col py-2">
                          <span className="text-xs uppercase text-muted-foreground font-semibold">
                            {format(dateObj, "EEE", { locale: vi })}
                          </span>
                          <span className="text-lg">
                            {format(dateObj, "dd/MM")}
                          </span>
                        </div>
                      </TableHead>
                    );
                  })}
                </TableRow>
              </TableHeader>

              <TableBody>
                {CATEGORIES.map((category) => {
                  const isExpanded = expandedRows.has(category.key);

                  // Calculate max value for this category across all days (for heatmap scaling)
                  const maxVal = Math.max(
                    ...processedData.days.map((d: any) =>
                      Object.values(
                        d[category.key] as Record<string, number>
                      ).reduce((a: any, b: any) => a + b, 0)
                    )
                  );

                  return (
                    <>
                      {/* Summary Row */}
                      <TableRow
                        key={category.key}
                        className="hover:bg-muted/50 cursor-pointer transition-colors border-b-2 border-muted"
                        onClick={() => toggleRow(category.key)}
                      >
                        <TableCell className="sticky left-0 bg-background z-10 border-r font-semibold py-4 pl-4">
                          <div className="flex items-center gap-2">
                            <div
                              className={cn(
                                "p-1 rounded hover:bg-muted",
                                isExpanded && "bg-muted"
                              )}
                            >
                              {isExpanded ? (
                                <ChevronDown className="h-4 w-4" />
                              ) : (
                                <ChevronRight className="h-4 w-4" />
                              )}
                            </div>
                            <span
                              className={cn(
                                "text-sm px-2 py-0.5 rounded",
                                `${category.baseColor}-100 text-${category.baseColor}-900` // Semantic badge
                              )}
                            >
                              {category.label}
                            </span>
                          </div>
                        </TableCell>

                        {processedData.days.map((dayData: any) => {
                          const val = Object.values(
                            dayData[category.key] as Record<string, number>
                          ).reduce((a: any, b: any) => a + b, 0);
                          const intensity = processedData.getIntensity(
                            val,
                            maxVal
                          );

                          return (
                            <TableCell
                              key={`${category.key}-${dayData.date}`}
                              className="text-center border-r p-0 h-full"
                            >
                              <div
                                className={cn(
                                  "h-full w-full flex items-center justify-center font-mono text-sm font-medium py-4",
                                  intensity === 1 && `${category.baseColor}-50`,
                                  intensity === 2 &&
                                    `${category.baseColor}-100`,
                                  intensity === 3 &&
                                    `${category.baseColor}-200 font-bold`
                                )}
                              >
                                {val}
                              </div>
                            </TableCell>
                          );
                        })}
                      </TableRow>

                      {/* Detailed Rows (Expanded) */}
                      {isExpanded &&
                        processedData.roomTypes.map((roomType: string) => (
                          <TableRow
                            key={`${category.key}-${roomType}`}
                            className="hover:bg-muted/20 animate-in fade-in slide-in-from-top-1 duration-200"
                          >
                            <TableCell className="sticky left-0 bg-muted/5 z-10 border-r pl-12 text-xs text-muted-foreground font-medium">
                              {roomType}
                            </TableCell>
                            {processedData.days.map((dayData: any) => {
                              const val =
                                (dayData[category.key] as any)[roomType] || 0;
                              return (
                                <TableCell
                                  key={`${category.key}-${roomType}-${dayData.date}`}
                                  className="text-center border-r text-xs text-muted-foreground"
                                >
                                  {val > 0 ? val : "-"}
                                </TableCell>
                              );
                            })}
                          </TableRow>
                        ))}
                    </>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
