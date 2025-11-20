import { Package, TrendingDown, DollarSign, CheckCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Skeleton } from "~/components/ui/skeleton";
import { formatMoney } from "~/lib/utils";

interface ItemsStatsCardsProps {
  stats: {
    totalItems: number;
    activeItems: number;
    lowStockItems: number;
    totalInventoryValue: number;
  };
  isLoading?: boolean;
}

export default function ItemsStatsCards({
  stats,
  isLoading,
}: ItemsStatsCardsProps) {
  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-4 w-4" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-8 w-16" />
              <Skeleton className="mt-2 h-3 w-32" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  const cards = [
    {
      title: "Tổng hàng hóa",
      value: stats.totalItems,
      description: `${stats.activeItems} đang hoạt động`,
      icon: Package,
      colorClass: "text-primary",
    },
    {
      title: "Tồn kho thấp",
      value: stats.lowStockItems,
      description: "Cần nhập hàng",
      icon: TrendingDown,
      colorClass: "text-destructive",
    },
    {
      title: "Giá trị kho",
      value: formatMoney(stats.totalInventoryValue).vndFormatted,
      description: "Tổng giá trị tồn kho",
      icon: DollarSign,
      colorClass: "text-green-600",
    },
    {
      title: "Đang hoạt động",
      value: stats.activeItems,
      description: `${stats.totalItems - stats.activeItems} ngừng hoạt động`,
      icon: CheckCircle,
      colorClass: "text-blue-600",
    },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {cards.map((card) => (
        <Card key={card.title}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{card.title}</CardTitle>
            <card.icon className={`h-4 w-4 ${card.colorClass}`} />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{card.value}</div>
            <p className="text-xs text-muted-foreground">{card.description}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
