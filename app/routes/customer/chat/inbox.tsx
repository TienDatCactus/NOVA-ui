import {
  MessageSquare,
  QrCode,
  Loader2,
  Scan,
  Terminal,
  MessageCircle,
  LogOut,
  ChevronRight,
  HelpCircle,
  TreePine,
  Cog,
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
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { toast } from "sonner";
import { cn } from "~/lib/utils";
import STORAGE, { deleteStorage, getStorage, setStorage } from "~/lib/storage";
import { useChatEntry } from "~/routes/chat/container/query.hooks";
import { CUSTOMER } from "~/lib/fe-url";
import { QRScanner } from "~/components/qr-scanner";
import type { Route } from "./+types/inbox";
import { Badge } from "~/components/ui/badge";
import Image from "~/components/ui/image";
import sapaBg from "~/assets/img/pexels-son-hoa-nguyen-2155579462-33908286.jpg";
export default function ChatInbox({}: Route.ComponentProps) {
  const { t } = useTranslation("chat");
  const navigate = useNavigate();
  const [isQRScannerOpen, setIsQRScannerOpen] = useState(false);
  const [savedToken, setSavedToken] = useState<string | null>(null);

  // Load token
  useEffect(() => {
    const token = getStorage(STORAGE.GUEST_ROOM_TOKEN);
    if (token) setSavedToken(token);
  }, []);

  // Validate token
  const {
    data: entry,
    isLoading,
    isError,
  } = useChatEntry(savedToken || "", !!savedToken);

  // Clear invalid token
  useEffect(() => {
    if (isError) {
      deleteStorage(STORAGE.GUEST_ROOM_TOKEN);
      setSavedToken(null);
    }
  }, [isError]);

  // Handlers
  const handleCloseChat = () => {
    if (confirm(t("inbox.confirmClose"))) {
      deleteStorage(STORAGE.GUEST_ROOM_TOKEN);
      setSavedToken(null);
      toast.success(t("inbox.closedSuccess"));
    }
  };

  const handleOpenChat = () => {
    if (savedToken) navigate(CUSTOMER.chat(savedToken));
  };

  const handleQRScanned = (scannedText: string) => {
    try {
      let token = scannedText;
      try {
        const url = new URL(scannedText);
        token = url.searchParams.get("roomToken") || scannedText;
      } catch {
        /* Not a URL, use raw text */
      }

      if (!token) throw new Error("Invalid Token");

      setStorage(STORAGE.GUEST_ROOM_TOKEN, token);
      setSavedToken(token);
      setIsQRScannerOpen(false);
      toast.success(t("inbox.connectSuccess"));
      navigate(CUSTOMER.chat(token));
    } catch {
      toast.error(t("inbox.invalidQR"));
    }
  };

  const handleManualSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const token = formData.get("roomToken") as string;
    if (token.trim()) handleQRScanned(token.trim());
  };

  if (isLoading) {
    return (
      <div className="flex h-screen flex-col items-center justify-center bg-stone-50 space-y-4">
        <Loader2 className="h-10 w-10 animate-spin text-emerald-700" />
        <p className="text-sm text-stone-500 animate-pulse font-medium">
          {t("inbox.checkingConnection")}
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-stone-50 text-stone-800 font-sans flex flex-col">
      {/* --- HERO HEADER (Matches GuidesPage) --- */}
      <div className="relative h-[40vh] w-full overflow-hidden shrink-0">
        <Image
          src={sapaBg}
          alt="Misty Sapa"
          className="w-full h-full object-cover filter brightness-[0.8]"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-stone-900/90 via-stone-900/20 to-transparent" />

        <div className="absolute bottom-0 left-0 right-0 p-6 md:p-8 text-white">
          <div className="container max-w-md mx-auto space-y-2">
            <Badge className="bg-emerald-600/90 hover:bg-emerald-700 text-white border-none backdrop-blur-md px-2 py-0.5 text-xs font-light tracking-widest uppercase mb-1">
              Guest Services
            </Badge>
            <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
              <MessageSquare className="h-7 w-7 text-emerald-400" />
              {t("inbox.title")}
            </h1>
            <p className="text-stone-300 text-sm font-light opacity-90 max-w-xs">
              {t("inbox.connectDescription")}
            </p>
          </div>
        </div>
      </div>

      {/* --- MAIN CONTENT --- */}
      <main className="flex-1 container max-w-md mx-auto relative z-10 space-y-8 py-24">
        {/* STATE: NO SESSION */}
        {!savedToken && (
          <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-xl shadow-stone-200/50 p-6 space-y-8 animate-in fade-in zoom-in-95 duration-500 border border-white/50">
            {/* Visual Icon */}
            <div className="flex justify-center">
              <div className="relative">
                <div className="absolute inset-0 bg-emerald-100 blur-xl rounded-full opacity-70" />
                <div className="relative bg-white p-4 rounded-2xl shadow-sm border border-stone-100">
                  <QrCode className="h-12 w-12 text-emerald-800 stroke-[1.5]" />
                </div>
              </div>
            </div>

            <div className="text-center space-y-1">
              <h2 className="text-xl font-bold text-stone-800">
                {t("inbox.connectTitle")}
              </h2>
              <p className="text-stone-500 text-sm leading-relaxed px-4">
                {t("inbox.connectDescription")}
              </p>
            </div>

            <div className="flex flex-col w-full gap-3">
              <Button
                size="lg"
                onClick={() => setIsQRScannerOpen(true)}
                className="w-full h-12 text-base shadow-lg shadow-emerald-900/10 rounded-xl bg-emerald-800 hover:bg-emerald-900 text-white transition-all active:scale-95"
              >
                <Scan className="h-5 w-5 mr-2" /> {t("inbox.scanQR")}
              </Button>

              <Dialog>
                <DialogTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full h-12 text-base rounded-xl border-dashed border-2 border-stone-200 text-stone-600 hover:bg-stone-50 hover:border-stone-300 hover:text-stone-800 transition-all"
                  >
                    <Terminal className="h-4 w-4 mr-2 text-stone-400" />{" "}
                    {t("inbox.manualInput")}
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-md rounded-xl">
                  <DialogHeader>
                    <DialogTitle>{t("inbox.manualTitle")}</DialogTitle>
                    <DialogDescription>
                      {t("inbox.manualDescription")}
                    </DialogDescription>
                  </DialogHeader>
                  <form
                    onSubmit={handleManualSubmit}
                    className="space-y-4 pt-2"
                  >
                    <div className="space-y-2">
                      <Label htmlFor="roomToken" className="text-stone-600">
                        {t("inbox.tokenLabel")}
                      </Label>
                      <Input
                        id="roomToken"
                        name="roomToken"
                        placeholder="VD: ROOM-123-XYZ"
                        className="font-mono uppercase border-stone-200 focus:border-emerald-500 focus:ring-emerald-500"
                        required
                        autoFocus
                      />
                    </div>
                    <DialogFooter>
                      <Button
                        type="submit"
                        className="w-full sm:w-auto bg-emerald-800 hover:bg-emerald-900"
                      >
                        {t("inbox.connect")}
                      </Button>
                    </DialogFooter>
                  </form>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        )}

        {/* STATE: ACTIVE SESSION */}
        {savedToken && entry && (
          <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-500">
            {/* Active Chat Card */}
            <div
              className="group relative bg-white border-none rounded-2xl shadow-xl shadow-stone-200/50 hover:shadow-2xl hover:shadow-stone-200/70 transition-all overflow-hidden cursor-pointer"
              onClick={handleOpenChat}
            >
              <div className="absolute top-0 left-0 w-1.5 h-full bg-emerald-600" />
              <div className="p-6 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="h-14 w-14 rounded-full bg-emerald-50 flex items-center justify-center border border-emerald-100">
                    <TreePine className="h-7 w-7 text-emerald-700" />
                  </div>
                  <div>
                    <h3 className="font-bold text-xl text-stone-800 leading-tight flex items-center gap-2">
                      {entry.roomName || "Bungalow..."}
                      <span
                        className={cn(
                          "inline-block w-2.5 h-2.5 rounded-full ring-2 ring-white shadow-sm",
                          entry.canChat ? "bg-emerald-500" : "bg-stone-300"
                        )}
                      />
                    </h3>
                    <p className="text-sm text-stone-500 font-medium mt-1">
                      {entry.canChat ? t("inbox.active") : t("inbox.ended")}
                    </p>
                  </div>
                </div>
                <div className="h-10 w-10 rounded-full bg-stone-50 flex items-center justify-center group-hover:bg-emerald-50 transition-colors">
                  <ChevronRight className="h-5 w-5 text-stone-400 group-hover:text-emerald-600 transition-colors" />
                </div>
              </div>

              {/* Footer Actions inside Card */}
              <div
                className="bg-stone-50/80 px-6 py-3 border-t border-stone-100 flex justify-between items-center gap-2 backdrop-blur-sm"
                onClick={(e) => e.stopPropagation()}
              >
                <span className="text-[10px] text-stone-400 font-bold uppercase tracking-wider">
                  <Cog />
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 text-red-600 hover:text-red-700 hover:bg-red-50 -mr-2 text-xs font-medium"
                  onClick={handleCloseChat}
                >
                  <LogOut className="h-3.5 w-3.5 mr-1.5" />{" "}
                  {t("inbox.exitSession")}
                </Button>
              </div>
            </div>

            {/* Expired Message */}
            {!entry.canChat && (
              <div className="bg-amber-50 border border-amber-100 p-4 rounded-xl text-sm text-amber-800 text-center shadow-sm">
                {entry.message || t("inbox.sessionEndedMessage")}
              </div>
            )}
          </div>
        )}

        {/* --- HELP / FOOTER --- */}
        <div className="pt-4">
          <div className="bg-white/50 backdrop-blur-sm rounded-xl p-5 border border-stone-200/50">
            <div className="flex items-center gap-2 mb-4 pb-2 border-b border-stone-100">
              <HelpCircle className="h-4 w-4 text-emerald-700" />
              <h3 className="font-bold text-xs text-stone-500 uppercase tracking-wider">
                {t("inbox.helpTitle")}
              </h3>
            </div>
            <div className="space-y-4">
              <StepItem number="1" text={t("inbox.helpStep1")} />
              <StepItem number="2" text={t("inbox.helpStep2")} />
              <StepItem number="3" text={t("inbox.helpStep3")} />
            </div>
          </div>
        </div>
      </main>

      {/* QR SCANNER OVERLAY - Unchanged style as requested */}
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

// Helper Component (Styled for Nature Theme)
function StepItem({ number, text }: { number: string; text: string }) {
  return (
    <div className="flex gap-3 items-start group">
      <div className="flex-none w-6 h-6 rounded-full bg-stone-100 group-hover:bg-emerald-100 group-hover:text-emerald-800 transition-colors flex items-center justify-center text-xs font-bold text-stone-500">
        {number}
      </div>
      <p className="text-sm text-stone-600 leading-snug pt-0.5">{text}</p>
    </div>
  );
}
