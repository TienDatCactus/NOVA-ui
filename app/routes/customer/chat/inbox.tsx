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
import { useTranslation } from "react-i18next";
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
  const { t } = useTranslation("chat");
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
    if (confirm(t("inbox.confirmClose"))) {
      deleteStorage(STORAGE.GUEST_ROOM_TOKEN);
      setSavedToken(null);
      toast.success(t("inbox.closedSuccess"));
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
        toast.error(t("inbox.invalidQR"));
        return;
      }

      setStorage(STORAGE.GUEST_ROOM_TOKEN, token);
      setSavedToken(token);
      setIsQRScannerOpen(false);
      toast.success(t("inbox.connectSuccess"));
      // Auto navigate or let user click? Let's navigate for smoother exp
      navigate(CUSTOMER.chat(token));
    } catch (error) {
      console.error("QR scan error:", error);
      toast.error(t("inbox.qrProcessError"));
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
            {t("inbox.checkingConnection")}
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
            {t("inbox.title")}
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
              <h2 className="text-xl font-bold">{t("inbox.connectTitle")}</h2>
              <p className="text-muted-foreground text-sm max-w-xs mx-auto">
                {t("inbox.connectDescription")}
              </p>
            </div>

            <div className="flex flex-col w-full gap-3 max-w-xs">
              <Button
                size="lg"
                onClick={handleQRScan}
                className="w-full shadow-lg shadow-primary/20"
              >
                <Scan className="h-5 w-5 mr-2" /> {t("inbox.scanQR")}
              </Button>

              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="outline" className="w-full">
                    <Terminal className="h-4 w-4 mr-2" />{" "}
                    {t("inbox.manualInput")}
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-md">
                  <DialogHeader>
                    <DialogTitle>{t("inbox.manualTitle")}</DialogTitle>
                    <DialogDescription>
                      {t("inbox.manualDescription")}
                    </DialogDescription>
                  </DialogHeader>
                  <form
                    onSubmit={handleManualSubmit}
                    className="space-y-4 pt-4"
                  >
                    <div className="space-y-2">
                      <Label htmlFor="roomToken">{t("inbox.tokenLabel")}</Label>
                      <Input
                        id="roomToken"
                        name="roomToken"
                        placeholder={t("inbox.tokenPlaceholder")}
                        required
                      />
                    </div>
                    <DialogFooter>
                      <Button type="submit">{t("inbox.connect")}</Button>
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
                      {t("inbox.room")} {entry.roomName || "..."}
                    </h3>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <span
                        className={cn(
                          "w-2 h-2 rounded-full",
                          entry.canChat ? "bg-green-500" : "bg-gray-300"
                        )}
                      />
                      <span className="text-xs text-muted-foreground">
                        {entry.canChat ? t("inbox.active") : t("inbox.ended")}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-4 space-y-4">
                {!entry.canChat && (
                  <div className="bg-muted/50 p-3 rounded-md text-xs text-center text-muted-foreground">
                    {entry.message || t("inbox.sessionEnded")}
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
                    {t("inbox.openChat")}
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full text-destructive hover:text-destructive hover:bg-destructive/10"
                    onClick={handleCloseChat}
                  >
                    <LogOut className="h-4 w-4 mr-2" />
                    {t("inbox.exitSession")}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* --- HELP SECTION --- */}
        <div className="border-t pt-6 mt-8">
          <h3 className="font-semibold text-sm mb-4 text-muted-foreground uppercase tracking-wider">
            {t("inbox.helpTitle")}
          </h3>
          <div className="grid gap-4 text-sm">
            <div className="flex gap-3">
              <div className="flex-none w-6 h-6 rounded-full bg-muted flex items-center justify-center text-xs font-bold">
                1
              </div>
              <p className="text-muted-foreground">{t("inbox.helpStep1")}</p>
            </div>
            <div className="flex gap-3">
              <div className="flex-none w-6 h-6 rounded-full bg-muted flex items-center justify-center text-xs font-bold">
                2
              </div>
              <p className="text-muted-foreground">{t("inbox.helpStep2")}</p>
            </div>
            <div className="flex gap-3">
              <div className="flex-none w-6 h-6 rounded-full bg-muted flex items-center justify-center text-xs font-bold">
                3
              </div>
              <p className="text-muted-foreground">{t("inbox.helpStep3")}</p>
            </div>
          </div>
        </div>
      </main>

      {/* QR Scanner Dialog Overlay */}
      <Dialog open={isQRScannerOpen} onOpenChange={setIsQRScannerOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{t("inbox.scanTitle")}</DialogTitle>
            <DialogDescription>{t("inbox.scanDescription")}</DialogDescription>
          </DialogHeader>
          <div>
            <QRScanner
              onScan={handleQRScanned}
              onError={(error) => {
                console.error("QR Scanner error:", error);
                toast.error(t("inbox.scanError"));
              }}
            />
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
