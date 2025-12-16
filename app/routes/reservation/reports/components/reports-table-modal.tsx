import { addDays, format, isSameDay } from "date-fns";
import { vi } from "date-fns/locale";
import {
  BarChart3,
  ChevronLeft,
  ChevronRight,
  RotateCcw,
  X,
} from "lucide-react";
import { useMemo, useState } from "react";

import { Button } from "~/components/ui/button";
import { Calendar } from "~/components/ui/calendar";
import {
  Dialog,
  DialogClose,
  DialogContent,
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
import useReports from "../container/reservation-reports-query";

// --- Types & Config ---

type CategoryKey = "available" | "booked" | "checkin" | "checkout";

interface ReportCategoryConfig {
  key: CategoryKey;
  label: string;
  colors: {
    bg: string;
    text: string;
    border: string;
    intensity: [string, string, string]; // Low, Med, High
  };
}

const CATEGORIES: ReportCategoryConfig[] = [
  {
    key: "available",
    label: "Phòng trống",
    colors: {
      bg: "bg-emerald-100 dark:bg-emerald-900/30",
      text: "text-emerald-900 dark:text-emerald-100",
      border: "border-emerald-200 dark:border-emerald-800",
      intensity: [
        "bg-emerald-50/50 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-300",
        "bg-emerald-200/50 text-emerald-800 font-medium dark:bg-emerald-800/40 dark:text-emerald-200",
        "bg-emerald-400/30 text-emerald-900 font-bold dark:bg-emerald-700/50 dark:text-emerald-100",
      ],
    },
  },
  {
    key: "booked",
    label: "Đã đặt",
    colors: {
      bg: "bg-blue-100 dark:bg-blue-900/30",
      text: "text-blue-900 dark:text-blue-100",
      border: "border-blue-200 dark:border-blue-800",
      intensity: [
        "bg-blue-50/50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-300",
        "bg-blue-200/50 text-blue-800 font-medium dark:bg-blue-800/40 dark:text-blue-200",
        "bg-blue-400/30 text-blue-900 font-bold dark:bg-blue-700/50 dark:text-blue-100",
      ],
    },
  },
  {
    key: "checkin",
    label: "Check-in",
    colors: {
      bg: "bg-orange-100 dark:bg-orange-900/30",
      text: "text-orange-900 dark:text-orange-100",
      border: "border-orange-200 dark:border-orange-800",
      intensity: [
        "bg-orange-50/50 text-orange-700 dark:bg-orange-900/20 dark:text-orange-300",
        "bg-orange-200/50 text-orange-800 font-medium dark:bg-orange-800/40 dark:text-orange-200",
        "bg-orange-400/30 text-orange-900 font-bold dark:bg-orange-700/50 dark:text-orange-100",
      ],
    },
  },
  {
    key: "checkout",
    label: "Check-out",
    colors: {
      bg: "bg-purple-100 dark:bg-purple-900/30",
      text: "text-purple-900 dark:text-purple-100",
      border: "border-purple-200 dark:border-purple-800",
      intensity: [
        "bg-purple-50/50 text-purple-700 dark:bg-purple-900/20 dark:text-purple-300",
        "bg-purple-200/50 text-purple-800 font-medium dark:bg-purple-800/40 dark:text-purple-200",
        "bg-purple-400/30 text-purple-900 font-bold dark:bg-purple-700/50 dark:text-purple-100",
      ],
    },
  },
];

// --- Main Component ---

interface ReportsTableModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ReportsTableModal({
  open,
  onOpenChange,
}: ReportsTableModalProps) {
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set([]));
  const [dateRange, setDateRange] = useState<{ from: Date; to: Date }>({
    from: new Date(),
    to: addDays(new Date(), 6), // Default 1 week view
  });

  // Query
  const { data, isLoading } = useReports({
    fromDate: format(dateRange.from, "yyyy-MM-dd"),
    toDate: format(dateRange.to, "yyyy-MM-dd"),
  });

  // Logic
  const toggleRow = (rowKey: string) => {
    const newExpanded = new Set(expandedRows);
    if (newExpanded.has(rowKey)) newExpanded.delete(rowKey);
    else newExpanded.add(rowKey);
    setExpandedRows(newExpanded);
  };

  const handleDateShift = (days: number) => {
    setDateRange((prev) => ({
      from: addDays(prev.from, days),
      to: addDays(prev.to, days),
    }));
  };

  const processedData = useMemo(() => {
    if (!data?.dailyAvailability) return null;

    const days = data.dailyAvailability;
    const roomTypes = days.length > 0 ? Object.keys(days[0].available) : [];

    // Pre-calculate max values for intensity to avoid doing it in render loop
    const maxValues: Record<CategoryKey, number> = {} as any;

    CATEGORIES.forEach((cat) => {
      const max = Math.max(
        ...days.map((d: any) => {
          const values = Object.values(d[cat.key] as Record<string, number>);
          return values.reduce((a, b) => a + b, 0);
        })
      );
      maxValues[cat.key] = max;
    });

    const getIntensity = (val: number, categoryKey: CategoryKey): 0 | 1 | 2 => {
      const max = maxValues[categoryKey];
      if (val === 0 || max === 0) return 0;
      const percentage = val / max;
      if (percentage < 0.3) return 0;
      if (percentage < 0.7) return 1;
      return 2;
    };

    return { days, roomTypes, getIntensity };
  }, [data]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex flex-col p-0 gap-0 bg-background border-none shadow-none rounded-none sm:rounded-xl overflow-hidden">
        {/* 1. Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b shrink-0 bg-background dark:bg-background z-20">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 dark:bg-primary/20 rounded-lg">
              <BarChart3 className="h-5 w-5 text-primary" />
            </div>
            <div>
              <DialogTitle className="text-lg font-semibold">
                Báo cáo công suất
              </DialogTitle>
              <p className="text-sm text-muted-foreground">
                Dữ liệu {format(dateRange.from, "dd/MM")} -{" "}
                {format(dateRange.to, "dd/MM")}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <DialogClose asChild>
              <Button variant="ghost" size="icon" className="rounded-full">
                <X className="h-5 w-5" />
              </Button>
            </DialogClose>
          </div>
        </div>

        {/* 2. Controls Toolbar */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between px-4 py-2 bg-muted/30 dark:bg-muted/20 border-b gap-3 shrink-0">
          <div className="flex items-center gap-1 bg-background dark:bg-background rounded-md border dark:border-border p-1 shadow-sm">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={() => handleDateShift(-7)}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>

            <DatePopover
              date={dateRange.from}
              onSelect={(d) => setDateRange((prev) => ({ ...prev, from: d }))}
            />
            <span className="text-muted-foreground text-xs px-1">→</span>
            <DatePopover
              date={dateRange.to}
              onSelect={(d) => setDateRange((prev) => ({ ...prev, to: d }))}
            />

            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={() => handleDateShift(7)}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
            <div className="w-px h-4 bg-border mx-1" />
            <Button
              variant="ghost"
              size="sm"
              className="h-8 text-xs font-normal"
              onClick={() =>
                setDateRange({ from: new Date(), to: addDays(new Date(), 6) })
              }
            >
              <RotateCcw className="h-3.5 w-3.5 mr-1.5" /> Hôm nay
            </Button>
          </div>

          <div className="flex flex-wrap gap-3">
            {CATEGORIES.map((cat) => (
              <div
                key={cat.key}
                className="flex items-center gap-1.5 text-xs font-medium"
              >
                <div
                  className={cn(
                    "w-3 h-3 rounded-full border",
                    cat.colors.bg,
                    cat.colors.border
                  )}
                />
                <span className="text-muted-foreground">{cat.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* 3. The Grid */}
        <div className="flex-1 overflow-auto relative bg-muted/10 dark:bg-muted/5">
          {isLoading ? (
            <div className="flex h-full items-center justify-center">
              Loading...
            </div>
          ) : !processedData ? (
            <div className="flex h-full items-center justify-center text-muted-foreground">
              Không có dữ liệu
            </div>
          ) : (
            <Table>
              <TableHeader className="bg-background dark:bg-background sticky top-0 z-40 shadow-sm dark:shadow-md after:content-[''] after:absolute after:bottom-0 after:left-0 after:right-0 after:h-[1px] after:bg-border dark:after:bg-border">
                <TableRow className="border-none hover:bg-transparent">
                  <TableHead className="w-[250px] sticky left-0 z-50 bg-background dark:bg-background border-r dark:border-border h-auto py-3 pl-6 shadow-md">
                    <span className="text-xs font-bold uppercase text-muted-foreground">
                      Chỉ số / Loại phòng
                    </span>
                  </TableHead>
                  {processedData.days.map((day: any) => {
                    const dateObj = new Date(day.date);
                    const isToday = isSameDay(dateObj, new Date());
                    return (
                      <TableHead
                        key={day.date}
                        className={cn(
                          "text-center min-w-[120px] border-r border-dashed dark:border-border last:border-r-0 h-auto py-3",
                          isToday
                            ? "bg-primary/5 dark:bg-primary/10 text-primary"
                            : ""
                        )}
                      >
                        <div className="flex flex-col items-center justify-center gap-0.5">
                          <span className="text-[10px] uppercase font-semibold opacity-70">
                            {format(dateObj, "EEE", { locale: vi })}
                          </span>
                          <span
                            className={cn(
                              "text-lg font-bold leading-none",
                              isToday && "text-primary"
                            )}
                          >
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

                  return (
                    <CategorySection
                      key={category.key}
                      category={category}
                      processedData={processedData}
                      isExpanded={isExpanded}
                      onToggle={() => toggleRow(category.key)}
                    />
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

// --- Sub-components for cleaner code ---

function DatePopover({
  date,
  onSelect,
}: {
  date: Date;
  onSelect: (d: Date) => void;
}) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          className="h-8 px-2 text-sm font-normal hover:bg-muted dark:hover:bg-muted"
        >
          {format(date, "dd/MM/yyyy")}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          mode="single"
          selected={date}
          onSelect={(d) => d && onSelect(d)}
        />
      </PopoverContent>
    </Popover>
  );
}

interface CategorySectionProps {
  category: ReportCategoryConfig;
  processedData: any;
  isExpanded: boolean;
  onToggle: () => void;
}

function CategorySection({
  category,
  processedData,
  isExpanded,
  onToggle,
}: CategorySectionProps) {
  return (
    <>
      {/* Main Category Row */}
      <TableRow
        className="hover:bg-muted/50 dark:hover:bg-muted/30 cursor-pointer border-b dark:border-border group transition-colors"
        onClick={onToggle}
      >
        {/* Sticky Left Column */}
        <TableCell className="sticky left-0 z-30 bg-background dark:bg-background border-r dark:border-border p-0 shadow-md group-hover:bg-muted/50 dark:group-hover:bg-muted/30 transition-colors">
          <div className="flex items-center gap-3 px-6 py-4">
            <div
              className={cn(
                "flex items-center justify-center w-6 h-6 rounded-md transition-transform duration-200 text-muted-foreground bg-muted dark:bg-muted",
                isExpanded &&
                  "rotate-90 text-foreground bg-primary/10 dark:bg-primary/20"
              )}
            >
              <ChevronRight className="h-4 w-4" />
            </div>
            <div
              className={cn(
                "px-2.5 py-1 rounded-md text-sm font-medium border",
                category.colors.bg,
                category.colors.text,
                category.colors.border
              )}
            >
              {category.label}
            </div>
          </div>
        </TableCell>

        {/* Data Cells */}
        {processedData.days.map((day: any) => {
          const val = Object.values(
            day[category.key] as Record<string, number>
          ).reduce((a: any, b: any) => a + b, 0);
          const intensity = processedData.getIntensity(val, category.key);

          return (
            <TableCell
              key={day.date}
              className="p-0 border-r border-dashed dark:border-border last:border-r-0 text-center h-full"
            >
              <div
                className={cn(
                  "flex items-center justify-center h-full min-h-[56px] w-full text-sm font-medium transition-all",
                  category.colors.intensity[intensity]
                )}
              >
                {val > 0 ? val : <span className="opacity-20">-</span>}
              </div>
            </TableCell>
          );
        })}
      </TableRow>

      {/* Expanded Detail Rows */}
      {isExpanded &&
        processedData.roomTypes.map((roomType: string) => (
          <TableRow
            key={`${category.key}-${roomType}`}
            className="border-b dark:border-border bg-muted/5 dark:bg-muted/5 hover:bg-muted/10 dark:hover:bg-muted/10"
          >
            <TableCell className="sticky left-0 z-20 bg-background/95 dark:bg-background/95 backdrop-blur border-r dark:border-border py-2 pl-16 text-xs font-medium text-muted-foreground shadow-md">
              {roomType}
            </TableCell>
            {processedData.days.map((day: any) => {
              const val = (day[category.key] as any)[roomType] || 0;
              return (
                <TableCell
                  key={`${category.key}-${roomType}-${day.date}`}
                  className="text-center py-2 border-r border-dashed dark:border-border last:border-r-0 text-xs text-muted-foreground"
                >
                  {val > 0 ? val : ""}
                </TableCell>
              );
            })}
          </TableRow>
        ))}
    </>
  );
}
