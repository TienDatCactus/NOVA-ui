import { useState } from "react";
import {
  MoreHorizontal,
  Pencil,
  Lock,
  Unlock,
  Shield,
  KeyRound,
} from "lucide-react";
import { Button } from "~/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import type { UserItem } from "~/services/api/user/dto";
import { UserEditDialog } from "../components/user-edit-dialog";
import { LockUserDialog } from "../components/lock-user-dialog";
import { ManageRolesDialog } from "../components/manage-roles-dialog";
import ChangePasswordDialog from "../components/change-password-dialog";

interface ActionsMenuCellProps {
  user: UserItem;
  onViewDetail?: (user: UserItem) => void;
  onSuccess?: () => void;
}

function ActionsMenuCell({
  user,
  onViewDetail,
  onSuccess,
}: ActionsMenuCellProps) {
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isLockDialogOpen, setIsLockDialogOpen] = useState(false);
  const [lockDialogMode, setLockDialogMode] = useState<"lock" | "unlock">(
    "lock"
  );
  const [isManageRolesOpen, setIsManageRolesOpen] = useState(false);
  const [isChangePasswordOpen, setIsChangePasswordOpen] = useState(false);

  const handleLockUser = (e: React.MouseEvent) => {
    e.stopPropagation();
    setLockDialogMode("lock");
    setIsLockDialogOpen(true);
  };

  const handleUnlockUser = (e: React.MouseEvent) => {
    e.stopPropagation();
    setLockDialogMode("unlock");
    setIsLockDialogOpen(true);
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0"
            onClick={(e) => e.stopPropagation()}
          >
            <span className="sr-only">Mở menu</span>
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48">
          <DropdownMenuLabel>Hành động</DropdownMenuLabel>
          <DropdownMenuSeparator />

          <DropdownMenuItem
            onClick={(e) => {
              e.stopPropagation();
              setIsEditOpen(true);
            }}
          >
            <Pencil className="h-4 w-4 mr-2" />
            Chỉnh sửa thông tin
          </DropdownMenuItem>

          <DropdownMenuItem
            onClick={(e) => {
              e.stopPropagation();
              setIsManageRolesOpen(true);
            }}
          >
            <Shield className="h-4 w-4 mr-2" />
            Quản lý vai trò
          </DropdownMenuItem>

          <DropdownMenuItem
            onClick={(e) => {
              e.stopPropagation();
              setIsChangePasswordOpen(true);
            }}
          >
            <KeyRound className="h-4 w-4 mr-2" />
            Đổi mật khẩu
          </DropdownMenuItem>

          <DropdownMenuSeparator />

          {user.lockoutEnd && new Date(user.lockoutEnd) > new Date() ? (
            <DropdownMenuItem
              onClick={handleUnlockUser}
              className="text-green-600 focus:text-green-600"
            >
              <Unlock className="h-4 w-4 mr-2" />
              Mở khóa tài khoản
            </DropdownMenuItem>
          ) : (
            <DropdownMenuItem
              onClick={handleLockUser}
              className="text-destructive focus:text-destructive"
            >
              <Lock className="h-4 w-4 mr-2" />
              Khóa tài khoản
            </DropdownMenuItem>
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Edit Dialog */}
      <UserEditDialog
        user={user}
        open={isEditOpen}
        onClose={() => setIsEditOpen(false)}
        onSuccess={() => {
          setIsEditOpen(false);
          onSuccess?.();
        }}
      />

      {/* Lock/Unlock Dialog */}
      <LockUserDialog
        user={user}
        open={isLockDialogOpen}
        onClose={() => setIsLockDialogOpen(false)}
        mode={lockDialogMode}
        onSuccess={() => {
          setIsLockDialogOpen(false);
          onSuccess?.();
        }}
      />

      {/* Manage Roles Dialog */}
      <ManageRolesDialog
        user={user}
        open={isManageRolesOpen}
        onClose={() => setIsManageRolesOpen(false)}
        onSuccess={() => {
          setIsManageRolesOpen(false);
          onSuccess?.();
        }}
      />

      {/* Change Password Dialog */}
      <ChangePasswordDialog
        open={isChangePasswordOpen}
        onOpenChange={setIsChangePasswordOpen}
        UserId={user.id}
        UserName={user.fullName}
        onSuccess={() => {
          setIsChangePasswordOpen(false);
          onSuccess?.();
        }}
      />
    </>
  );
}

export default ActionsMenuCell;
