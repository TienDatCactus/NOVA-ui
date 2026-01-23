import { AlertCircle } from "lucide-react";
import { useNavigate } from "react-router";
import { Alert, AlertDescription } from "~/components/ui/alert";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { DASHBOARD } from "~/lib/fe-url";
import { parsePaymentCallbackParams } from "~/lib/payment-url-builder";

export default function PaymentFailurePage() {
  const navigate = useNavigate();
  const context = parsePaymentCallbackParams();

  // Get error reason from URL if available
  const searchParams = new URLSearchParams(window.location.search);
  const reason = searchParams.get("reason") || "Giao dịch thất bại";

  const handleNavigate = () => {
    if (!context) {
      navigate(DASHBOARD.fall);
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
          <CardTitle className="text-center flex items-center justify-center gap-2 text-destructive">
            <AlertCircle className="w-6 h-6" />
            <span>Thanh toán thất bại</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert variant="destructive">
            <AlertCircle className="w-4 h-4" />
            <AlertDescription>{reason}</AlertDescription>
          </Alert>

          <div className="bg-muted/30 p-4 rounded-lg">
            <p className="text-sm text-muted-foreground text-center mb-2">
              Giao dịch không thể hoàn tất. Vui lòng:
            </p>
            <ul className="text-xs text-muted-foreground space-y-1 list-disc list-inside">
              <li>Kiểm tra số dư tài khoản</li>
              <li>Thử lại với phương thức thanh toán khác</li>
              <li>Liên hệ ngân hàng nếu vấn đề tiếp diễn</li>
            </ul>
          </div>

          {context && (
            <div className="text-xs text-muted-foreground text-center">
              <p>Loại: {context.type}</p>
              <p>Mã: {context.id}</p>
            </div>
          )}

          <div className="space-y-2">
            <Button onClick={handleNavigate} className="w-full">
              Quay lại
            </Button>
            <Button
              variant="outline"
              onClick={() => navigate(DASHBOARD.fall)}
              className="w-full"
            >
              Về trang chủ
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
