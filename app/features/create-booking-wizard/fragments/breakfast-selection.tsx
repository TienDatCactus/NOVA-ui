import { Coffee } from "lucide-react";

import { Label } from "~/components/ui/label";
import { Switch } from "~/components/ui/switch";

interface BreakfastSelectionProps {
  isBreakfastAll: boolean;
  onToggleAll: (value: boolean) => void;
  checkinDate: Date;
  checkoutDate: Date;
  nights: number;
}

export function BreakfastSelection({
  isBreakfastAll,
  onToggleAll,
  nights,
}: BreakfastSelectionProps) {
  return (
    <div className="flex items-center justify-between rounded-lg border border-primary/20 bg-primary/5 p-3">
      <div className="flex items-center gap-3">
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-background text-primary shadow-sm dark:bg-primary/10">
          <Coffee className="h-4 w-4" />
        </div>
        <div className="space-y-0.5">
          <Label
            htmlFor="breakfast-all"
            className="text-sm font-medium text-foreground cursor-pointer"
          >
            Bữa sáng mỗi ngày
          </Label>
          <p className="text-[10px] text-muted-foreground uppercase tracking-wide">
            Áp dụng {nights} đêm
          </p>
        </div>
      </div>
      <Switch
        id="breakfast-all"
        className="data-[state=checked]:bg-primary"
        checked={isBreakfastAll}
        onCheckedChange={onToggleAll}
      />
    </div>
  );
}
