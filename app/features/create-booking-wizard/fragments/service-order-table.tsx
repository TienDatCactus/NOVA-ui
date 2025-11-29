import { format, parseISO, isSameDay } from "date-fns";
import { vi } from "date-fns/locale";
import {
  Calendar as CalendarIcon,
  MessageSquare,
  Sparkles,
  Trash2,
  Utensils,
} from "lucide-react";
import { useMemo } from "react";
import type z from "zod";

import { Button } from "~/components/ui/button";
import { Calendar } from "~/components/ui/calendar";
import { Input } from "~/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "~/components/ui/popover";
import { Skeleton } from "~/components/ui/skeleton";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "~/components/ui/tooltip";
import { cn } from "~/lib/utils";
import { useMenuItemDetail } from "~/routes/menu/container/menu/query.hooks";
import { useServiceDetail } from "~/routes/services/container/services/query.hooks";
import { OrderSchema } from "~/services/api/orders/order.schema";

const { ServiceOrderItemSchema } = OrderSchema;
type ServiceOrderItemDto = z.infer<typeof ServiceOrderItemSchema>;

interface ServiceOrderTableProps {
  services: ServiceOrderItemDto[];
  onRemove: (itemId: string) => void;
  onUpdate: (itemId: string, updates: Partial<ServiceOrderItemDto>) => void;
  invalidServiceIds?: string[];
  checkinDate?: Date;
  checkoutDate?: Date;
}

interface ServiceOrderItemRowProps {
  service: ServiceOrderItemDto;
  onRemove: () => void;
  onUpdate: (updates: Partial<ServiceOrderItemDto>) => void;
  isInvalid?: boolean;
  checkinDate?: Date;
  checkoutDate?: Date;
}

/**
 * Single Row Component
 * Handles data fetching and individual interactions
 */
function ServiceOrderItemRow({
  service,
  onRemove,
  onUpdate,
  isInvalid,
  checkinDate,
  checkoutDate,
}: ServiceOrderItemRowProps) {
  // 1. Fetch Details based on Type
  const { data: serviceDetail, isLoading: isLoadingService } = useServiceDetail(
    service.itemId,
    { enabled: service.itemType === "ServiceItem" }
  );

  const { data: menuDetail, isLoading: isLoadingMenu } = useMenuItemDetail(
    service.itemId,
    { enabled: service.itemType === "MenuItem" }
  );

  const isLoading = isLoadingService || isLoadingMenu;

  // 2. Resolve Display Data
  const displayName = useMemo(() => {
    if (service.itemType === "ServiceItem" && serviceDetail)
      return serviceDetail.name;
    if (service.itemType === "MenuItem" && menuDetail) return menuDetail.name;
    return "Unknown Item";
  }, [service, serviceDetail, menuDetail]);

  const ItemIcon = service.itemType === "MenuItem" ? Utensils : Sparkles;

  // 3. Handle Date Logic
  const scheduledDate = service.scheduledDate
    ? parseISO(service.scheduledDate)
    : undefined;

  const dateDisplay = useMemo(() => {
    if (!scheduledDate) return "Chọn ngày";
    if (isSameDay(scheduledDate, new Date())) return "Hôm nay";
    return format(scheduledDate, "dd/MM/yyyy");
  }, [scheduledDate]);

  if (isLoading) {
    return (
      <div className="flex items-center gap-4 py-3 border-b px-4">
        <Skeleton className="h-10 w-10 rounded-lg" />
        <div className="space-y-2 flex-1">
          <Skeleton className="h-4 w-1/3" />
          <Skeleton className="h-3 w-1/4" />
        </div>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "group flex flex-col gap-3 py-3 px-4 border-b border-border/50 transition-colors last:border-0 hover:bg-muted/30",
        isInvalid && "bg-destructive/5 border-destructive/20"
      )}
    >
      {/* Top Row: Icon, Name, Delete */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          {/* Icon Box */}
          <div
            className={cn(
              "flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border shadow-sm",
              isInvalid
                ? "bg-red-50 text-red-600 border-red-100"
                : "bg-background text-muted-foreground"
            )}
          >
            <ItemIcon className="h-4 w-4" />
          </div>

          {/* Name & Type */}
          <div className="min-w-0">
            <p
              className={cn(
                "text-sm font-medium truncate",
                isInvalid && "text-destructive"
              )}
            >
              {displayName}
            </p>
            <p className="text-[10px] text-muted-foreground uppercase tracking-wider">
              {service.itemType === "ServiceItem" ? "Service" : "F&B"}
            </p>
          </div>
        </div>

        {/* Delete Action */}
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                onClick={onRemove}
                className="h-8 w-8 text-muted-foreground/50 hover:text-destructive hover:bg-destructive/10"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Xóa dịch vụ này</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>

      {/* Bottom Row: Controls (Date & Note) */}
      <div className="flex items-center gap-2 pl-[48px]">
        {/* Date Picker Pill */}
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              className={cn(
                "h-7 gap-2 rounded-full border-dashed px-3 text-xs font-normal shadow-none hover:border-solid hover:bg-secondary/50",
                !scheduledDate && "text-muted-foreground",
                isInvalid && "border-destructive/50 text-destructive"
              )}
            >
              <CalendarIcon className="h-3 w-3" />
              {dateDisplay}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="single"
              selected={scheduledDate}
              onSelect={(date) =>
                date && onUpdate({ scheduledDate: format(date, "yyyy-MM-dd") })
              }
              disabled={(date) => {
                if (!checkinDate || !checkoutDate) return false;
                return date < checkinDate || date > checkoutDate;
              }}
              initialFocus
              locale={vi}
            />
          </PopoverContent>
        </Popover>

        {/* Note Input (Minimal) */}
        <div className="relative flex-1 group/input">
          <MessageSquare className="absolute left-2 top-1/2 -translate-y-1/2 h-3 w-3 text-muted-foreground/50 group-focus-within/input:text-primary transition-colors" />
          <Input
            value={service.note || ""}
            onChange={(e) => onUpdate({ note: e.target.value })}
            placeholder="Thêm ghi chú..."
            className="h-7 border-transparent bg-transparent pl-7 text-xs shadow-none placeholder:text-muted-foreground/50 focus-visible:bg-background focus-visible:ring-1 focus-visible:ring-ring"
          />
        </div>
      </div>
    </div>
  );
}

/**
 * Main List Component
 * Renders the clean list wrapper
 */
export function ServiceOrderTable({
  services,
  onRemove,
  onUpdate,
  invalidServiceIds = [],
  checkinDate,
  checkoutDate,
}: ServiceOrderTableProps) {
  if (services.length === 0) return null;

  return (
    <div className="rounded-xl border bg-card/50 shadow-sm overflow-hidden">
      {/* Header (Optional, mostly visually implied by rows) */}
      <div className="bg-muted/30 px-4 py-2 border-b">
        <h4 className="text-xs font-medium text-muted-foreground">
          Danh sách ({services.length})
        </h4>
      </div>

      <div className="divide-y">
        {services.map((service) => (
          <ServiceOrderItemRow
            key={service.itemId}
            service={service}
            onRemove={() => onRemove(service.itemId)}
            onUpdate={(updates) => onUpdate(service.itemId, updates)}
            isInvalid={invalidServiceIds.includes(service.itemId)}
            checkinDate={checkinDate}
            checkoutDate={checkoutDate}
          />
        ))}
      </div>
    </div>
  );
}
