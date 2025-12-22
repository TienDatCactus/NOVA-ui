import { Loader2, QrCode, RefreshCw } from "lucide-react";
import { Button } from "~/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog";
import Image from "~/components/ui/image";
import { Skeleton } from "~/components/ui/skeleton";
import { useRegenerateRoomQRCode } from "../../container/rooms/mutation.hooks";
import { useGetRoomQrCode } from "../../container/rooms/query.hooks";

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
    refetch,
  } = useGetRoomQrCode(roomId, { enabled: open });
  const { mutate: regenerateQR, isPending: isRegenerating } =
    useRegenerateRoomQRCode();
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <QrCode className="h-5 w-5 text-primary" />
            Mã QR Phòng
          </DialogTitle>
          <DialogDescription>
            Quét mã để truy cập Chat cho phòng{" "}
            <span className="font-semibold text-foreground">
              {roomName || roomId}
            </span>
          </DialogDescription>
        </DialogHeader>

        {/* QR Display Area */}
        <div className="flex flex-col items-center justify-center py-6">
          {isLoading ? (
            <Skeleton className="h-64 w-64 rounded-xl" />
          ) : isError ? (
            <div className="flex h-64 w-64 flex-col items-center justify-center rounded-xl border border-dashed text-center p-4">
              <span className="text-sm text-muted-foreground mb-2">
                Không thể tải mã QR
              </span>
              <Button variant="outline" size="sm" onClick={() => refetch()}>
                Thử lại
              </Button>
            </div>
          ) : qrData ? (
            <div className="relative group">
              {/* White background wrapper ensures QR is scannable in Dark Mode */}
              <div className="bg-white p-4 rounded-xl border shadow-sm">
                <Image
                  src={qrData}
                  alt={`Mã QR cho phòng ${roomName}`}
                  className="h-56 w-56 object-contain" // Fixed size prevents layout shifts
                  draggable={false}
                />
              </div>
            </div>
          ) : null}
        </div>

        <DialogFooter className="flex flex-col gap-2 sm:flex-row sm:justify-between sm:gap-0">
          <Button
            variant="default"
            className="w-full "
            onClick={() => regenerateQR({ roomId })}
            disabled={isRegenerating || isLoading}
          >
            {isRegenerating ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Đang tạo...
              </>
            ) : (
              <>
                <RefreshCw className="mr-2 h-4 w-4" />
                Tạo mã mới
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
