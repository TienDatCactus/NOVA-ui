import { MessageSquare, QrCode, Loader2, Scan, Terminal } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { Button } from "~/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "~/components/ui/dialog";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { Badge } from "~/components/ui/badge";
import STORAGE, { getStorage, setStorage } from "~/lib/storage";
import { useChatEntry } from "~/routes/chat/container/query.hooks";
import { toast } from "sonner";
import type { Route } from "./+types/inbox";
import {
  Empty,
  EmptyHeader,
  EmptyTitle,
  EmptyDescription,
  EmptyContent,
  EmptyMedia,
} from "~/components/ui/empty";
import { QRScanner } from "~/components/qr-scanner";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
export default function ChatInbox({}: Route.ComponentProps) {
  const navigate = useNavigate();
  const [isQRScannerOpen, setIsQRScannerOpen] = useState(false);
  const [savedToken, setSavedToken] = useState<string | null>(null);
  // Load saved room token from storage
  useEffect(() => {
    const token = getStorage(STORAGE.GUEST_ROOM_TOKEN);
    if (token) {
      setSavedToken(token);
    }
  }, []);

  // Validate saved token
  const { data: entry, isLoading } = useChatEntry(
    savedToken || "",
    !!savedToken
  );

  const handleQRScan = () => {
    setIsQRScannerOpen(true);
    navigator.mediaDevices
      .getUserMedia({ video: { facingMode: "environment" } })
      .then((stream) => {
        console.log("Camera access granted");
        stream.getTracks().forEach((track) => track.stop());
      })
      .catch((err) => {
        toast.error(
          "Không thể truy cập camera. Vui lòng cấp quyền trong cài đặt."
        );
        console.error("Camera access denied:", err);
        setIsQRScannerOpen(false);
      });
  };

  const handleQRScanned = (token: string) => {
    setStorage(STORAGE.GUEST_ROOM_TOKEN, token);
    setSavedToken(token);
    setIsQRScannerOpen(false);
    toast.success("Đã quét mã QR thành công!");
    navigate(`/chat?roomToken=${token}`);
  };

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center space-y-4">
          <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto" />
          <p className="text-sm text-muted-foreground">
            Đang kiểm tra phiên chat...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-background">
      <div className="bg-white border-b p-6">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <MessageSquare className="h-6 w-6 text-primary" />
            Chat với Lễ tân
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Liên hệ trực tiếp với nhân viên để được hỗ trợ
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 min-h-0 overflow-y-auto p-6 pb-16 ">
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Empty State - No Active Session */}
          {!savedToken && (
            <Empty className="border-dashed">
              <EmptyHeader className="text-center">
                <EmptyMedia variant={"icon"}>
                  <QrCode />
                </EmptyMedia>
                <EmptyTitle>Chưa có phiên chat</EmptyTitle>
                <EmptyDescription>
                  Quét mã QR trong phòng để bắt đầu trò chuyện với lễ tân
                </EmptyDescription>
              </EmptyHeader>
              <EmptyContent>
                <div className="flex gap-2">
                  <Button onClick={handleQRScan}>
                    <Scan className="h-5 w-5 mr-2" />
                    Quét mã QR
                  </Button>
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button variant="outline">
                        <Terminal className="h-5 w-5 mr-2" /> Nhập mã phòng thủ
                        công
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-md gap-0">
                      <DialogHeader>
                        <DialogTitle>Nhập mã phòng thủ công</DialogTitle>
                        <DialogDescription>
                          Vui lòng nhập mã phòng (Room Token) để kết nối với
                          phiên chat của bạn
                        </DialogDescription>
                      </DialogHeader>
                      <form
                        onSubmit={(e) => {
                          e.preventDefault();
                          const formData = new FormData(e.currentTarget);
                          const token = formData.get("roomToken") as string;
                          if (token) {
                            handleQRScanned(token);
                          }
                        }}
                        className="mt-4 space-y-4"
                      >
                        <div className="grid gap-2">
                          <Label
                            htmlFor="roomToken"
                            className="block text-sm font-medium mb-1"
                          >
                            Mã phòng (Room Token)
                          </Label>
                          <Input
                            type="text"
                            name="roomToken"
                            id="roomToken"
                            required
                          />
                        </div>
                        <DialogFooter>
                          <Button type="submit">Kết nối</Button>
                        </DialogFooter>
                      </form>
                    </DialogContent>
                  </Dialog>
                </div>
              </EmptyContent>
            </Empty>
          )}

          {/* Active Session Display */}
          {savedToken && entry && (
            <Card>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <MessageSquare className="h-5 w-5" />
                      Phiên chat của bạn
                    </CardTitle>
                    <CardDescription className="mt-1">
                      Phòng: {entry.roomName || "N/A"}
                    </CardDescription>
                  </div>
                  <Badge variant={entry.canChat ? "default" : "secondary"}>
                    {entry.canChat ? "Đang mở" : "Đã đóng"}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button
                  onClick={() => navigate(`/chat?roomToken=${savedToken}`)}
                  className="w-full"
                  size="lg"
                  disabled={!entry.canChat}
                >
                  <MessageSquare className="h-5 w-5 mr-2" />
                  Mở chat
                </Button>
                {!entry.canChat && (
                  <p className="text-xs text-center text-muted-foreground">
                    {entry.message || "Phiên chat không khả dụng"}
                  </p>
                )}
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Hướng dẫn sử dụng</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm text-muted-foreground">
              <div className="flex gap-2">
                <span className="font-semibold text-foreground">1.</span>
                <p>
                  Tìm mã QR trong phòng (thường ở bàn làm việc hoặc tủ đầu
                  giường)
                </p>
              </div>
              <div className="flex gap-2">
                <span className="font-semibold text-foreground">2.</span>
                <p>Nhấn "Quét mã QR" và cho phép truy cập camera</p>
              </div>
              <div className="flex gap-2">
                <span className="font-semibold text-foreground">3.</span>
                <p>Quét mã QR để kết nối với phiên chat của phòng</p>
              </div>
              <div className="flex gap-2">
                <span className="font-semibold text-foreground">4.</span>
                <p>Bắt đầu trò chuyện với nhân viên lễ tân</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* QR Scanner Dialog */}
      <Dialog open={isQRScannerOpen} onOpenChange={setIsQRScannerOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Quét mã QR</DialogTitle>
            <DialogDescription>
              Hướng camera vào mã QR trong phòng của bạn
            </DialogDescription>
          </DialogHeader>
          <QRScanner
            onScan={handleQRScanned}
            onError={(error) => {
              console.error("QR Scanner error:", error);
              toast.error("Lỗi quét mã QR. Vui lòng thử lại.");
            }}
          />
          <Button
            onClick={() => {
              setIsQRScannerOpen(false);
            }}
            variant="outline"
            className="w-full"
          >
            Nhập mã thủ công thay thế
          </Button>
        </DialogContent>
      </Dialog>
    </div>
  );
}
