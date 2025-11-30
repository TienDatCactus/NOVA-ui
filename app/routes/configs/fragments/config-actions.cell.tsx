import { MoreHorizontal, Pencil, RotateCcw } from "lucide-react";
import { useState } from "react";
import { Button } from "~/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import type { ConfigGroupItem } from "~/services/api/configs/dto";
import EditConfigDialog from "./edit-config.dialog";
import ResetConfigDialog from "./reset-config.dialog";

interface ConfigActionsCellProps {
  config: ConfigGroupItem;
}

export default function ConfigActionsCell({ config }: ConfigActionsCellProps) {
  const [updateConfigDialog, setUpdateConfigDialog] = useState(false);
  const [resetConfigDialog, setResetConfigDialog] = useState(false);

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100 focus:opacity-100 data-[state=open]:opacity-100"
          >
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48">
          <DropdownMenuLabel className="text-xs text-muted-foreground font-normal">
            Hành động cho{" "}
            <span className="font-mono text-foreground">{config.shortKey}</span>
          </DropdownMenuLabel>

          <DropdownMenuItem
            className="gap-2 text-xs font-medium cursor-pointer"
            onClick={() => setUpdateConfigDialog(true)}
          >
            <Pencil className="h-3.5 w-3.5" />
            Chỉnh sửa giá trị
          </DropdownMenuItem>

          {config.isUsingCustomValue && (
            <>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="gap-2 text-xs font-medium text-amber-600 focus:text-amber-700 focus:bg-amber-50 dark:focus:bg-amber-950 cursor-pointer"
                onClick={() => setResetConfigDialog(true)}
              >
                <RotateCcw className="h-3.5 w-3.5" />
                Đặt lại về mặc định
              </DropdownMenuItem>
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
      <EditConfigDialog
        config={config}
        onOpenChange={setUpdateConfigDialog}
        open={updateConfigDialog}
      />
      <ResetConfigDialog
        config={config}
        onOpenChange={setResetConfigDialog}
        open={resetConfigDialog}
      />
    </>
  );
}
