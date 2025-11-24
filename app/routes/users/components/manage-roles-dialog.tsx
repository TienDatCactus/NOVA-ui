import { useState, useEffect, useMemo } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "~/components/ui/dialog";
import { Button } from "~/components/ui/button";
import { Form, FormField } from "~/components/ui/form";
import { Badge } from "~/components/ui/badge";
import {
  Shield,
  Loader2,
  Save,
  Search,
  Trash2,
  Plus,
  AlertCircle,
} from "lucide-react";
import { Input } from "~/components/ui/input";
import { ScrollArea } from "~/components/ui/scroll-area";
import {
  useAssignRoles,
  useRemoveRoles,
  useRoles,
} from "../container/useUsers.hooks";
import {
  getRoleBadgeColors,
  getRoleDisplayName,
} from "~/services/types/users.types";
import type { UserItem } from "~/services/api/user/dto";
import { cn } from "~/lib/utils";

interface ManageRolesDialogProps {
  user: UserItem;
  open: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

const ManageRolesSchema = z.object({
  selectedRoles: z.array(z.string()),
});

type ManageRolesForm = z.infer<typeof ManageRolesSchema>;

export function ManageRolesDialog({
  user,
  open,
  onClose,
  onSuccess,
}: ManageRolesDialogProps) {
  const { data: allRoles = [] } = useRoles();
  const { mutateAsync: assignRoles, isPending: isAssigning } = useAssignRoles();
  const { mutateAsync: removeRoles, isPending: isRemoving } = useRemoveRoles();

  const [searchQuery, setSearchQuery] = useState("");

  const form = useForm<ManageRolesForm>({
    resolver: zodResolver(ManageRolesSchema),
    defaultValues: {
      selectedRoles: [],
    },
  });

  // Safe Reset: Only runs when dialog opens
  useEffect(() => {
    if (open) {
      form.reset({ selectedRoles: user.roles || [] });
      setSearchQuery("");
    }
  }, [open, form]);

  const isPending = isAssigning || isRemoving;

  // Filter logic
  const filteredRoles = useMemo(() => {
    let roles = allRoles;
    if (searchQuery) {
      roles = allRoles.filter((role) =>
        getRoleDisplayName(role)
          .toLowerCase()
          .includes(searchQuery.toLowerCase())
      );
    }
    // Optional: Sort so active roles appear at the top?
    // For now, keeping alphabetical is usually less confusing for "Search"
    return roles;
  }, [allRoles, searchQuery]);

  const handleSubmit = async (data: ManageRolesForm) => {
    const originalRoles = user.roles || [];
    const newRoles = data.selectedRoles;

    const rolesToAdd = newRoles.filter((r) => !originalRoles.includes(r));
    const rolesToRemove = originalRoles.filter((r) => !newRoles.includes(r));

    if (rolesToAdd.length === 0 && rolesToRemove.length === 0) {
      onClose();
      return;
    }

    try {
      await Promise.all([
        rolesToAdd.length > 0 &&
          assignRoles({ id: user.id, data: { roles: rolesToAdd } }),
        rolesToRemove.length > 0 &&
          removeRoles({ id: user.id, data: { roles: rolesToRemove } }),
      ]);
      onSuccess?.();
      onClose();
    } catch (error) {
      console.error("Failed to update roles", error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md p-0 gap-0 overflow-hidden flex flex-col max-h-[85vh]">
        <DialogHeader className="px-6 py-4 bg-muted/10 border-b shrink-0">
          <DialogTitle>Phân quyền tài khoản</DialogTitle>
          <DialogDescription>{user.fullName}</DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            className="flex flex-col flex-1 overflow-hidden"
          >
            <div className="p-4 border-b shrink-0 bg-background z-10">
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Tìm kiếm vai trò..."
                  className="pl-8"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>

            <ScrollArea className="flex-1 bg-gray-50/30">
              <div className="p-3 space-y-2">
                <FormField
                  control={form.control}
                  name="selectedRoles"
                  render={({ field }) => (
                    <>
                      {filteredRoles.length === 0 ? (
                        <div className="py-8 text-center text-sm text-muted-foreground">
                          Không tìm thấy kết quả.
                        </div>
                      ) : (
                        filteredRoles.map((role) => {
                          const isSelected = field.value?.includes(role);
                          const colors = getRoleBadgeColors(role);

                          return (
                            <div
                              key={role}
                              className={cn(
                                "flex items-center justify-between p-3 rounded-lg border transition-all duration-200",
                                isSelected
                                  ? "bg-white border-primary/20 shadow-sm"
                                  : "bg-white/50 border-transparent hover:border-gray-200 hover:bg-white"
                              )}
                            >
                              <div className="flex items-center gap-3">
                                {/* Role Icon/Initial could go here */}
                                <div className="flex flex-col">
                                  <span
                                    className={cn(
                                      "font-semibold text-sm",
                                      isSelected
                                        ? "text-primary"
                                        : "text-foreground"
                                    )}
                                  >
                                    {getRoleDisplayName(role)}
                                  </span>
                                  {isSelected && (
                                    <span className="text-[11px] text-muted-foreground flex items-center gap-1 mt-0.5">
                                      <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                                      Đang kích hoạt
                                    </span>
                                  )}
                                </div>
                              </div>

                              {/* ACTION BUTTONS */}
                              {isSelected ? (
                                <Button
                                  type="button"
                                  size="sm"
                                  variant="outline"
                                  className="h-8 px-2 text-destructive hover:text-destructive hover:bg-destructive/10 border-destructive/20 hover:border-destructive/30"
                                  onClick={() => {
                                    field.onChange(
                                      field.value.filter((r) => r !== role)
                                    );
                                  }}
                                >
                                  <Trash2 className="h-4 w-4 mr-1.5" />
                                  Gỡ bỏ
                                </Button>
                              ) : (
                                <Button
                                  type="button"
                                  size="sm"
                                  variant="ghost"
                                  className="h-8 px-2 text-primary hover:text-primary hover:bg-primary/10"
                                  onClick={() => {
                                    field.onChange([...field.value, role]);
                                  }}
                                >
                                  <Plus className="h-4 w-4 mr-1.5" />
                                  Thêm
                                </Button>
                              )}
                            </div>
                          );
                        })
                      )}
                    </>
                  )}
                />
              </div>
            </ScrollArea>

            {/* Changed Warning to Info to be less alarming */}
            {form.formState.isDirty && (
              <div className="px-6 py-2 bg-blue-50 border-t border-b border-blue-100 flex items-center gap-2 shrink-0 animate-in slide-in-from-bottom-2">
                <AlertCircle className="h-4 w-4 text-blue-600 shrink-0" />
                <p className="text-xs text-blue-700">
                  Bạn có thay đổi chưa lưu. Nhấn "Lưu thay đổi" để áp dụng.
                </p>
              </div>
            )}

            <DialogFooter className="px-6 py-4 bg-white shrink-0 border-t">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                disabled={isPending}
              >
                Hủy bỏ
              </Button>
              <Button
                type="submit"
                disabled={isPending || !form.formState.isDirty}
                className="min-w-[120px]"
              >
                {isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : (
                  <Save className="h-4 w-4 mr-2" />
                )}
                Lưu thay đổi
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
