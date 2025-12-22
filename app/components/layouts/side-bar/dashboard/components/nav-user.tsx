import { ChevronsUpDown, KeyRound, LogOut, Trash2 } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router";
import { toast } from "sonner";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "~/components/ui/alert-dialog";
import { Avatar, AvatarFallback } from "~/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "~/components/ui/sidebar";
import { useAccountCleanup } from "~/hooks/use-account-cleanup";
import { useAuth } from "~/lib/auth/components";
import { RouteModule } from "~/lib/auth/roles";
import { DASHBOARD } from "~/lib/fe-url";
import { ChangePasswordDialog } from "~/routes/auth/change-pasword";
import { useAuthHooks } from "~/routes/auth/container/auth.hooks";
import {
  useAccountManager,
  type SavedAccount,
} from "~/store/account-manager.store";
import { useAuthStore } from "~/store/auth.store";
import { QuickPasswordDialog } from "./quick-password-dialog";

export function NavUser() {
  const { isMobile } = useSidebar();
  const navigate = useNavigate();
  const { logout } = useAuthHooks();
  const { can } = useAuth();
  const { user } = useAuthStore();
  const { getAccounts, removeAccount, updateLastUsed } = useAccountManager();
  const { cleanupAllStores } = useAccountCleanup();
  const { login } = useAuthHooks();

  const [showChangePassword, setShowChangePassword] = useState(false);
  const [showQuickPassword, setShowQuickPassword] = useState(false);
  const [selectedAccount, setSelectedAccount] = useState<SavedAccount | null>(
    null
  );
  const [isAccountSwitching, setIsAccountSwitching] = useState(false);
  const [accountToRemove, setAccountToRemove] = useState<SavedAccount | null>(
    null
  );

  const savedAccounts = getAccounts();
  const otherAccounts = savedAccounts.filter((acc) => acc.id !== user?.id);

  const handleAccountSwitch = (account: SavedAccount) => {
    setSelectedAccount(account);
    setShowQuickPassword(true);
  };

  const handleQuickPasswordSubmit = async (password: string) => {
    if (!selectedAccount) return;

    setIsAccountSwitching(true);
    try {
      // Attempt login with saved username and provided password
      const response = await login({
        userNameOrEmail: selectedAccount.userName,
        password: password,
      });

      if (response) {
        cleanupAllStores();

        updateLastUsed(selectedAccount.id);

        setShowQuickPassword(false);
        setSelectedAccount(null);

        // Navigate based on new user's role
        const newUser = response.user;
        if (newUser.roles?.includes("Admin")) {
          navigate(DASHBOARD.auditLogs);
        } else if (newUser.roles?.includes("HotelManager")) {
          navigate(DASHBOARD.finances.dashboard);
        } else if (newUser.roles?.includes("ServiceStaff")) {
          navigate(DASHBOARD.rooms.list);
        } else if (newUser.roles?.includes("Accountant")) {
          navigate(DASHBOARD.expenses);
        } else if (newUser.roles?.includes("Receptionist")) {
          navigate(DASHBOARD.bookings.list);
        } else {
          navigate(DASHBOARD.bookings.list);
        }
        toast.success(
          `Đã chuyển sang tài khoản ${selectedAccount.fullName || selectedAccount.userName}`
        );
      }
    } finally {
      setIsAccountSwitching(false);
    }
  };

  const handleRemoveAccount = (account: SavedAccount) => {
    setAccountToRemove(account);
  };

  const confirmRemoveAccount = () => {
    if (accountToRemove) {
      removeAccount(accountToRemove.id);
      toast.success(
        `Đã xóa ${accountToRemove.fullName || accountToRemove.userName} khỏi danh sách`
      );
      setAccountToRemove(null);
    }
  };
  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
            >
              <Avatar className="h-8 w-8 rounded-lg">
                <AvatarFallback className="rounded-lg">
                  {user?.fullName?.charAt(0)}
                </AvatarFallback>
              </Avatar>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-medium">{user?.fullName}</span>
                <span className="truncate text-xs">{user?.userName}</span>
              </div>
              <ChevronsUpDown className="ml-auto size-4" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg"
            side={isMobile ? "bottom" : "right"}
            align="end"
            sideOffset={4}
          >
            <DropdownMenuLabel className="p-0 font-normal">
              <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                <Avatar className="h-8 w-8 rounded-lg">
                  <AvatarFallback className="rounded-lg">
                    {user?.fullName?.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-medium">{user?.roles[0]}</span>
                  <span className="truncate text-xs">{user?.userName}</span>
                </div>
              </div>
            </DropdownMenuLabel>

            {/* Account Switcher Section */}
            {otherAccounts.length > 0 && (
              <>
                <DropdownMenuSeparator />
                <DropdownMenuLabel className="text-xs text-muted-foreground px-2 py-1.5">
                  Chuyển tài khoản
                </DropdownMenuLabel>
                <DropdownMenuGroup className="max-h-[200px] overflow-y-auto">
                  {otherAccounts.map((account) => (
                    <div
                      key={account.id}
                      className="group relative flex items-center gap-2 px-2 py-1.5 hover:bg-accent rounded-sm"
                    >
                      <button
                        onClick={() => handleAccountSwitch(account)}
                        className="flex items-center gap-2 flex-1 min-w-0 text-left"
                      >
                        <Avatar className="h-7 w-7 rounded-lg shrink-0">
                          <AvatarFallback className="rounded-lg text-xs">
                            {account.fullName?.charAt(0) ||
                              account.userName.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">
                            {account.fullName || account.userName}
                          </p>
                          <p className="text-xs text-muted-foreground truncate">
                            @{account.userName}
                          </p>
                        </div>
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRemoveAccount(account);
                        }}
                        className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-destructive/10 rounded-sm"
                      >
                        <Trash2 className="h-3.5 w-3.5 text-destructive" />
                      </button>
                    </div>
                  ))}
                </DropdownMenuGroup>
              </>
            )}

            {can.update(RouteModule.Auth) && (
              <>
                <DropdownMenuSeparator />
                <DropdownMenuGroup>
                  <DropdownMenuItem onClick={() => setShowChangePassword(true)}>
                    <KeyRound />
                    Đổi mật khẩu
                  </DropdownMenuItem>
                </DropdownMenuGroup>
              </>
            )}
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={logout}>
              <LogOut />
              Đăng xuất
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>

      <ChangePasswordDialog
        open={showChangePassword}
        onOpenChange={setShowChangePassword}
      />

      <QuickPasswordDialog
        open={showQuickPassword}
        onOpenChange={setShowQuickPassword}
        account={selectedAccount}
        onSubmit={handleQuickPasswordSubmit}
        isLoading={isAccountSwitching}
      />

      <AlertDialog
        open={!!accountToRemove}
        onOpenChange={(open) => !open && setAccountToRemove(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xóa tài khoản khỏi danh sách?</AlertDialogTitle>
            <AlertDialogDescription>
              Bạn có chắc chắn muốn xóa{" "}
              <span className="font-medium text-foreground">
                {accountToRemove?.fullName || accountToRemove?.userName}
              </span>{" "}
              khỏi danh sách tài khoản đã ghi nhớ? Hành động này không thể hoàn
              tác.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Hủy</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmRemoveAccount}
              className="bg-destructive hover:bg-destructive/90"
            >
              Xóa
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </SidebarMenu>
  );
}
