import { RotateCcw } from "lucide-react";
import { useState } from "react";
import { Button } from "~/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "~/components/ui/tooltip";
import RefundDialog from "./refund-dialog";

interface RefundButtonProps {
  bookingId: string;
  bookingNumber: string;
  bookingStatus: string;
  totalPaidAmount: number;
  variant?: "default" | "outline" | "destructive" | "ghost";
  size?: "default" | "sm" | "lg" | "icon";
  showLabel?: boolean;
  className?: string;
}

export default function RefundButton({
  bookingId,
  bookingNumber,
  bookingStatus,
  totalPaidAmount,
  variant = "outline",
  size = "default",
  showLabel = true,
  className,
}: RefundButtonProps) {
  const [dialogOpen, setDialogOpen] = useState(false);

  const canRefund = bookingStatus !== "CheckedOut" && totalPaidAmount > 0;
  if (!canRefund) {
    const reason =
      bookingStatus === "CheckedOut"
        ? "Không thể hoàn tiền cho booking đã checkout"
        : "Chưa có giao dịch nào để hoàn tiền";

    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <div>
              <Button
                variant={variant}
                size={size}
                disabled
                className={className}
              >
                <RotateCcw className="w-4 h-4" />
                {showLabel && <span className="ml-2">Hoàn tiền</span>}
              </Button>
            </div>
          </TooltipTrigger>
          <TooltipContent>
            <p className="text-xs">{reason}</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  return (
    <>
      <Button
        variant={variant}
        size={size}
        onClick={() => setDialogOpen(true)}
        className={className}
      >
        <RotateCcw className="w-4 h-4" />
        {showLabel && <span className="ml-2">Hoàn tiền</span>}
      </Button>

      <RefundDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        bookingId={bookingId}
        bookingNumber={bookingNumber}
        totalPaidAmount={totalPaidAmount}
        bookingStatus={bookingStatus}
      />
    </>
  );
}
