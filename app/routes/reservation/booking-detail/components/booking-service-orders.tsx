import { CableCar } from "lucide-react";
import { Card, CardHeader, CardTitle } from "~/components/ui/card";

export default function BookingServiceOrders({}) {
  return (
    <Card className="shadow-md">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <CableCar className="h-5 w-5" />
            Đơn dịch vụ tại quầy
          </CardTitle>
        </div>
      </CardHeader>
    </Card>
  );
}
