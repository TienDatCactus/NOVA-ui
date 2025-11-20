import { useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { Label } from "~/components/ui/label";
import { Skeleton } from "~/components/ui/skeleton";
import { useStockItemList } from "../container/items.query.hooks";

interface ItemSelectProps {
  value?: string;
  onValueChange?: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  includeInactive?: boolean;
  label?: string;
  required?: boolean;
}

/**
 * Component select item với search và lazy loading
 */
export default function ItemSelect({
  value,
  onValueChange,
  placeholder = "Chọn hàng hóa...",
  disabled = false,
  includeInactive = false,
  label,
  required = false,
}: ItemSelectProps) {
  const { data: items, isPending } = useStockItemList({
    includeInactive,
  });

  if (isPending) {
    return (
      <div className="space-y-2">
        {label && <Label>{label}</Label>}
        <Skeleton className="h-10 w-full" />
      </div>
    );
  }

  const activeItems = items?.filter((item) => item.isActive) || [];

  return (
    <div className="space-y-2">
      {label && (
        <Label>
          {label}
          {required && <span className="text-destructive ml-1">*</span>}
        </Label>
      )}
      <Select value={value} onValueChange={onValueChange} disabled={disabled}>
        <SelectTrigger>
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>
          {activeItems.map((item) => (
            <SelectItem key={item.id} value={item.id}>
              <div className="flex items-center justify-between gap-4">
                <span>
                  {item.code} - {item.name}
                </span>
                <span className="text-xs text-muted-foreground">
                  Tồn: {item.currentStock} {item.unitCode}
                </span>
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}

/**
 * Hook để lấy item data từ id
 */
export function useItemById(itemId?: string) {
  const { data: items } = useStockItemList({ includeInactive: false });
  return items?.find((item) => item.id === itemId);
}
