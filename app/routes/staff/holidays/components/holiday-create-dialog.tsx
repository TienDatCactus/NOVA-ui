import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
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
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "~/components/ui/form";
import { Input } from "~/components/ui/input";
import { Button } from "~/components/ui/button";
import { Switch } from "~/components/ui/switch";
import { Card } from "~/components/ui/card";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "~/components/ui/popover";
import { Calendar } from "~/components/ui/calendar";
import { Loader2, CalendarDays, ChevronDownIcon } from "lucide-react";
import { useState } from "react";
import { HolidayService } from "~/services/api/holiday";
import { toast } from "sonner";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import { cn } from "~/lib/utils";

import { useCreateHoliday } from "../container/mutation.hooks";
import { HolidaySchema } from "~/services/api/holiday/holiday.schema";
import type { CreateHolidayRequest } from "~/services/api/holiday/dto";
import { DatePicker } from "~/components/ui/date-picker";

interface CreateHolidayDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function CreateHolidayDialog({
  open,
  onOpenChange,
}: CreateHolidayDialogProps) {
  const form = useForm<CreateHolidayRequest>({
    resolver: zodResolver(HolidaySchema.CreateHolidayRequestSchema),
    defaultValues: {
      name: "",
      startDate: undefined,
      endDate: undefined,
      isPublicHoliday: false,
      bonusAmount: 0,
    },
  });

  const { mutateAsync: createHoliday, isPending } = useCreateHoliday();
  const handleSubmit = async (data: CreateHolidayRequest) => {
    try {
      await createHoliday(
        {
          ...data,
          startDate: format(data.startDate, "yyyy-MM-dd"),
          endDate: format(data.endDate, "yyyy-MM-dd"),
        },
        {
          onSuccess: () => {
            form.reset();
            onOpenChange(false);
          },
        }
      );
    } catch (error) {
      console.error("Create holiday error:", error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[520px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl">Thêm ngày nghỉ mới</DialogTitle>
          <DialogDescription>
            Tạo ngày nghỉ lễ cho nhân viên khách sạn
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            className="space-y-6 "
          >
            <div className="space-y-4">
              {/* Name */}
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-semibold">
                      Tên ngày nghỉ <span className="text-destructive">*</span>
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder="VD: Tết Nguyên Đán, Quốc Khánh..."
                        {...field}
                      />
                    </FormControl>
                    <FormDescription className="text-xs">
                      Tên mô tả ngày nghỉ lễ
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Start Date */}
              <FormField
                control={form.control}
                name="startDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-semibold">
                      Ngày bắt đầu <span className="text-destructive">*</span>
                    </FormLabel>
                    <DatePicker
                      mode="single"
                      selected={new Date(field.value)}
                      value={field.value}
                      onChange={(value) =>
                        field.onChange(
                          format(value ?? new Date(), "yyyy-MM-dd")
                        )
                      }
                    />
                    <FormDescription className="text-xs">
                      Ngày bắt đầu của kỳ nghỉ lễ
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* End Date */}
              <FormField
                control={form.control}
                name="endDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-semibold">
                      Ngày kết thúc <span className="text-destructive">*</span>
                    </FormLabel>
                    <DatePicker
                      mode="single"
                      value={field.value}
                      selected={new Date(field.value)}
                      onChange={(value) =>
                        field.onChange(
                          format(value ?? new Date(), "yyyy-MM-dd")
                        )
                      }
                    />
                    <FormDescription className="text-xs">
                      Ngày kết thúc của kỳ nghỉ lễ
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Bonus Amount */}
              <FormField
                control={form.control}
                name="bonusAmount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-semibold">
                      Tiền thưởng <span className="text-destructive">*</span>
                    </FormLabel>
                    <FormControl>
                      <Input
                        type="text"
                        placeholder="0"
                        value={field.value}
                        onChange={(e) => field.onChange(Number(e.target.value))}
                      />
                    </FormControl>
                    <FormDescription className="text-xs">
                      Số tiền thưởng cho nhân viên làm việc trong ngày nghỉ lễ
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Is Public Holiday */}
              <FormField
                control={form.control}
                name="isPublicHoliday"
                render={({ field }) => (
                  <FormItem>
                    <Card className="p-4 border-muted bg-muted/30">
                      <div className="flex items-center justify-between space-x-4">
                        <div className="flex-1 space-y-1">
                          <FormLabel className="text-sm font-semibold">
                            Trạng thái ngày nghỉ
                          </FormLabel>
                          <FormDescription className="text-xs">
                            Đánh dấu là ngày lễ chính thức của quốc gia
                          </FormDescription>
                        </div>
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                      </div>
                    </Card>
                  </FormItem>
                )}
              />
            </div>

            {/* Actions */}
            <DialogFooter className="gap-2 sm:gap-0">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isPending}
              >
                Hủy
              </Button>
              <Button type="submit" disabled={isPending} className="gap-2">
                {isPending && <Loader2 className="h-4 w-4 animate-spin" />}
                {isPending ? "Đang tạo..." : "Tạo ngày nghỉ"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
