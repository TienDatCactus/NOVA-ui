import * as React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogClose,
} from "~/components/ui/dialog";
import { Card } from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { Skeleton } from "~/components/ui/skeleton";
import { useGetRoomQrCode } from "../container/rooms/query.hooks";
import { useRegenerateRoomQRCode } from "../container/rooms/mutation.hooks";
import { X } from "lucide-react";
import Image from "~/components/ui/image";

interface QrDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  roomId: string;
  roomName?: string;
}

export function QrDialog({
  open,
  onOpenChange,
  roomId,
  roomName,
}: QrDialogProps) {
  const {
    data: qrData,
    isLoading,
    isError,
    isFetching,
    refetch,
  } = useGetRoomQrCode(roomId, { enabled: open });
  const {
    mutate: regenerateQR,
    isPending: isRegenerating,
    isError: isRegenerateError,
  } = useRegenerateRoomQRCode();
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="max-w-sm w-full p-0 bg-card rounded-2xl shadow-lg border border-border"
        aria-label="Mã QR phòng"
      >
        <Card className="bg-card rounded-2xl shadow-lg p-6 relative">
          <DialogHeader className="mb-4 flex flex-row items-center justify-between">
            <div>
              <DialogTitle className="text-lg font-bold text-foreground">
                Mã QR phòng
              </DialogTitle>
              <DialogDescription className="text-muted-foreground text-sm">
                {roomName ? (
                  <span>
                    Phòng:{" "}
                    <span className="font-semibold text-foreground">
                      {roomName}
                    </span>
                  </span>
                ) : (
                  <span>
                    ID:{" "}
                    <span className="font-mono text-foreground">{roomId}</span>
                  </span>
                )}
              </DialogDescription>
            </div>
          </DialogHeader>

          <div className="flex flex-col items-center gap-4 py-2">
            {isLoading || isFetching ? (
              <Skeleton className="w-48 h-48 rounded-lg bg-muted" />
            ) : isError ? (
              <div className="text-destructive text-sm">
                Không thể tải mã QR.{" "}
                <Button variant="link" size="sm" onClick={() => refetch()}>
                  Thử lại
                </Button>
              </div>
            ) : qrData ? (
              <Image
                src={qrData} // qrData is now a string data URL
                alt="QR code phòng"
                className="w-64 h-64 rounded-lg border border-border bg-background aspect-square"
                draggable={false}
              />
            ) : null}
          </div>

          <div className="flex flex-col gap-2 mt-2">
            <Button
              variant="outline"
              className="w-full"
              onClick={() => regenerateQR({ roomId })}
              disabled={isRegenerating || isLoading || isFetching}
            >
              {isRegenerating ? "Đang tạo lại mã QR..." : "Tạo lại mã QR"}
            </Button>
            {isRegenerateError && (
              <div className="text-destructive text-xs text-center">
                Không thể tạo lại mã QR. Vui lòng thử lại.
              </div>
            )}
          </div>
        </Card>
      </DialogContent>
    </Dialog>
  );
}
