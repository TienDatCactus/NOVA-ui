import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { format } from "date-fns";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
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
import { DatePicker } from "~/components/ui/date-picker";
import { Textarea } from "~/components/ui/textarea";
import { useTerminateStaff } from "../container/query.hooks";
import type {
  StaffListItemDto,
  TerminateStaffDto,
} from "~/services/api/staff/staff/dto";
import { StaffSchema } from "~/services/api/staff/staff/staff.schema";

interface StaffTerminateDialogProps {
  staff: StaffListItemDto;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function StaffTerminateDialog({
  staff,
  open,
  onOpenChange,
}: StaffTerminateDialogProps) {
  const { mutate: terminateStaff, isPending } = useTerminateStaff();

  const form = useForm<TerminateStaffDto>({
    resolver: zodResolver(StaffSchema.TerminateStaffSchema),
    defaultValues: {
      terminationDate: format(new Date(), "yyyy-MM-dd"),
      note: "",
    },
  });

  const onSubmit = (data: TerminateStaffDto) => {
    terminateStaff(
      { id: staff.id, data },
      {
        onSuccess: () => {
          onOpenChange(false);
          form.reset();
        },
      }
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Kết thúc hợp đồng nhân sự</DialogTitle>
          <DialogDescription>
            Kết thúc hợp đồng cho nhân sự: <strong>{staff.fullName}</strong> (
            {staff.code})
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="terminationDate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Ngày kết thúc hợp đồng</FormLabel>
                  <FormControl>
                    <DatePicker
                      value={field.value ? new Date(field.value) : undefined}
                      onChange={(date) => {
                        field.onChange(date ? format(date, "yyyy-MM-dd") : "");
                      }}
                      placeholder="Chọn ngày kết thúc"
                    />
                  </FormControl>
                  <FormDescription>
                    Ngày chính thức kết thúc hợp đồng làm việc
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="note"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Ghi chú</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Lý do kết thúc hợp đồng..."
                      className="resize-none"
                      rows={4}
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Ghi chú về lý do kết thúc hợp đồng (tùy chọn)
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isPending}
              >
                Hủy
              </Button>
              <Button type="submit" variant="destructive" disabled={isPending}>
                {isPending ? "Đang xử lý..." : "Kết thúc hợp đồng"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
