import * as React from "react";
import { Check, ChevronsUpDown } from "lucide-react";

import { cn } from "~/lib/utils";
import { Button } from "~/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "~/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "~/components/ui/popover";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import { Checkbox } from "~/components/ui/checkbox";
import { Label } from "~/components/ui/label";

interface ComboboxProps {
  value: string[];
  onChange: (value: string[]) => void;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  items?: any[];
  disabled?: boolean;
}

export function Combobox({
  value,
  onChange,
  open,
  onOpenChange,
  items,
  disabled,
}: ComboboxProps) {
  const isAllSelected = items!.length > 0 && value.length === items!.length;

  const handleToggleAll = () => {
    if (isAllSelected) {
      onChange([]);
    } else {
      const allItemValues = items!.map((item) => format(item, "yyyy-MM-dd"));
      onChange(allItemValues);
    }
  };
  return (
    <Popover open={open} onOpenChange={onOpenChange}>
      <PopoverTrigger disabled={!disabled} asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-[200px] justify-between"
        >
          {value ? `Đã chọn ${value.length} ngày` : "Chọn ngày..."}
          <ChevronsUpDown className="opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[200px] p-0">
        <Command>
          <CommandList>
            <CommandEmpty>Không có ngày hợp lệ.</CommandEmpty>
            <CommandGroup>
              <CommandItem onSelect={handleToggleAll}>
                <div className="flex items-start gap-3">
                  <Checkbox id="toggle" checked={isAllSelected} />
                  <Label htmlFor="toggle">Chọn tất cả</Label>
                </div>
              </CommandItem>
              {items &&
                items.length > 0 &&
                items.map((item: any) => (
                  <CommandItem
                    key={format(item, "yyyy-MM-dd")}
                    value={format(item, "yyyy-MM-dd")}
                    onSelect={(currentValue) => {
                      onChange(
                        !value.includes(currentValue)
                          ? [...value, currentValue]
                          : value.filter((v) => v !== currentValue)
                      );
                    }}
                  >
                    {format(item, "EEEE, dd MMMM/yyyy", { locale: vi })}
                    <Check
                      className={cn(
                        "ml-auto",
                        value.includes(format(item, "yyyy-MM-dd"))
                          ? "opacity-100"
                          : "opacity-0"
                      )}
                    />
                  </CommandItem>
                ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
