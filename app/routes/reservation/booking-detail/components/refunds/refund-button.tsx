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
import {
  AuthLoader,
  hasAnyRole,
  hasRole,
  UserRole,
} from "~/lib/auth/auth.loader";

interface RefundButtonProps {
  bookingId: string;
  bookingNumber: string;
  bookingStatus: string;
  totalPaidAmount: number;
  showLabel?: boolean;
  className?: string;
}

export default function RefundButton({
  bookingId,
  bookingNumber,
  bookingStatus,
  totalPaidAmount,
  showLabel = true,
  className,
}: RefundButtonProps) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const canRefund =
    (bookingStatus === "CheckedOut" ||
      (bookingStatus === "Pending" && totalPaidAmount > 0)) &&
    hasRole(AuthLoader.getUser(), UserRole.HotelManager) &&
    totalPaidAmount > 0;
  if (!canRefund) {
    return null;
  }
  return (
    <>
      <Button
        variant={"destructive-ghost"}
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
