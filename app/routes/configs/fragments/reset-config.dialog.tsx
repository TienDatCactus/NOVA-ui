import { ArrowDown, RotateCcw } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "~/components/ui/alert-dialog";
import { buttonVariants } from "~/components/ui/button";
import { cn } from "~/lib/utils";
import type { ConfigGroupItem } from "~/services/api/configs/dto";
import { useDeleteConfig } from "../container/query.hooks";

interface ResetConfigDialogProps {
  config: ConfigGroupItem;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function ResetConfigDialog({
  config,
  open,
  onOpenChange,
}: ResetConfigDialogProps) {
  const { mutate: resetConfig, isPending } = useDeleteConfig();

  const handleReset = () => {
    resetConfig(config.key, {
      onSuccess: () => {
        onOpenChange(false);
      },
    });
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="max-w-[400px] gap-6">
        <AlertDialogHeader className="items-center text-center sm:text-center">
          {/* Visual Icon: Amber for "Restorative Caution" */}
          <div className="mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-500">
            <RotateCcw className="h-6 w-6" />
          </div>

          <AlertDialogTitle className="text-xl">
            Đặt lại cấu hình?
          </AlertDialogTitle>
          <AlertDialogDescription>
            Bạn có chắc muốn đặt lại{" "}
            <span className="font-mono text-foreground font-medium">
              {config.shortKey}
            </span>{" "}
            về mặc định hệ thống?
          </AlertDialogDescription>
        </AlertDialogHeader>

        {/* === VISUAL DIFF BLOCK === */}
        <div className="relative flex flex-col gap-1 rounded-lg border border-border bg-muted/20 p-4 text-sm">
          {/* BEFORE (Current Custom Value) */}
          <div className="flex items-center justify-between gap-4">
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider w-16">
              Hiện tại
            </span>
            <span
              className="font-mono text-destructive line-through decoration-destructive/50 opacity-70 truncate max-w-[200px]"
              title={config.currentValue}
            >
              {config.currentValue}
            </span>
          </div>

          {/* Directional Arrow */}
          <div className="flex justify-end py-1 pr-6 opacity-30">
            <ArrowDown className="h-4 w-4" />
          </div>

          {/* AFTER (Default Value) */}
          <div className="flex items-center justify-between gap-4">
            <span className="text-xs font-medium text-emerald-600 dark:text-emerald-500 uppercase tracking-wider w-16">
              Mặc định
            </span>
            <span
              className="font-mono text-foreground font-medium truncate max-w-[200px]"
              title={config.defaultValue || "null"}
            >
              {config.defaultValue || (
                <span className="italic opacity-50">null</span>
              )}
            </span>
          </div>
        </div>

        <AlertDialogFooter className="sm:justify-center gap-2 w-full">
          <AlertDialogCancel disabled={isPending} className="w-full sm:w-auto">
            Hủy
          </AlertDialogCancel>

          {/* Custom styled Action button to match the Amber theme */}
          <AlertDialogAction
            onClick={handleReset}
            disabled={isPending}
            className={cn(
              buttonVariants({ variant: "default" }),
              "w-full sm:w-auto bg-amber-600 hover:bg-amber-700 text-white dark:bg-amber-700 dark:hover:bg-amber-600"
            )}
          >
            {isPending ? "Restoring..." : "Confirm Reset"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
