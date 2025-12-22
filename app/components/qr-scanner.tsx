import { Html5Qrcode } from "html5-qrcode";
import { AlertCircle, Camera, Loader2, ScanLine } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { Alert, AlertDescription } from "~/components/ui/alert";
import { Button } from "~/components/ui/button";
import { cn } from "~/lib/utils";

interface QRScannerProps {
  onScan: (decodedText: string) => void;
  onError?: (error: string) => void;
  className?: string;
}

export function QRScanner({ onScan, onError, className }: QRScannerProps) {
  const { t } = useTranslation("chat");
  const [isScanning, setIsScanning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const qrCodeRegionId = "qr-reader";

  const startScanning = async () => {
    setError(null);
    setIsScanning(true);

    try {
      const html5QrCode = new Html5Qrcode(qrCodeRegionId);
      scannerRef.current = html5QrCode;

      await html5QrCode.start(
        { facingMode: "environment" }, // Use back camera on mobile
        {
          fps: 10,
          qrbox: { width: 250, height: 250 },
        },
        (decodedText) => {
          html5QrCode.stop().then(() => {
            setIsScanning(false);
            onScan(decodedText);
          });
        },
        (errorMessage) => {
          console.log(errorMessage);
        }
      );
    } catch (err) {
      const errorMsg =
        err instanceof Error ? err.message : t("qrScanner.cameraError");
      setError(errorMsg);
      setIsScanning(false);
      onError?.(errorMsg);
    }
  };

  const stopScanning = () => {
    if (scannerRef.current && isScanning) {
      scannerRef.current
        .stop()
        .then(() => {
          scannerRef.current = null;
          setIsScanning(false);
        })
        .catch((err) => {
          console.error("Error stopping scanner:", err);
          scannerRef.current = null;
          setIsScanning(false);
        });
    }
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (scannerRef.current && isScanning) {
        scannerRef.current.stop().catch(() => {
          // Ignore errors during cleanup
        });
      }
    };
  }, [isScanning]);

  return (
    <div className={cn("space-y-4", className)}>
      {error && (
        <Alert
          variant="destructive"
          className="rounded-xl border-red-200 bg-red-50 text-red-900"
        >
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="relative overflow-hidden rounded-2xl border-2 border-dashed border-stone-300 bg-stone-100">
        <div id={qrCodeRegionId} className="h-full w-full overflow-hidden" />
        {/* Placeholder Icon when not scanning */}
        {!isScanning && !error && (
          <div className="absolute inset-0 flex items-center justify-center text-stone-300">
            <ScanLine className="h-16 w-16 opacity-50" />
          </div>
        )}
      </div>

      {!isScanning ? (
        <Button
          onClick={startScanning}
          className="w-full h-12 rounded-xl text-base bg-emerald-800 hover:bg-emerald-900 text-white shadow-lg shadow-emerald-900/10 transition-all active:scale-95"
        >
          <Camera className="h-5 w-5 mr-2" />
          {t("qrScanner.startScan")}
        </Button>
      ) : (
        <Button
          onClick={stopScanning}
          variant="outline"
          className="w-full h-12 rounded-xl text-base border-stone-200 text-stone-600 hover:bg-red-50 hover:text-red-600 hover:border-red-200 transition-colors"
        >
          <Loader2 className="h-5 w-5 mr-2 animate-spin" />
          {t("qrScanner.scanning")}
        </Button>
      )}
    </div>
  );
}
