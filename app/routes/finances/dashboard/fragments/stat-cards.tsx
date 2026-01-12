import {
  AlertCircle,
  ArrowDownRight,
  ArrowUpRight,
  Calendar,
  DollarSign,
  Home,
  Package,
  TrendingUp,
} from "lucide-react";
import { Alert, AlertDescription } from "~/components/ui/alert";
import { Badge } from "~/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Progress } from "~/components/ui/progress";
import { formatMoney } from "~/lib/utils";
import type { FinancialDashboardSmeDto } from "~/services/api/finances/dto";

interface StatCardsProps {
  data: FinancialDashboardSmeDto;
}

export function StatCards({ data }: StatCardsProps) {
  const { vndFormatted: collectedVnd } = formatMoney(data.totalCollected);
  const { vndFormatted: spentVnd } = formatMoney(data.totalSpent);
  const { vndFormatted: netCashVnd } = formatMoney(data.netCash);
  const { vndFormatted: otaReceivableVnd } = formatMoney(data.otaReceivable);
  const { vndFormatted: adrVnd } = formatMoney(data.averageDailyRate);

  const isPositiveCash = data.netCash >= 0;
  const hasOtaDebt = data.otaReceivable > 0;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* CARD 1: Cash Flow */}
      <Card className="shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
            <DollarSign className="h-4 w-4" />
            Dòng tiền
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground">Thu vào</p>
            <p className="text-lg font-semibold text-emerald-600">
              {collectedVnd}
            </p>
          </div>
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground">Chi ra</p>
            <p className="text-lg font-semibold text-red-600">{spentVnd}</p>
          </div>
          <div className="pt-2 border-t space-y-1">
            <p className="text-xs text-muted-foreground">Ròng</p>
            <div className="flex items-center gap-2">
              {isPositiveCash ? (
                <ArrowUpRight className="h-4 w-4 text-emerald-600" />
              ) : (
                <ArrowDownRight className="h-4 w-4 text-red-600" />
              )}
              <p
                className={`text-xl font-bold ${
                  isPositiveCash ? "text-emerald-600" : "text-red-600"
                }`}
              >
                {netCashVnd}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* CARD 2: Debts */}
      <Card className="shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
            <AlertCircle className="h-4 w-4" />
            Công nợ
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="space-y-2">
            <p className="text-xs text-muted-foreground">OTA chưa thanh toán</p>
            <p
              className={`text-2xl font-bold ${
                hasOtaDebt ? "text-amber-600" : "text-muted-foreground"
              }`}
            >
              {otaReceivableVnd}
            </p>
          </div>
          {hasOtaDebt && (
            <Alert className="bg-amber-50 border-amber-200">
              <AlertDescription className="text-xs text-amber-800">
                Cần theo dõi thanh toán từ OTA
              </AlertDescription>
            </Alert>
          )}
          {!hasOtaDebt && (
            <p className="text-xs text-muted-foreground italic">
              Không có công nợ OTA
            </p>
          )}
        </CardContent>
      </Card>

      {/* CARD 3: Operations */}
      <Card className="shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
            <Home className="h-4 w-4" />
            Vận hành
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <p className="text-xs text-muted-foreground">Công suất</p>
              <p className="text-sm font-semibold text-foreground">
                {data.occupancyPercent.toFixed(1)}%
              </p>
            </div>
            <Progress value={data.occupancyPercent} className="h-2" />
          </div>
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground">Giá phòng TB</p>
            <p className="text-lg font-semibold text-foreground flex items-center gap-1">
              <TrendingUp className="h-4 w-4 text-blue-600" />
              {adrVnd}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* CARD 4: Action Items */}
      <Card className="shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
            <AlertCircle className="h-4 w-4" />
            Cần chú ý
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <p className="text-xs text-muted-foreground flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                Khách đến hôm nay
              </p>
              <Badge variant="secondary" className="font-semibold">
                {data.arrivalsToday}
              </Badge>
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <p className="text-xs text-muted-foreground flex items-center gap-1">
                <Package className="h-3 w-3" />
                Hàng sắp hết
              </p>
              <Badge
                variant={
                  data.lowStockItems.length > 0 ? "destructive" : "secondary"
                }
                className="font-semibold"
              >
                {data.lowStockItems.length}
              </Badge>
            </div>
            {data.lowStockItems.length > 0 && (
              <div className="max-h-20 overflow-y-auto space-y-1">
                {data.lowStockItems.slice(0, 5).map((item, idx) => (
                  <p
                    key={idx}
                    className="text-xs text-muted-foreground pl-4 truncate"
                  >
                    • {item}
                  </p>
                ))}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
