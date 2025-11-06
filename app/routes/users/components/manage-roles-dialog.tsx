import { useState, useMemo } from "react";
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
import { Checkbox } from "~/components/ui/checkbox";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormDescription,
} from "~/components/ui/form";
import { Badge } from "~/components/ui/badge";
import { Shield, Loader2, Plus, Trash2 } from "lucide-react";
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
import { Separator } from "~/components/ui/separator";

interface ManageRolesDialogProps {
  user: UserItem;
  open: boolean;
  onClose: () => void;
}

const ManageRolesSchema = z.object({
  rolesToAdd: z.array(z.string()),
  rolesToRemove: z.array(z.string()),
});

type ManageRolesForm = z.infer<typeof ManageRolesSchema>;

export function ManageRolesDialog({
  user,
  open,
  onClose,
}: ManageRolesDialogProps) {
  const { data: allRoles } = useRoles();
  const { mutate: assignRoles, isPending: isAssigning } = useAssignRoles();
  const { mutate: removeRoles, isPending: isRemoving } = useRemoveRoles();
  const [mode, setMode] = useState<"add" | "remove">("add");

  const form = useForm<ManageRolesForm>({
    mode: "onChange",
    defaultValues: {
      rolesToAdd: [],
      rolesToRemove: [],
    },
  });

  const isPending = isAssigning || isRemoving;

  const availableRoles = useMemo(() => {
    if (!allRoles) return [];
    return allRoles.filter((role) => !user.roles.includes(role));
  }, [allRoles, user.roles]);

  const handleAssignRoles = (data: ManageRolesForm) => {
    if (data.rolesToAdd.length === 0) return;

    assignRoles(
      {
        id: user.id,
        data: { roles: data.rolesToAdd },
      },
      {
        onSuccess: () => {
          form.reset();
          onClose();
        },
      }
    );
  };

  const handleRemoveRoles = (data: ManageRolesForm) => {
    if (data.rolesToRemove.length === 0) return;

    removeRoles(
      {
        id: user.id,
        data: { roles: data.rolesToRemove },
      },
      {
        onSuccess: () => {
          form.reset();
          onClose();
        },
      }
    );
  };

  const handleSubmit = (data: ManageRolesForm) => {
    if (mode === "add") {
      if (data.rolesToAdd.length === 0) {
        return;
      }
      handleAssignRoles(data);
    } else {
      if (data.rolesToRemove.length === 0) {
        return;
      }
      handleRemoveRoles(data);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-2xl flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10">
              <Shield className="h-5 w-5 text-primary" />
            </div>
            Quản lý Vai trò
          </DialogTitle>
          <DialogDescription>
            Thêm hoặc xóa vai trò cho{" "}
            <span className="font-semibold text-foreground">
              {user.fullName}
            </span>
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Current Roles Section */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-base">Vai trò hiện tại</h3>
              <Badge variant="outline" className="text-xs">
                {user.roles.length} vai trò
              </Badge>
            </div>
            <div className="flex gap-2 flex-wrap p-4 bg-muted/30 rounded-lg min-h-[60px]">
              {user.roles.length > 0 ? (
                user.roles.map((role) => {
                  const colors = getRoleBadgeColors(role);
                  return (
                    <Badge
                      key={role}
                      variant="outline"
                      className={`text-sm py-1.5 px-3 ${colors.bg} ${colors.text} ${colors.border} shadow-sm`}
                    >
                      {getRoleDisplayName(role)}
                    </Badge>
                  );
                })
              ) : (
                <p className="text-sm text-muted-foreground">
                  Chưa có vai trò nào
                </p>
              )}
            </div>
          </div>

          <Separator />

          {/* Mode Toggle */}
          <div className="flex gap-2">
            <Button
              type="button"
              variant={mode === "add" ? "default" : "outline"}
              onClick={() => setMode("add")}
              className="flex-1 gap-2"
              disabled={availableRoles.length === 0}
            >
              <Plus className="h-4 w-4" />
              Thêm vai trò
            </Button>
            <Button
              type="button"
              variant={mode === "remove" ? "destructive" : "outline"}
              onClick={() => setMode("remove")}
              className="flex-1 gap-2"
              disabled={user.roles.length === 0}
            >
              <Trash2 className="h-4 w-4" />
              Xóa vai trò
            </Button>
          </div>

          {/* Form Section */}
          <Form {...form}>
            <form
              onSubmit={(e) => {
                form.handleSubmit(handleSubmit, (errors) => {})(e);
              }}
              className="space-y-4"
            >
              {mode === "add" ? (
                <div className="space-y-3">
                  <h3 className="font-semibold text-base">
                    Chọn vai trò để thêm
                  </h3>
                  {availableRoles.length === 0 ? (
                    <div className="p-8 text-center border-2 border-dashed rounded-lg">
                      <Shield className="h-12 w-12 mx-auto opacity-20 mb-2" />
                      <p className="text-sm text-muted-foreground">
                        Người dùng đã có tất cả vai trò
                      </p>
                    </div>
                  ) : (
                    <FormField
                      control={form.control}
                      name="rolesToAdd"
                      render={() => (
                        <FormItem>
                          <div className="grid grid-cols-2 gap-3">
                            {availableRoles.map((role) => {
                              const colors = getRoleBadgeColors(role);
                              return (
                                <FormField
                                  key={role}
                                  control={form.control}
                                  name="rolesToAdd"
                                  render={({ field }) => (
                                    <FormItem
                                      key={role}
                                      className={`flex items-center space-x-3 space-y-0 p-4 rounded-lg border-2 transition-all cursor-pointer hover:bg-muted/50 ${
                                        field.value?.includes(role)
                                          ? `${colors.bg} ${colors.border} border-2`
                                          : "border-muted"
                                      }`}
                                    >
                                      <FormControl>
                                        <Checkbox
                                          checked={field.value?.includes(role)}
                                          onCheckedChange={(checked) => {
                                            return checked
                                              ? field.onChange([
                                                  ...field.value,
                                                  role,
                                                ])
                                              : field.onChange(
                                                  field.value?.filter(
                                                    (value) => value !== role
                                                  )
                                                );
                                          }}
                                        />
                                      </FormControl>
                                      <FormLabel
                                        className={`font-medium cursor-pointer flex-1 ${
                                          field.value?.includes(role)
                                            ? colors.text
                                            : ""
                                        }`}
                                      >
                                        {getRoleDisplayName(role)}
                                      </FormLabel>
                                    </FormItem>
                                  )}
                                />
                              );
                            })}
                          </div>
                          <FormDescription className="text-xs">
                            Chọn các vai trò bạn muốn thêm cho người dùng này
                          </FormDescription>
                        </FormItem>
                      )}
                    />
                  )}
                </div>
              ) : (
                <div className="space-y-3">
                  <h3 className="font-semibold text-base">
                    Chọn vai trò để xóa
                  </h3>
                  {user.roles.length === 0 ? (
                    <div className="p-8 text-center border-2 border-dashed rounded-lg border-destructive/20">
                      <Shield className="h-12 w-12 mx-auto opacity-20 mb-2 text-destructive" />
                      <p className="text-sm text-muted-foreground">
                        Người dùng chưa có vai trò nào
                      </p>
                    </div>
                  ) : (
                    <FormField
                      control={form.control}
                      name="rolesToRemove"
                      render={() => (
                        <FormItem>
                          <div className="grid grid-cols-2 gap-3">
                            {user.roles.map((role) => {
                              const colors = getRoleBadgeColors(role);
                              return (
                                <FormField
                                  key={role}
                                  control={form.control}
                                  name="rolesToRemove"
                                  render={({ field }) => {
                                    const currentValue = field.value || [];
                                    return (
                                      <FormItem
                                        key={role}
                                        className={`flex items-center space-x-3 space-y-0 p-4 rounded-lg border-2 transition-all cursor-pointer hover:bg-destructive/10 ${
                                          currentValue.includes(role)
                                            ? "bg-destructive/10 border-destructive"
                                            : "border-muted"
                                        }`}
                                      >
                                        <FormControl>
                                          <Checkbox
                                            checked={currentValue.includes(
                                              role
                                            )}
                                            onCheckedChange={(checked) => {
                                              const newValue = checked
                                                ? [...currentValue, role]
                                                : currentValue.filter(
                                                    (value) => value !== role
                                                  );
                                              field.onChange(newValue);
                                            }}
                                          />
                                        </FormControl>
                                        <FormLabel
                                          className={`font-medium cursor-pointer flex-1 ${
                                            currentValue.includes(role)
                                              ? "text-destructive"
                                              : ""
                                          }`}
                                        >
                                          {getRoleDisplayName(role)}
                                        </FormLabel>
                                      </FormItem>
                                    );
                                  }}
                                />
                              );
                            })}
                          </div>
                          <FormDescription className="text-xs text-destructive/70">
                            Chọn các vai trò bạn muốn xóa khỏi người dùng này
                          </FormDescription>
                        </FormItem>
                      )}
                    />
                  )}
                </div>
              )}

              <DialogFooter className="gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={onClose}
                  disabled={isPending}
                >
                  Hủy
                </Button>
                <Button
                  type="submit"
                  disabled={isPending}
                  variant={mode === "remove" ? "destructive" : "default"}
                  className="gap-2"
                >
                  {isPending && <Loader2 className="h-4 w-4 animate-spin" />}
                  {mode === "add" ? "Thêm vai trò" : "Xóa vai trò"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </div>
      </DialogContent>
    </Dialog>
  );
}
