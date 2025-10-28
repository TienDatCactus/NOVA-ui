import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "~/components/ui/sheet";
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
import { Switch } from "~/components/ui/switch";
import { Badge } from "~/components/ui/badge";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import useRoomTypesSchema from "~/services/schema/room-types.schema";
import type z from "zod";
import { format, parseISO } from "date-fns";
import { vi } from "date-fns/locale";
import { useEffect, useState } from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "~/components/ui/alert-dialog";
import type { RoomTypesListItemDto } from "~/services/api/room-types/dto";
import { useUpdateRoomType } from "../container/room-types-mutation.hooks";

const { UpdateRoomTypesDetailResponseSchema } = useRoomTypesSchema();
const EditRoomTypeFormSchema = UpdateRoomTypesDetailResponseSchema.pick({
  code: true,
  name: true,
  baseRate: true,
  active: true,
});

type EditRoomTypeFormData = z.infer<typeof EditRoomTypeFormSchema>;

interface EditRoomTypeSheetProps {
  open: boolean;
  onClose: (open: boolean) => void;
  roomType: RoomTypesListItemDto | null;
}

export function UpdateRoomTypeSheet({
  open,
  onClose,
  roomType,
}: EditRoomTypeSheetProps) {
  const { mutate, isPending } = useUpdateRoomType();
  const [showCancelDialog, setShowCancelDialog] = useState(false);

  const form = useForm<EditRoomTypeFormData>({
    resolver: zodResolver(EditRoomTypeFormSchema),
    defaultValues: {
      code: "",
      name: "",
      baseRate: 0,
      active: true,
    },
  });

  useEffect(() => {
    if (roomType) {
      form.reset({
        code: roomType.code,
        name: roomType.name,
        baseRate: roomType.baseRate,
        active: roomType.active,
      });
    }
  }, [roomType, form]);

  const handleClose = () => {
    if (form.formState.isDirty) {
      setShowCancelDialog(true);
    } else {
      onClose(false);
      form.reset();
    }
  };

  const handleConfirmClose = () => {
    setShowCancelDialog(false);
    onClose(false);
    form.reset();
  };

  const handleSubmit = (data: EditRoomTypeFormData) => {
    if (roomType) {
      mutate({
        id: roomType.id,
        data,
      });
    }
  };

  if (!roomType) return null;

  return (
    <>
      <Sheet open={open} onOpenChange={handleClose}>
        <SheetContent className="sm:max-w-[500px] px-4 overflow-y-auto">
          <SheetHeader>
            <SheetTitle>Chỉnh sửa hạng phòng</SheetTitle>
            <SheetDescription>
              Cập nhật thông tin hạng phòng {roomType.code}
            </SheetDescription>
          </SheetHeader>

          <div className="space-y-4">
            {roomType && (
              <div className="rounded-lg border p-4 space-y-2 bg-muted/50">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">
                    Số phòng hiện tại
                  </span>
                  <Badge variant="outline">{roomType.roomsCount}</Badge>
                </div>
              </div>
            )}

            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(handleSubmit)}
                className="space-y-4"
              >
                <FormField
                  control={form.control}
                  name="code"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Mã hạng phòng *</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="VD: DELUXE"
                          {...field}
                          disabled={isPending}
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
                      <FormLabel>Tên hạng phòng *</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="VD: Phòng Deluxe"
                          {...field}
                          disabled={isPending}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="baseRate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Giá cơ bản (VNĐ) *</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="VD: 1000000"
                          {...field}
                          onChange={(e) =>
                            field.onChange(Number.parseFloat(e.target.value))
                          }
                          disabled={isPending}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="active"
                  render={({ field }) => (
                    <FormItem className="flex items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">Trạng thái</FormLabel>
                        <div className="text-sm text-muted-foreground">
                          Kích hoạt hạng phòng này
                        </div>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                          disabled={isPending}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />

                <div className="flex justify-end gap-2 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleClose}
                    disabled={isPending}
                  >
                    Hủy
                  </Button>
                  <Button type="submit" disabled={isPending}>
                    {isPending ? "Đang lưu..." : "Lưu thay đổi"}
                  </Button>
                </div>
              </form>
            </Form>
          </div>
        </SheetContent>
      </Sheet>

      <AlertDialog open={showCancelDialog} onOpenChange={setShowCancelDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Có thay đổi chưa được lưu</AlertDialogTitle>
            <AlertDialogDescription>
              Bạn có chắc chắn muốn đóng? Tất cả thay đổi sẽ bị mất.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Tiếp tục chỉnh sửa</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmClose}>
              Đóng
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
