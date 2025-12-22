import { format, parseISO } from "date-fns";
import {
  CheckCircle2,
  Lock,
  Mail,
  Phone,
  Shield,
  User,
  XCircle,
} from "lucide-react";
import { Badge } from "~/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog";
import { Separator } from "~/components/ui/separator";
import type { UserItem } from "~/services/api/user/dto";

interface UserDetailDialogProps {
  user: UserItem;
  open: boolean;
  onClose: () => void;
}

export function UserDetailDialog({
  user,
  open,
  onClose,
}: UserDetailDialogProps) {
  const isLocked =
    user.lockoutEnabled &&
    user.lockoutEnd &&
    new Date(user.lockoutEnd) > new Date();

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-xl p-0 gap-0 overflow-hidden border-none shadow-xl">
        {/* === 1. Identity Header (Grey Background) === */}
        <DialogHeader className="px-6 py-5 bg-muted/20 border-b">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-4">
              {/* Avatar Placeholder */}
              <div className="h-14 w-14 rounded-full bg-background border shadow-sm flex items-center justify-center shrink-0">
                <User className="h-6 w-6 text-muted-foreground/50" />
              </div>

              <div className="space-y-1">
                <DialogTitle className="text-xl font-semibold leading-none">
                  {user.fullName}
                </DialogTitle>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <span className="font-mono bg-muted px-1.5 rounded text-xs border">
                    {user.userName}
                  </span>
                  <span>•</span>
                  <span className="flex items-center gap-1.5">
                    {isLocked ? (
                      <span className="flex items-center gap-1.5 text-destructive font-medium text-xs">
                        <Lock className="h-3 w-3" /> Tài khoản bị khóa
                      </span>
                    ) : (
                      <span className="flex items-center gap-1.5 text-green-600 font-medium text-xs">
                        <CheckCircle2 className="h-3 w-3" /> Đang hoạt động
                      </span>
                    )}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </DialogHeader>

        {/* === 2. Content Body (Clean White) === */}
        <div className="p-6 space-y-6">
          {/* Contact Section */}
          <section>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-4">
              Thông tin liên hệ
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-4 gap-x-8">
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Mail className="h-3.5 w-3.5" /> Email
                </div>
                <div className="font-medium text-sm flex items-center gap-2">
                  {user.email}
                  {user.emailConfirmed && (
                    <span className="text-green-600" title="Đã xác thực email">
                      <CheckCircle2 className="h-3 w-3" />
                    </span>
                  )}
                </div>
              </div>

              <div className="space-y-1">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Phone className="h-3.5 w-3.5" /> Số điện thoại
                </div>
                <div className="font-medium text-sm">
                  {user.phoneNumber || "—"}
                </div>
              </div>
            </div>
          </section>

          <Separator className="bg-border/60" />

          {/* Roles & Permissions */}
          <section>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3 flex items-center gap-2">
              <Shield className="h-3.5 w-3.5" /> Phân quyền hệ thống
            </h4>
            <div className="flex flex-wrap gap-2">
              {user.roles.length > 0 ? (
                user.roles.map((role) => (
                  // Minimalist Badge: Outline only, no background color
                  <Badge
                    key={role}
                    variant="outline"
                    className="font-normal text-sm px-2.5 py-0.5 border-input text-foreground/80"
                  >
                    {role}
                  </Badge>
                ))
              ) : (
                <span className="text-sm text-muted-foreground italic">
                  Chưa được cấp quyền
                </span>
              )}
            </div>
          </section>

          {/* Conditional: Lockout Info (Only shows if relevant) */}
          {isLocked && user.lockoutEnd && (
            <div className="rounded-md border border-destructive/20 bg-destructive/5 p-3 flex items-start gap-3 mt-4">
              <XCircle className="h-5 w-5 text-destructive shrink-0 mt-0.5" />
              <div className="space-y-1">
                <h5 className="text-sm font-medium text-destructive">
                  Chi tiết khóa tài khoản
                </h5>
                <p className="text-xs text-muted-foreground">
                  Tài khoản sẽ tự động mở khóa vào lúc:{" "}
                  <span className="font-medium text-foreground">
                    {format(parseISO(user.lockoutEnd), " HH:mm dd/MM/yyyy")}
                  </span>
                </p>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
