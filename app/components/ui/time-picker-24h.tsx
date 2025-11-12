import * as React from "react";
import { Clock } from "lucide-react";
import { cn } from "~/lib/utils";
import { Button } from "~/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "~/components/ui/popover";

interface TimePicker24hProps {
  value?: string; // Format: "HH:mm" or "HH:mm:ss"
  onChange?: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
}

export function TimePicker24h({
  value = "",
  onChange,
  placeholder = "Chọn giờ",
  disabled = false,
  className,
}: TimePicker24hProps) {
  const [open, setOpen] = React.useState(false);

  // helper: chặn bubble wheel/touch để lăn trong popover
  const stopWheel = React.useCallback((e: React.WheelEvent) => {
    e.stopPropagation();
  }, []);
  const stopTouchMove = React.useCallback((e: React.TouchEvent) => {
    e.stopPropagation();
  }, []);

  // Parse value to get hour and minute
  const parseTime = (timeStr: string) => {
    if (!timeStr) return { hour: 0, minute: 0 };
    const parts = timeStr.split(":");
    return {
      hour: parseInt(parts[0] || "0", 10),
      minute: parseInt(parts[1] || "0", 10),
    };
  };

  const { hour, minute } = parseTime(value);

  // Format time as HH:mm:ss for backend
  const formatTime = (h: number, m: number) => {
    const hh = h.toString().padStart(2, "0");
    const mm = m.toString().padStart(2, "0");
    return `${hh}:${mm}:00`;
  };

  // Display format HH:mm
  const displayValue = value
    ? `${hour.toString().padStart(2, "0")}:${minute.toString().padStart(2, "0")}`
    : "";

  const handleHourChange = (newHour: number) => {
    onChange?.(formatTime(newHour, minute));
  };

  const handleMinuteChange = (newMinute: number) => {
    onChange?.(formatTime(hour, newMinute));
  };

  // Generate hours (0-23)
  const hours = Array.from({ length: 24 }, (_, i) => i);

  // Generate minutes (0-59)
  const minutes = Array.from({ length: 60 }, (_, i) => i);

  return (
    // Nếu Popover nằm trong Dialog và vẫn khó cuộn, có thể thêm prop modal
    // <Popover open={open} onOpenChange={setOpen} modal>
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          disabled={disabled}
          className={cn(
            "w-full justify-start text-left font-normal",
            !value && "text-muted-foreground",
            className
          )}
        >
          <Clock className="mr-2 h-4 w-4" />
          {displayValue || placeholder}
        </Button>
      </PopoverTrigger>

      <PopoverContent
        className="w-auto p-0"
        align="start"
        // fix: cho phép lăn chuột trong Popover, không bubble lên parent
        onWheel={stopWheel}
        onTouchMove={stopTouchMove}
      >
        <div className="flex divide-x">
          {/* Hours */}
          <div className="flex flex-col">
            <div className="px-3 py-2 text-sm font-semibold border-b bg-muted/50">
              Giờ
            </div>
            <div
              className="h-[240px] overflow-y-scroll overflow-x-hidden"
              style={{
                scrollbarWidth: "thin",
                scrollbarColor: "hsl(var(--muted-foreground)) transparent",
                // giữ scroll trong vùng con, tránh lan ra parent
                overscrollBehavior: "contain",
              }}
            >
              <div className="flex flex-col gap-1 p-2" style={{ pointerEvents: "auto" }}>
                {hours.map((h) => (
                  <button
                    key={h}
                    type="button"
                    className={cn(
                      "h-9 w-16 rounded-md font-mono text-sm transition-colors shrink-0",
                      "hover:bg-accent hover:text-accent-foreground",
                      "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                      hour === h
                        ? "bg-primary text-primary-foreground hover:bg-primary/90"
                        : "bg-transparent"
                    )}
                    onClick={() => handleHourChange(h)}
                  >
                    {h.toString().padStart(2, "0")}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Minutes */}
          <div className="flex flex-col">
            <div className="px-3 py-2 text-sm font-semibold border-b bg-muted/50">
              Phút
            </div>
            <div
              className="h-[240px] overflow-y-scroll overflow-x-hidden"
              style={{
                scrollbarWidth: "thin",
                scrollbarColor: "hsl(var(--muted-foreground)) transparent",
                overscrollBehavior: "contain",
              }}
            >
              <div className="flex flex-col gap-1 p-2" style={{ pointerEvents: "auto" }}>
                {minutes.map((m) => (
                  <button
                    key={m}
                    type="button"
                    className={cn(
                      "h-9 w-16 rounded-md font-mono text-sm transition-colors shrink-0",
                      "hover:bg-accent hover:text-accent-foreground",
                      "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                      minute === m
                        ? "bg-primary text-primary-foreground hover:bg-primary/90"
                        : "bg-transparent"
                    )}
                    onClick={() => handleMinuteChange(m)}
                  >
                    {m.toString().padStart(2, "0")}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between p-3 border-t bg-muted/30">
          <span className="text-sm text-muted-foreground">Thời gian đã chọn:</span>
          <span className="text-sm font-mono font-semibold">
            {displayValue || "--:--"}
          </span>
        </div>
      </PopoverContent>
    </Popover>
  );
}
