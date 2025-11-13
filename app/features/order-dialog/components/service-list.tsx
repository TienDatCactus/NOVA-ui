import { Search } from "lucide-react";
import { Input } from "~/components/ui/input";
import type { ServiceListResponseDto } from "~/services/api/services/dto";
import ServiceCard from "../fragments/service.card";

interface ServiceListProps {
  services: ServiceListResponseDto;
  searchText: string;
  onSearchChange: (value: string) => void;
  isSelected: (itemId: string) => boolean;
  getQuantity: (itemId: string) => number;
  onToggleSelect: (itemId: string) => void;
  onQuantityChange: (itemId: string, quantity: number) => void;
}

/**
 * Service list component
 * Displays filterable grid of services
 */
export default function ServiceList({
  services,
  searchText,
  onSearchChange,
  isSelected,
  getQuantity,
  onToggleSelect,
  onQuantityChange,
}: ServiceListProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-2 h-96 overflow-y-auto">
      {services.length === 0 ? (
        <div className="text-center text-muted-foreground col-span-2 py-8">
          Không có dịch vụ
        </div>
      ) : (
        services.map((service) => (
          <ServiceCard
            key={service.serviceItemId}
            service={service}
            isSelected={isSelected(service.serviceItemId)}
            quantity={getQuantity(service.serviceItemId)}
            onToggle={() => onToggleSelect(service.serviceItemId)}
            onQuantityChange={(qty) =>
              onQuantityChange(service.serviceItemId, qty)
            }
          />
        ))
      )}
    </div>
  );
}
