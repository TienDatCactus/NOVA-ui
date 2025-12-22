import { CornerDownRight } from "lucide-react";
import { cn } from "~/lib/utils";
import type { ConfigGroupItem } from "~/services/api/configs/dto";
import ConfigActionsCell from "../fragments/config-actions.cell";

interface ConfigItemRowProps {
  config: ConfigGroupItem;
}

export default function ConfigItemRow({ config }: ConfigItemRowProps) {
  const isModified = config.isUsingCustomValue;
  const isEmpty = !config.currentValue;

  return (
    <div
      className={cn(
        "group relative grid grid-cols-12 gap-4 py-3 px-3 transition-colors hover:bg-muted/40",
        "border-b border-border/40 last:border-0"
      )}
    >
      {isModified && (
        <div className="absolute left-0 top-3 bottom-3 w-[3px] rounded-r-full bg-primary" />
      )}

      <div className="col-span-11 md:col-span-5 flex flex-col justify-center gap-1 pl-3">
        <div className="flex items-center gap-2">
          <span
            className={cn(
              "font-mono text-sm font-semibold tracking-tight truncate select-all",
              isModified ? "text-foreground" : "text-foreground/80"
            )}
            title={config.key}
          >
            {config.displayName || config.key}
          </span>

          {isModified && (
            <span className="flex h-1.5 w-1.5 rounded-full bg-primary ring-4 ring-primary/10 animate-pulse" />
          )}
        </div>

        {/* Description: High readability text */}
        <p className="line-clamp-1 text-[11px] text-muted-foreground leading-relaxed pr-4">
          {config.description || (
            <span className="italic opacity-50">Không có mô tả</span>
          )}
        </p>
      </div>

      <div className="col-span-11 md:col-span-6 flex flex-col justify-center gap-1.5 pl-3 md:pl-0">
        <div className="flex items-center gap-2">
          <div
            className={cn(
              "relative max-w-full truncate rounded px-2 py-0.5 text-sm font-mono transition-colors border",
              isModified
                ? "bg-primary/10 text-primary border-primary/20 dark:bg-primary/20 dark:text-primary dark:border-primary/30"
                : "bg-muted/30 text-foreground border-transparent",
              isEmpty &&
                "italic text-muted-foreground bg-transparent border-dashed border-border"
            )}
            title={config.currentValue || "Empty"}
          >
            {config.currentValue || "Empty"}
          </div>
        </div>

        {/* Default Value: Contextual Help */}
        <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground font-mono pl-1">
          <CornerDownRight className="h-3 w-3 opacity-50" />
          <span>Mặc định :</span>
          <span
            className="truncate max-w-[200px]"
            title={config.defaultValue || ""}
          >
            {config.defaultValue || "null"}
          </span>
        </div>
      </div>

      <div className="absolute right-2 top-3 md:static md:col-span-1 flex items-start md:items-center justify-end">
        <ConfigActionsCell config={config} />
      </div>
    </div>
  );
}
