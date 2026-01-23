import { XCircle } from "lucide-react";
import { useNavigate } from "react-router";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { DASHBOARD } from "~/lib/fe-url";
import { parsePaymentCallbackParams } from "~/lib/payment-url-builder";

export default function PaymentCancelPage() {
  const navigate = useNavigate();
  const context = parsePaymentCallbackParams();

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
          <CardTitle className="text-center flex items-center justify-center gap-2 text-amber-600">
            <XCircle className="w-6 h-6" />
            <span>Thanh toán bị hủy</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-amber-50 dark:bg-amber-950/20 p-4 rounded-lg border border-amber-200 dark:border-amber-800">
            <p className="text-sm text-amber-800 dark:text-amber-200 text-center">
              Bạn đã hủy giao dịch thanh toán. <br />
              Vui lòng thử lại nếu đây là nhầm lẫn.
            </p>
          </div>

          {context && (
            <div className="text-xs text-muted-foreground text-center">
              <p>Loại: {context.type}</p>
              <p>Mã: {context.id}</p>
            </div>
          )}

          <div className="space-y-2">
            <Button onClick={handleNavigate} className="w-full">
              Quay lại trang chi tiết
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
