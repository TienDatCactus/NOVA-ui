import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Avatar, AvatarFallback } from "~/components/ui/avatar";
import { Button } from "~/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "~/components/ui/form";
import PasswordInput from "~/components/ui/password-input";
import type { SavedAccount } from "~/store/account-manager.store";

const QuickPasswordSchema = z.object({
  password: z.string().min(1, "Vui lòng nhập mật khẩu"),
});

type QuickPasswordFormData = z.infer<typeof QuickPasswordSchema>;

interface QuickPasswordDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  account: SavedAccount | null;
  onSubmit: (password: string) => Promise<void>;
  isLoading?: boolean;
}

export function QuickPasswordDialog({
  open,
  onOpenChange,
  account,
  onSubmit,
  isLoading = false,
}: QuickPasswordDialogProps) {
  const form = useForm<QuickPasswordFormData>({
    resolver: zodResolver(QuickPasswordSchema),
    defaultValues: {
      password: "",
    },
  });

  // Reset form when dialog opens/closes
  useEffect(() => {
    if (!open) {
      form.reset();
    }
  }, [open, form]);

  const handleSubmit = async (data: QuickPasswordFormData) => {
    await onSubmit(data.password);
  };

  if (!account) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[360px] gap-6">
        <DialogHeader className="space-y-3">
          <div className="flex justify-center">
            <Avatar className="h-16 w-16 rounded-xl border-2 border-muted">
              <AvatarFallback className="rounded-xl text-xl bg-muted-foreground/20 ">
                {account.fullName?.charAt(0) || account.userName.charAt(0)}
              </AvatarFallback>
            </Avatar>
          </div>
          <div className="text-center space-y-1">
            <DialogTitle className="text-lg">Chuyển sang tài khoản</DialogTitle>
            <DialogDescription className="text-base font-medium text-foreground">
              {account.fullName || account.userName}
            </DialogDescription>
            <p className="text-xs text-muted-foreground">@{account.userName}</p>
          </div>
        </DialogHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            className="space-y-4"
          >
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <PasswordInput
                      {...field}
                      placeholder="Nhập mật khẩu..."
                      autoFocus
                      disabled={isLoading}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex gap-2 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isLoading}
                className="flex-1"
              >
                Hủy
              </Button>
              <Button type="submit" disabled={isLoading} className="flex-1">
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Đang đăng nhập...
                  </>
                ) : (
                  "Đăng nhập"
                )}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
