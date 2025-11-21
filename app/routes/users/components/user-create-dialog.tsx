import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "~/components/ui/dialog";
import { Button } from "~/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "~/components/ui/form";
import { Input } from "~/components/ui/input";
import { Checkbox } from "~/components/ui/checkbox";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "~/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandItem,
} from "~/components/ui/command";
import { Badge } from "~/components/ui/badge";
import {
  UserPlus,
  Loader2,
  Pencil,
  Check,
  ChevronsUpDown,
  X,
} from "lucide-react";
import { cn } from "~/lib/utils";
import {
  useCreateUser,
  useUpdateUser,
  useRoles,
} from "../container/useUsers.hooks";
import type {
  CreateUserDto,
  UserItem,
  UpdateUserDto,
} from "~/services/api/user/dto";
import { useEffect, useMemo, useState } from "react";
import { UserSchema } from "~/services/api/user/user.schema";
import { getRoleDisplayName } from "~/services/types/users.types";

interface UserFormDialogProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  user?: UserItem;
  mode?: "create" | "edit";
}

export function UserFormDialog({
  open,
  onClose,
  onSuccess,
  user,
  mode = "create",
}: UserFormDialogProps) {
  const { CreateUserSchema, UpdateUserSchema } = UserSchema;
  const { mutate: createUser, isPending: isCreating } = useCreateUser();
  const { mutate: updateUser, isPending: isUpdating } = useUpdateUser();
  const {
    data: rolesData,
    isPending: isLoadingRoles,
    error: rolesError,
  } = useRoles();

  const isEditMode = mode === "edit";
  const isPending = isCreating || isUpdating;
  const [openRoleSelect, setOpenRoleSelect] = useState(false);

  // Transform roles data to array of objects with id and label
  const availableRoles = useMemo(() => {
    if (!rolesData) return [];
    const transformed = rolesData.map((role) => ({
      id: role,
      label: getRoleDisplayName(role),
    }));
    return transformed;
  }, [rolesData, isLoadingRoles, rolesError]);

  const form = useForm<CreateUserDto | UpdateUserDto>({
    resolver: zodResolver(isEditMode ? UpdateUserSchema : CreateUserSchema),
    defaultValues:
      isEditMode && user
        ? {
            fullName: user.fullName,
            email: user.email,
            phoneNumber: user.phoneNumber,
          }
        : {
            userName: "",
            email: "",
            fullName: "",
            password: "",
            phoneNumber: "",
            roles: [],
          },
  });

  // Update form values when user changes in edit mode
  useEffect(() => {
    if (isEditMode && user) {
      form.reset({
        fullName: user.fullName,
        email: user.email,
        phoneNumber: user.phoneNumber,
      });
    }
  }, [user, isEditMode, form]);

  const handleSubmit = (data: CreateUserDto | UpdateUserDto) => {
    if (isEditMode && user) {
      // Update mode - Extract only the fields we need
      const updatePayload: UpdateUserDto = {
        fullName: (data as UpdateUserDto).fullName,
        email: (data as UpdateUserDto).email,
        phoneNumber: (data as UpdateUserDto).phoneNumber || "",
      };

      updateUser(
        { id: user.id, data: updatePayload },
        {
          onSuccess: (response) => {
            form.reset();
            onSuccess();
          },
          onError: (error) => {
            console.error("Update user error callback!", error);
          },
        }
      );
    } else {
      // Create mode
      createUser(data as CreateUserDto, {
        onSuccess: (response) => {
          form.reset();
          onSuccess();
        },
        onError: (error) => {
          console.error("Create user error callback!", error);
        },
      });
    }
  };

  const handleClose = () => {
    form.reset();
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10">
              {isEditMode ? (
                <Pencil className="h-5 w-5 text-primary" />
              ) : (
                <UserPlus className="h-5 w-5 text-primary" />
              )}
            </div>
            {isEditMode
              ? "Cập nhật thông tin khách hàng"
              : "Thêm khách hàng mới"}
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            className="space-y-6"
          >
            {/* Thông tin đăng nhập - Only show in create mode */}
            {!isEditMode && (
              <div className="space-y-4">
                <h3 className="font-semibold text-base">Thông tin đăng nhập</h3>
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="userName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Tên đăng nhập <span className="text-destructive">*</span></FormLabel>
                        <FormControl>
                          <Input placeholder="john_doe" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Mật khẩu <span className="text-destructive">*</span></FormLabel>
                        <FormControl>
                          <Input
                            type="password"
                            placeholder="••••••••"
                            {...field}
                          />
                        </FormControl>
                        <FormDescription className="text-xs">
                          Tối thiểu 6 ký tự
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>
            )}

            {/* Thông tin cá nhân */}
            <div className="space-y-4">
              <h3 className="font-semibold text-base">Thông tin cá nhân</h3>
              <FormField
                control={form.control}
                name="fullName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Họ và tên <span className="text-destructive">*</span></FormLabel>
                    <FormControl>
                      <Input placeholder="Nguyễn Văn A" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email <span className="text-destructive">*</span></FormLabel>
                      <FormControl>
                        <Input
                          type="email"
                          placeholder="example@email.com"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="phoneNumber"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Số điện thoại<span className="text-destructive">*</span></FormLabel>
                      <FormControl>
                        <Input placeholder="0123456789" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* Vai trò - Only show in create mode */}
            {!isEditMode && (
              <div className="space-y-4">
                <h3 className="font-semibold text-base">Vai trò</h3>
                {isLoadingRoles ? (
                  <div className="text-sm text-muted-foreground">
                    Đang tải vai trò...
                  </div>
                ) : rolesError ? (
                  <div className="text-sm text-destructive">
                    Lỗi tải vai trò: {rolesError.message}
                  </div>
                ) : availableRoles.length === 0 ? (
                  <div className="text-sm text-muted-foreground">
                    Không có vai trò nào
                  </div>
                ) : (
                  <FormField
                    control={form.control}
                    name="roles"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Chọn vai trò <span className="text-destructive">*</span></FormLabel>
                        <Popover
                          open={openRoleSelect}
                          onOpenChange={setOpenRoleSelect}
                        >
                          <PopoverTrigger asChild>
                            <FormControl>
                              <Button
                                variant="outline"
                                role="combobox"
                                className={cn(
                                  "w-full justify-between",
                                  !field.value?.length &&
                                    "text-muted-foreground"
                                )}
                              >
                                {field.value?.length
                                  ? `Đã chọn ${field.value.length} vai trò`
                                  : "Chọn vai trò..."}
                                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                              </Button>
                            </FormControl>
                          </PopoverTrigger>
                          <PopoverContent className="w-full p-0" align="start">
                            <Command>
                              <CommandEmpty>
                                Không tìm thấy vai trò
                              </CommandEmpty>
                              <CommandGroup className="max-h-64 overflow-auto">
                                {availableRoles.map((role) => {
                                  const isSelected = field.value?.includes(
                                    role.id
                                  );
                                  return (
                                    <CommandItem
                                      key={role.id}
                                      value={role.id}
                                      onSelect={() => {
                                        const currentValue = field.value || [];
                                        if (isSelected) {
                                          field.onChange(
                                            currentValue.filter(
                                              (val) => val !== role.id
                                            )
                                          );
                                        } else {
                                          field.onChange([
                                            ...currentValue,
                                            role.id,
                                          ]);
                                        }
                                      }}
                                      className="cursor-pointer"
                                    >
                                      <div
                                        className={cn(
                                          "mr-3 flex h-5 w-5 items-center justify-center rounded border-2 transition-colors",
                                          isSelected
                                            ? "bg-blue-200 border-blue-600 text-white"
                                            : "border-gray-300 bg-white"
                                        )}
                                      >
                                        {isSelected && (
                                          <Check className="h-4 w-4 stroke-[3]" />
                                        )}
                                      </div>
                                      <span className="font-medium">
                                        {role.label}
                                      </span>
                                    </CommandItem>
                                  );
                                })}
                              </CommandGroup>
                            </Command>
                          </PopoverContent>
                        </Popover>

                        {/* Selected Roles Display */}
                        {field.value && field.value.length > 0 && (
                          <div className="flex flex-wrap gap-2 mt-2">
                            {field.value.map((roleId) => {
                              const role = availableRoles.find(
                                (r) => r.id === roleId
                              );
                              return (
                                <Badge
                                  key={roleId}
                                  variant="secondary"
                                  className="gap-1 pr-1"
                                >
                                  {role?.label}
                                  <button
                                    type="button"
                                    className="ml-1 rounded-full hover:bg-muted"
                                    onClick={() => {
                                      field.onChange(
                                        field.value?.filter(
                                          (val) => val !== roleId
                                        )
                                      );
                                    }}
                                  >
                                    <X className="h-3 w-3" />
                                  </button>
                                </Badge>
                              );
                            })}
                          </div>
                        )}

                        <FormDescription className="text-xs">
                          Chọn ít nhất một vai trò cho khách hàng
                        </FormDescription>
                        <FormMessage />
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
                onClick={handleClose}
                disabled={isPending}
              >
                Hủy
              </Button>
              <Button type="submit" disabled={isPending} className="gap-2">
                {isPending && <Loader2 className="h-4 w-4 animate-spin" />}
                {isEditMode ? "Cập nhật" : "Tạo khách hàng"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
