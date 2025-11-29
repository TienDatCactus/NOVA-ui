import { useEffect, useRef, useState } from "react";
import { Html5Qrcode } from "html5-qrcode";
import { Button } from "~/components/ui/button";
import { Alert, AlertDescription } from "~/components/ui/alert";
import { Loader2, Camera, AlertCircle } from "lucide-react";

interface QRScannerProps {
  onScan: (decodedText: string) => void;
  onError?: (error: string) => void;
}

export function QRScanner({ onScan, onError }: QRScannerProps) {
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
        (errorMessage) => {}
      );
    } catch (err) {
      const errorMsg =
        err instanceof Error ? err.message : "Không thể truy cập camera";
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
          // Force cleanup even if stop fails
          scannerRef.current = null;
          setIsScanning(false);
        });
    }
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      // Only stop if scanner is actually running
      if (scannerRef.current && isScanning) {
        scannerRef.current.stop().catch(() => {
          // Ignore errors during cleanup
        });
      }
    };
  }, [isScanning]);

  return (
    <div className="space-y-4">
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div
        id={qrCodeRegionId}
        className="rounded-lg overflow-hidden border-2 border-dashed border-muted-foreground/25 h-full w-full object-cover "
      />

      {!isScanning ? (
        <Button onClick={startScanning} className="w-full" size="lg">
          <Camera className="h-5 w-5 mr-2" />
          Bắt đầu quét
        </Button>
      ) : (
        <Button
          onClick={stopScanning}
          variant="outline"
          className="w-full"
          size="lg"
        >
          <Loader2 className="h-5 w-5 mr-2 animate-spin" />
          Đang quét... (Nhấn để dừng)
        </Button>
      )}
    </div>
  );
}
