import { useMemo, useState } from "react";
import { Search, Sparkles, X } from "lucide-react";

import { Button } from "~/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog";
import { Input } from "~/components/ui/input";
import { ScrollArea } from "~/components/ui/scroll-area";
import { Badge } from "~/components/ui/badge";
import { cn, formatMoney } from "~/lib/utils";

import { useServices } from "~/routes/services/container/services/query.hooks";

interface AddServiceDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAddService: (serviceId: string) => void;
  selectedServiceIds: string[];
  checkinDate?: Date | string;
  checkoutDate?: Date | string;
}

export default function AddServiceDialog({
  open,
  onOpenChange,
  onAddService,
  selectedServiceIds,
  checkinDate,
  checkoutDate,
}: AddServiceDialogProps) {
  const [searchText, setSearchText] = useState("");

  // Fetch available services
  const { data: serviceItems = [], isPending } = useServices({});

  // Filter services by search
  const filteredServices = useMemo(() => {
    if (!searchText.trim()) return serviceItems.slice(0, 12);
    return serviceItems
      .filter((s) => s.name.toLowerCase().includes(searchText.toLowerCase()))
      .slice(0, 12);
  }, [serviceItems, searchText]);

  const handleToggleService = (serviceId: string) => {
    onAddService(serviceId);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            Thêm dịch vụ bổ sung
          </DialogTitle>
          <DialogDescription>
            Chọn các dịch vụ spa, massage, giặt ủi... cho khách
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Search Input */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Tìm kiếm dịch vụ..."
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              className="pl-9"
            />
          </div>

          {/* Service Grid */}
          <ScrollArea className="h-[400px] pr-4">
            {isPending && (
              <div className="text-center text-sm text-muted-foreground py-12">
                Đang tải dịch vụ...
              </div>
            )}

            {!isPending && filteredServices.length === 0 && (
              <div className="text-center text-sm text-muted-foreground py-12">
                Không tìm thấy dịch vụ
              </div>
            )}

            <div className="grid grid-cols-2 gap-3">
              {filteredServices.map((service) => {
                const isSelected = selectedServiceIds.includes(
                  service.serviceItemId
                );

                return (
                  <button
                    key={service.serviceItemId}
                    type="button"
                    onClick={() => handleToggleService(service.serviceItemId)}
                    className={cn(
                      "p-4 rounded-lg border text-left transition-all hover:shadow-sm",
                      isSelected
                        ? "border-primary bg-primary/5 shadow-sm"
                        : "border-border bg-background hover:border-primary/50"
                    )}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">
                          {service.name}
                        </p>
                        {service.description && (
                          <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                            {service.description}
                          </p>
                        )}
                        <p className="text-xs font-semibold text-primary mt-2">
                          {formatMoney(service.basePrice).vndFormatted}
                        </p>
                      </div>
                      {isSelected && (
                        <div className="h-5 w-5 rounded-full bg-primary flex items-center justify-center shrink-0">
                          <svg
                            className="h-3 w-3 text-primary-foreground"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={3}
                              d="M5 13l4 4L19 7"
                            />
                          </svg>
                        </div>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </ScrollArea>

          {/* Selected Count */}
          {selectedServiceIds.length > 0 && (
            <div className="flex items-center gap-2 pt-2 border-t">
              <Badge variant="secondary" className="text-xs">
                Đã chọn {selectedServiceIds.length} dịch vụ
              </Badge>
            </div>
          )}
        </div>

        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline">Đóng</Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
