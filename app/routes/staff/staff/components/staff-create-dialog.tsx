import { zodResolver } from "@hookform/resolvers/zod";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import { CalendarIcon, Hash, Mail } from "lucide-react";
import { useForm } from "react-hook-form";
import { Button } from "~/components/ui/button";
import { Calendar } from "~/components/ui/calendar";
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
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "~/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { Separator } from "~/components/ui/separator";
import { Textarea } from "~/components/ui/textarea";
import { cn } from "~/lib/utils";
import type { CreateStaffDto } from "~/services/api/staff/staff/dto";
import { StaffSchema } from "~/services/api/staff/staff/staff.schema";
import { useStaffRoleList } from "../../staff-role/container/query.hooks";
import { useCreateStaff } from "../container/query.hooks";

interface StaffDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function CreateStaffDialog({
  open,
  onOpenChange,
}: StaffDialogProps) {
  const { data: roles } = useStaffRoleList();
  const { mutateAsync: createStaff, isPending } = useCreateStaff();

  const form = useForm<CreateStaffDto>({
    resolver: zodResolver(StaffSchema.CreateStaffSchema),
    defaultValues: {
      code: "",
      fullName: "",
      phoneNumber: "",
      email: "",
      gender: "",
      dateOfBirth: undefined,
      citizenId: "",
      startDate: undefined,
      note: "",
      staffRoleId: "",
    },
  });

  const onSubmit = async (data: CreateStaffDto) => {
    await createStaff(data, {
      onSuccess: () => {
        onOpenChange(false);
        form.reset();
      },
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl p-0 gap-0 overflow-hidden max-h-[90vh] flex flex-col">
        {/* === HEADER === */}
        <DialogHeader className="px-6 py-4 border-b bg-muted/5 shrink-0">
          <DialogTitle className="text-lg">Thêm nhân sự mới</DialogTitle>
          <DialogDescription>
            Tạo hồ sơ và thiết lập vai trò cho nhân viên.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="flex-1 overflow-y-auto"
          >
            <div className="p-6 space-y-8">
              {/* 1. THÔNG TIN CƠ BẢN */}
              <section className="space-y-4">
                <h1 className="font-bold">Thông tin định danh</h1>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <FormField
                    control={form.control}
                    name="fullName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>
                          Họ và tên <span className="text-destructive">*</span>
                        </FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            placeholder="Ví dụ: Nguyễn Văn A"
                            className="bg-background"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="code"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>
                            Mã nhân viên{" "}
                            <span className="text-destructive">*</span>
                          </FormLabel>
                          <FormControl>
                            <Input
                              startAddon={<Hash className="opacity-50" />}
                              {...field}
                              placeholder="NV001"
                              className="font-mono"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="gender"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Giới tính</FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Chọn" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="Male">Nam</SelectItem>
                              <SelectItem value="Female">Nữ</SelectItem>
                              <SelectItem value="Other">Khác</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="dateOfBirth"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Ngày sinh</FormLabel>
                        <Popover>
                          <PopoverTrigger asChild>
                            <FormControl>
                              <Button
                                variant="outline"
                                className={cn(
                                  "w-full justify-start text-left font-normal pl-3",
                                  !field.value && "text-muted-foreground"
                                )}
                              >
                                <CalendarIcon className="mr-2 h-4 w-4 opacity-50" />
                                {field.value ? (
                                  format(field.value, "dd/MM/yyyy", {
                                    locale: vi,
                                  })
                                ) : (
                                  <span>DD/MM/YYYY</span>
                                )}
                              </Button>
                            </FormControl>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                              mode="single"
                              selected={field.value}
                              onSelect={field.onChange}
                              captionLayout="dropdown"
                              locale={vi}
                            />
                          </PopoverContent>
                        </Popover>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="citizenId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>CCCD / CMND</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            placeholder="0010xx..."
                            className="font-mono"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </section>

              <Separator className="my-2" />

              {/* 2. LIÊN HỆ */}
              <section className="space-y-4">
                <h1 className="font-bold">Thông tin liên hệ</h1>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <FormField
                    control={form.control}
                    name="phoneNumber"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>
                          Số điện thoại{" "}
                          <span className="text-destructive">*</span>
                        </FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="09xxxx..." />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Mail className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input
                              {...field}
                              type="email"
                              placeholder="example@nova.com"
                              className="pl-9"
                            />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </section>

              <Separator className="my-2" />

              {/* 3. CÔNG VIỆC */}
              <section className="space-y-4">
                <h1 className="font-bold">Thông tin công việc</h1>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <FormField
                    control={form.control}
                    name="staffRoleId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>
                          Vai trò / Chức vụ{" "}
                          <span className="text-destructive">*</span>
                        </FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Chọn vai trò" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {roles?.map((role) => (
                              <SelectItem key={role.id} value={role.id}>
                                {role.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="startDate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Ngày bắt đầu làm việc</FormLabel>
                        <Popover>
                          <PopoverTrigger asChild>
                            <FormControl>
                              <Button
                                variant="outline"
                                className={cn(
                                  "w-full justify-start text-left font-normal pl-3",
                                  !field.value && "text-muted-foreground"
                                )}
                              >
                                <CalendarIcon className="mr-2 h-4 w-4 opacity-50" />
                                {field.value ? (
                                  format(field.value, "dd/MM/yyyy", {
                                    locale: vi,
                                  })
                                ) : (
                                  <span>DD/MM/YYYY</span>
                                )}
                              </Button>
                            </FormControl>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                              mode="single"
                              selected={field.value}
                              onSelect={field.onChange}
                              fromYear={2010}
                              toYear={new Date().getFullYear() + 1}
                              locale={vi}
                            />
                          </PopoverContent>
                        </Popover>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="note"
                    render={({ field }) => (
                      <FormItem className="col-span-1 md:col-span-2">
                        <FormLabel>Ghi chú thêm</FormLabel>
                        <FormControl>
                          <Textarea
                            {...field}
                            placeholder="Ghi chú về kinh nghiệm, kỹ năng đặc biệt..."
                            className="resize-none"
                            rows={3}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </section>
            </div>

            <DialogFooter className="px-6 py-4 border-t bg-background shrink-0">
              <Button
                type="button"
                variant="ghost"
                onClick={() => onOpenChange(false)}
                disabled={isPending}
              >
                Hủy bỏ
              </Button>
              <Button
                type="submit"
                disabled={isPending}
                className="min-w-[120px]"
              >
                {isPending ? "Đang xử lý..." : "Tạo nhân sự"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
