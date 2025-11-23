import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog";
import { Badge } from "~/components/ui/badge";
import { Separator } from "~/components/ui/separator";
import { Mail, Phone, User, Shield, Calendar, Lock } from "lucide-react";
import type { UserItem } from "~/services/api/user/dto";
import { format, parseISO } from "date-fns";

interface UserDetailDialogProps {
  user: UserItem;
  open: boolean;
  onClose: () => void;
}

/**
 * Helper function - Get role badge color
 */
const getRoleBadgeVariant = (role: string) => {
  const roleColors: Record<
    string,
    { bg: string; text: string; border: string }
  > = {
    Receptionist: {
      bg: "bg-blue-50",
      text: "text-blue-700",
      border: "border-blue-200",
    },
    Staff: {
      bg: "bg-purple-50",
      text: "text-purple-700",
      border: "border-purple-200",
    },
    user: {
      bg: "bg-green-50",
      text: "text-green-700",
      border: "border-green-200",
    },
    HotelManager: {
      bg: "bg-orange-50",
      text: "text-orange-700",
      border: "border-orange-200",
    },
    Accountant: {
      bg: "bg-pink-50",
      text: "text-pink-700",
      border: "border-pink-200",
    },
  };
  return (
    roleColors[role] || {
      bg: "bg-gray-50",
      text: "text-gray-700",
      border: "border-gray-200",
    }
  );
};

/**
 * user Detail Dialog - NOVA-UI
 * Hiển thị chi tiết khách hàng với layout thoáng đãng
 */
export function UserDetailDialog({
  user,
  open,
  onClose,
}: UserDetailDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-2xl flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10">
              <User className="h-5 w-5 text-primary" />
            </div>
            Chi tiết Khách hàng
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Thông tin cơ bản */}
          <div className="space-y-4">
            <h3 className="font-semibold text-lg">Thông tin cơ bản</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">Tên đăng nhập</p>
                <p className="font-medium">{user.userName}</p>
              </div>
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">Họ và tên</p>
                <p className="font-medium">{user.fullName}</p>
              </div>
            </div>
          </div>

          <Separator />

          {/* Thông tin liên hệ */}
          <div className="space-y-4">
            <h3 className="font-semibold text-lg flex items-center gap-2">
              <Mail className="h-4 w-4 text-muted-foreground" />
              Thông tin liên hệ
            </h3>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-32 text-sm text-muted-foreground">Email:</div>
                <div className="flex items-center gap-2">
                  <span className="font-medium">{user.email}</span>
                  {user.emailConfirmed}
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-32 text-sm text-muted-foreground flex items-center gap-2">
                  <Phone className="h-4 w-4" />
                  Số điện thoại:
                </div>
                <span className="font-medium">{user.phoneNumber}</span>
              </div>
            </div>
          </div>

          <Separator />

          {/* Vai trò và quyền */}
          <div className="space-y-4">
            <h3 className="font-semibold text-lg flex items-center gap-2">
              <Shield className="h-4 w-4 text-muted-foreground" />
              Vai trò
            </h3>
            <div className="flex gap-2 flex-wrap">
              {user.roles.map((role) => {
                const colors = getRoleBadgeVariant(role);
                return (
                  <Badge
                    key={role}
                    variant="outline"
                    className={`text-sm py-1 px-3 ${colors.bg} ${colors.text} ${colors.border} shadow-sm`}
                  >
                    {role}
                  </Badge>
                );
              })}
            </div>
          </div>

          <Separator />

          {/* Trạng thái tài khoản */}
          <div className="space-y-4">
            <h3 className="font-semibold text-lg flex items-center gap-2">
              <Lock className="h-4 w-4 text-muted-foreground" />
              Trạng thái tài khoản
            </h3>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-32 text-sm text-muted-foreground">
                  Trạng thái:
                </div>
                {user.lockoutEnabled && user.lockoutEnd ? (
                  <Badge variant="destructive">Bị khóa</Badge>
                ) : (
                  <Badge
                    variant="outline"
                    className="bg-emerald-50 text-emerald-700 border-emerald-200"
                  >
                    Hoạt động
                  </Badge>
                )}
              </div>
              {user.lockoutEnd && (
                <div className="flex items-center gap-3">
                  <div className="w-32 text-sm text-muted-foreground flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    Khóa đến:
                  </div>
                  <span className="font-medium">
                    {format(parseISO(user.lockoutEnd), "dd/MM/yyyy HH:mm")}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
