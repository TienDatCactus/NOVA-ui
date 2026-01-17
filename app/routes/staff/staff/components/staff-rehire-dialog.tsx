import { zodResolver } from "@hookform/resolvers/zod";
import { format } from "date-fns";
import { CalendarIcon, Loader2 } from "lucide-react";
import { useForm } from "react-hook-form";
import { z } from "zod";
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
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "~/components/ui/popover";
import { Textarea } from "~/components/ui/textarea";
import { cn } from "~/lib/utils";
import type { StaffListItemDto } from "~/services/api/staff/staff/dto";
import { useRehireStaff } from "../container/query.hooks";

interface StaffRehireDialogProps {
  staff: StaffListItemDto;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const rehireFormSchema = z.object({
  rehireDate: z.date("Vui lòng chọn ngày tái tuyển dụng"),
  note: z.string().optional(),
});

type RehireFormValues = z.infer<typeof rehireFormSchema>;

export default function StaffRehireDialog({
  staff,
  open,
  onOpenChange,
}: StaffRehireDialogProps) {
  const rehireMutation = useRehireStaff();

  const form = useForm<RehireFormValues>({
    resolver: zodResolver(rehireFormSchema),
    defaultValues: {
      rehireDate: new Date(),
      note: "",
    },
  });

  const onSubmit = async (values: RehireFormValues) => {
    try {
      await rehireMutation.mutateAsync({
        id: staff.id,
        data: {
          rehireDate: format(values.rehireDate, "yyyy-MM-dd"),
          note: values.note,
        },
      });
      form.reset();
      onOpenChange(false);
    } catch (error) {
      // Error handled by mutation
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Tái tuyển dụng nhân sự</DialogTitle>
          <DialogDescription>
            Tái tuyển dụng nhân sự{" "}
            <span className="font-semibold text-foreground">
              {staff.fullName}
            </span>{" "}
            ({staff.code})
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {/* Rehire Date */}
            <FormField
              control={form.control}
              name="rehireDate"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>
                    Ngày tái tuyển dụng{" "}
                    <span className="text-destructive">*</span>
                  </FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant="outline"
                          className={cn(
                            "w-full pl-3 text-left font-normal",
                            !field.value && "text-muted-foreground",
                          )}
                        >
                          {field.value ? (
                            format(field.value, "dd/MM/yyyy")
                          ) : (
                            <span>Chọn ngày</span>
                          )}
                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={field.value}
                        onSelect={field.onChange}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Note */}
            <FormField
              control={form.control}
              name="note"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Ghi chú</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Lý do tái tuyển dụng, vị trí mới..."
                      className="resize-none"
                      {...field}
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
                onClick={() => {
                  form.reset();
                  onOpenChange(false);
                }}
                disabled={rehireMutation.isPending}
              >
                Hủy
              </Button>
              <Button type="submit" disabled={rehireMutation.isPending}>
                {rehireMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Đang xử lý...
                  </>
                ) : (
                  "Tái tuyển dụng"
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
