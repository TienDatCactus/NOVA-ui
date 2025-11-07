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
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "~/components/ui/form";
import { Input } from "~/components/ui/input";
import { Pencil, Loader2 } from "lucide-react";
import { useUpdateUser } from "../container/useUsers.hooks";
import type { UserItem, UpdateUserDto } from "~/services/api/user/dto";
import { useEffect } from "react";
import { UserSchema } from "~/services/api/user/user.schema";

interface UserEditDialogProps {
  user: UserItem;
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function UserEditDialog({
  user,
  open,
  onClose,
  onSuccess,
}: UserEditDialogProps) {
  const { UpdateUserSchema } = UserSchema;
  const { mutate: updateUser, isPending } = useUpdateUser();

  const form = useForm<UpdateUserDto>({
    resolver: zodResolver(UpdateUserSchema),
    defaultValues: {
      fullName: user.fullName,
      email: user.email,
      phoneNumber: user.phoneNumber || "",
    },
  });

  // Update form when user changes
  useEffect(() => {
    form.reset({
      fullName: user.fullName,
      email: user.email,
      phoneNumber: user.phoneNumber || "",
    });
  }, [user, form]);

  const handleSubmit = (data: UpdateUserDto) => {
    // Only send the 3 fields that API allows to update
    const updatePayload = {
      fullName: data.fullName,
      email: data.email,
      phoneNumber: data.phoneNumber,
    };
    updateUser(
      { id: user.id, data: updatePayload as any },
      {
        onSuccess: (response) => {
          // Toast already shown by http interceptor
          onSuccess(); // Just close dialog and refresh
        },
        onError: (error: any) => {
          // Error toast already shown by http interceptor
          // Just log for debugging
          console.error("Update failed:", error);
        },
      }
    );
  };

  const handleClose = () => {
    form.reset();
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-2xl flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10">
              <Pencil className="h-5 w-5 text-primary" />
            </div>
            Cập nhật thông tin khách hàng
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            className="space-y-6"
          >
            {/* Thông tin cá nhân */}
            <div className="space-y-4">
              <h3 className="font-semibold text-base">Thông tin cá nhân</h3>
              <FormField
                control={form.control}
                name="fullName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Họ và tên</FormLabel>
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
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input placeholder="example@email.com" {...field} />
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
                      <FormLabel>Số điện thoại</FormLabel>
                      <FormControl>
                        <Input placeholder="0123456789" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

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
                Cập nhật
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
