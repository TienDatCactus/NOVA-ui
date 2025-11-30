import {
  MessageSquare,
  QrCode,
  Loader2,
  Scan,
  Terminal,
  MessageCircleReply,
  MessageCircle,
  LogOut,
} from "lucide-react";
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
import STORAGE, { deleteStorage, getStorage, setStorage } from "~/lib/storage";
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
import { CUSTOMER } from "~/lib/fe-url";
import { cn } from "~/lib/utils";

export default function ChatInbox({}: Route.ComponentProps) {
  const navigate = useNavigate();
  const [isQRScannerOpen, setIsQRScannerOpen] = useState(false);
  const [savedToken, setSavedToken] = useState<string | null>(null);

  // Load token from storage on mount
  useEffect(() => {
    const token = getStorage(STORAGE.GUEST_ROOM_TOKEN);
    if (token) {
      setSavedToken(token);
    }
  }, []);

  // Validate saved token
  const {
    data: entry,
    isLoading,
    isError,
  } = useChatEntry(savedToken || "", !!savedToken);

  // If validation fails (e.g. expired token), clear it
  useEffect(() => {
    if (isError) {
      deleteStorage(STORAGE.GUEST_ROOM_TOKEN);
      setSavedToken(null);
    }
  }, [isError]);

  const handleCloseChat = () => {
    if (
      confirm(
        "Bạn có chắc muốn đóng phiên chat này? Bạn sẽ cần quét mã lại để kết nối."
      )
    ) {
      deleteStorage(STORAGE.GUEST_ROOM_TOKEN);
      setSavedToken(null);
      toast.success("Đã đóng phiên chat");
    }
  };

  const handleOpenChat = () => {
    if (savedToken) {
      navigate(CUSTOMER.chat(savedToken));
    }
  };

  const handleQRScan = () => {
    setIsQRScannerOpen(true);
  };

  const handleQRScanned = (scannedText: string) => {
    try {
      let token: string | null = null;
      // Try to parse as URL first to extract query param
      try {
        const url = new URL(scannedText);
        token = url.searchParams.get("roomToken");
      } catch {
        // If not a URL, treat as direct token string
        token = scannedText;
      }

      if (!token) {
        toast.error("Mã QR không hợp lệ (Không tìm thấy token)");
        return;
      }

      setStorage(STORAGE.GUEST_ROOM_TOKEN, token);
      setSavedToken(token);
      setIsQRScannerOpen(false);
      toast.success("Kết nối thành công!");
      // Auto navigate or let user click? Let's navigate for smoother exp
      navigate(CUSTOMER.chat(token));
    } catch (error) {
      console.error("QR scan error:", error);
      toast.error("Không thể xử lý mã QR");
    }
  };

  const handleManualSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const token = formData.get("roomToken") as string;
    if (token.trim()) {
      handleQRScanned(token.trim());
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <div className="text-center space-y-4">
          <Loader2 className="h-10 w-10 animate-spin text-primary mx-auto" />
          <p className="text-sm text-muted-foreground">
            Đang kiểm tra kết nối...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-muted/30 flex flex-col">
      {/* Header */}
      <header className="bg-background border-b sticky top-0 z-10">
        <div className="container max-w-lg mx-auto px-4 h-14 flex items-center justify-between">
          <h1 className="font-bold text-lg flex items-center gap-2">
            <MessageSquare className="h-5 w-5 text-primary" />
            Hỗ trợ khách hàng
          </h1>
        </div>
      </header>

      <main className="flex-1 container max-w-lg mx-auto p-4 pb-20 space-y-6">
        {/* --- STATE 1: NO ACTIVE SESSION --- */}
        {!savedToken && (
          <div className="flex flex-col items-center justify-center py-10 space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mb-2">
              <QrCode className="h-10 w-10 text-primary" />
            </div>
            <div className="text-center space-y-2">
              <h2 className="text-xl font-bold">Kết nối với Lễ tân</h2>
              <p className="text-muted-foreground text-sm max-w-xs mx-auto">
                Quét mã QR được cung cấp trong phòng của bạn để bắt đầu yêu cầu
                hỗ trợ hoặc trò chuyện.
              </p>
            </div>

            <div className="flex flex-col w-full gap-3 max-w-xs">
              <Button
                size="lg"
                onClick={handleQRScan}
                className="w-full shadow-lg shadow-primary/20"
              >
                <Scan className="h-5 w-5 mr-2" /> Quét mã QR ngay
              </Button>

              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="outline" className="w-full">
                    <Terminal className="h-4 w-4 mr-2" /> Nhập mã thủ công
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-md">
                  <DialogHeader>
                    <DialogTitle>Nhập mã phòng</DialogTitle>
                    <DialogDescription>
                      Nhập mã token được in dưới mã QR hoặc do lễ tân cung cấp.
                    </DialogDescription>
                  </DialogHeader>
                  <form
                    onSubmit={handleManualSubmit}
                    className="space-y-4 pt-4"
                  >
                    <div className="space-y-2">
                      <Label htmlFor="roomToken">Mã phòng (Token)</Label>
                      <Input
                        id="roomToken"
                        name="roomToken"
                        placeholder="VD: eyJhbGciOiJIUz..."
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
          </div>
        )}

        {/* --- STATE 2: ACTIVE SESSION --- */}
        {savedToken && entry && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="bg-card border rounded-xl shadow-sm overflow-hidden">
              <div className="bg-primary/5 p-4 border-b flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-background flex items-center justify-center border">
                    <MessageCircle className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-sm">
                      Phòng {entry.roomName || "..."}
                    </h3>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <span
                        className={cn(
                          "w-2 h-2 rounded-full",
                          entry.canChat ? "bg-green-500" : "bg-gray-300"
                        )}
                      />
                      <span className="text-xs text-muted-foreground">
                        {entry.canChat ? "Đang hoạt động" : "Đã kết thúc"}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-4 space-y-4">
                {!entry.canChat && (
                  <div className="bg-muted/50 p-3 rounded-md text-xs text-center text-muted-foreground">
                    {entry.message || "Phiên chat này đã kết thúc."}
                  </div>
                )}

                <div className="grid grid-cols-2 gap-3">
                  <Button
                    className="w-full"
                    variant={entry.canChat ? "default" : "secondary"}
                    onClick={handleOpenChat}
                    disabled={!entry.canChat}
                  >
                    <MessageCircle className="h-4 w-4 mr-2" />
                    Vào đoạn chat
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full text-destructive hover:text-destructive hover:bg-destructive/10"
                    onClick={handleCloseChat}
                  >
                    <LogOut className="h-4 w-4 mr-2" />
                    Thoát phiên
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* --- HELP SECTION --- */}
        <div className="border-t pt-6 mt-8">
          <h3 className="font-semibold text-sm mb-4 text-muted-foreground uppercase tracking-wider">
            Hướng dẫn nhanh
          </h3>
          <div className="grid gap-4 text-sm">
            <div className="flex gap-3">
              <div className="flex-none w-6 h-6 rounded-full bg-muted flex items-center justify-center text-xs font-bold">
                1
              </div>
              <p className="text-muted-foreground">
                Tìm mã QR được đặt trong phòng (thường ở bàn làm việc hoặc hướng
                dẫn phòng).
              </p>
            </div>
            <div className="flex gap-3">
              <div className="flex-none w-6 h-6 rounded-full bg-muted flex items-center justify-center text-xs font-bold">
                2
              </div>
              <p className="text-muted-foreground">
                Nhấn nút "Quét mã QR" ở trên và cấp quyền truy cập camera.
              </p>
            </div>
            <div className="flex gap-3">
              <div className="flex-none w-6 h-6 rounded-full bg-muted flex items-center justify-center text-xs font-bold">
                3
              </div>
              <p className="text-muted-foreground">
                Sau khi kết nối, bạn có thể nhắn tin yêu cầu dọn phòng, gọi đồ
                ăn hoặc hỏi thông tin.
              </p>
            </div>
          </div>
        </div>
      </main>

      {/* QR Scanner Dialog Overlay */}
      <Dialog open={isQRScannerOpen} onOpenChange={setIsQRScannerOpen}>
        <DialogContent className="sm:max-w-sm p-0 gap-0 overflow-hidden bg-black border-none text-white">
          <DialogHeader className="absolute top-0 left-0 right-0 z-10 p-4 bg-gradient-to-b from-black/80 to-transparent">
            <DialogTitle className="text-white">Quét mã QR</DialogTitle>
            <DialogDescription className="text-white/70">
              Di chuyển camera đến mã QR
            </DialogDescription>
          </DialogHeader>

          <div className="aspect-[3/4] relative bg-black">
            <QRScanner
              onScan={handleQRScanned}
              onError={(error) => {
                console.error("QR Error", error);
                toast.error("Lỗi camera");
                setIsQRScannerOpen(false);
              }}
            />
            {/* Scan Overlay UI */}
            <div className="absolute inset-0 border-2 border-white/20 m-12 rounded-lg pointer-events-none flex items-center justify-center">
              <div className="w-full h-0.5 bg-red-500/50 absolute animate-pulse top-1/2" />
            </div>
          </div>

          <DialogFooter className="p-4 bg-black">
            <Button
              variant="secondary"
              className="w-full"
              onClick={() => setIsQRScannerOpen(false)}
            >
              Đóng camera
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
