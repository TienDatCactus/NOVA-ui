import { CheckCircle2, Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { DASHBOARD } from "~/lib/fe-url";
import { parsePaymentCallbackParams } from "~/lib/payment-url-builder";

export default function PaymentSuccessPage() {
  const [status, setStatus] = useState<"loading" | "success" | "error">(
    "loading",
  );
  const navigate = useNavigate();
  const context = parsePaymentCallbackParams();

  useEffect(() => {
    // Simulate payment verification
    // In production, you would call API to verify payment status
    const timer = setTimeout(() => {
      setStatus("success");
    }, 1500);

    return () => clearTimeout(timer);
  }, []);

  const handleNavigate = () => {
    if (!context) {
      navigate(-1);
      return;
    }

    switch (context.type) {
      case "booking":
        if (context.bookingCode) {
          navigate(DASHBOARD.bookings.bookingDetail(context.bookingCode));
        } else {
          navigate(DASHBOARD.bookings.list);
        }
        break;
      case "pos-order":
        navigate(DASHBOARD.orders.menuOrders);
        break;
      case "service-order":
        navigate(DASHBOARD.orders.serviceOrders);
        break;
      case "invoice":
        navigate(DASHBOARD.invoices);
        break;
      default:
        navigate(DASHBOARD.fall);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/30 p-4">
      <Card className="max-w-md w-full shadow-l">
        <CardHeader>
          <CardTitle className="text-center flex items-center justify-center gap-2">
            {status === "loading" ? (
              <>
                <Loader2 className="w-6 h-6 animate-spin text-primary" />
                <span>Đang xác minh thanh toán...</span>
              </>
            ) : (
              <>
                <CheckCircle2 className="w-6 h-6 text-green-600" />
                <span className="text-green-600">Thanh toán thành công!</span>
              </>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {status === "loading" ? (
            <p className="text-sm text-muted-foreground text-center">
              Vui lòng chờ trong giây lát...
            </p>
          ) : (
            <>
              <div className="bg-green-50 dark:bg-green-950/20 p-4 rounded-lg border border-green-200 dark:border-green-800">
                <p className="text-sm text-green-800 dark:text-green-200 text-center">
                  Giao dịch đã được xử lý thành công. <br />
                  Cảm ơn bạn đã thanh toán!
                </p>
              </div>

              {context && (
                <div className="text-xs text-muted-foreground text-center">
                  <p>Loại: {context.type}</p>
                  <p>Mã: {context.id}</p>
                </div>
              )}

              <Button onClick={handleNavigate} className="w-full">
                Quay lại trang chi tiết
              </Button>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
