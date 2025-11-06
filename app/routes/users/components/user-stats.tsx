import { Users, UserCheck, UserX, Shield } from "lucide-react";
import { Card } from "~/components/ui/card";
import type { UserItem } from "~/services/api/user/dto";

interface UserStatsProps {
  Users: UserItem[];
}

/**
 * user Statistics Component - NOVA-UI
 * Hiển thị thống kê tổng quan về khách hàng
 */
export function UserStats({ Users }: UserStatsProps) {
  const totalUsers = Users.length;
  const activeUsers = Users.filter(
    (c) => !c.lockoutEnabled || !c.lockoutEnd
  ).length;
  const lockedUsers = Users.filter(
    (c) => c.lockoutEnabled && c.lockoutEnd
  ).length;

  const stats = [
    {
      title: "Tổng khách hàng",
      value: totalUsers,
      icon: Users,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
    },
    {
      title: "Đang hoạt động",
      value: activeUsers,
      icon: UserCheck,
      color: "text-green-600",
      bgColor: "bg-green-50",
    },
    {
      title: "Bị khóa",
      value: lockedUsers,
      icon: UserX,
      color: "text-red-600",
      bgColor: "bg-red-50",
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
      {stats.map((stat) => {
        const Icon = stat.icon;
        return (
          <Card
            key={stat.title}
            className="p-4 shadow-md border-0 hover:shadow-lg transition-shadow"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">{stat.title}</p>
                <p className="text-2xl font-bold">{stat.value}</p>
              </div>
              <div className={`p-3 rounded-lg ${stat.bgColor}`}>
                <Icon className={`h-6 w-6 ${stat.color}`} />
              </div>
            </div>
          </Card>
        );
      })}
    </div>
  );
}
