import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Button } from "~/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "~/components/ui/form";
import { Input } from "~/components/ui/input";
import { Textarea } from "~/components/ui/textarea";
import type { CreateStaffRoleDto } from "~/services/api/staff/staff-role/dto";
import { StaffRoleSchema } from "~/services/api/staff/staff-role/staff-role.schema";
import { useCreateStaffRole } from "../container/query.hooks";

interface CreateRoleDialogProps {
  open: boolean;
  onClose: () => void;
}

export default function CreateRoleDialog({
  open,
  onClose,
}: CreateRoleDialogProps) {
  const { mutate: createRole, isPending } = useCreateStaffRole();

  const form = useForm<CreateStaffRoleDto>({
    resolver: zodResolver(StaffRoleSchema.CreateStaffRoleSchema),
    defaultValues: {
      code: "",
      name: "",
      description: "",
    },
  });

  const onSubmit = (data: CreateStaffRoleDto) => {
    createRole(
      {
        code: data.code,
        name: data.name,
        description: data.description || undefined,
      },
      {
        onSuccess: () => {
          form.reset();
          onClose();
        },
      }
    );
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Tạo vai trò mới</DialogTitle>
          <DialogDescription>
            Tạo vai nhân sự mới trong hệ thống
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="code"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Mã vai trò <span className="text-destructive">*</span>
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder="VD: MANAGER, RECEPTIONIST..."
                      {...field}
                      className="font-mono"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Tên vai trò <span className="text-destructive">*</span>
                  </FormLabel>
                  <FormControl>
                    <Input placeholder="VD: Quản lý, Lễ tân..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Mô tả</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Mô tả vai trò và trách nhiệm..."
                      {...field}
                      rows={3}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                disabled={isPending}
              >
                Hủy
              </Button>
              <Button type="submit" disabled={isPending}>
                {isPending ? "Đang tạo..." : "Tạo vai trò"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
