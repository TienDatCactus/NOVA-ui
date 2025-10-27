import { zodResolver } from "@hookform/resolvers/zod";
import { AlertCircle } from "lucide-react";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
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
import { Button } from "~/components/ui/button";
import { Checkbox } from "~/components/ui/checkbox";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "~/components/ui/form";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "~/components/ui/sheet";

import type { RoomListItemDto } from "~/services/api/rooms/dto";
import { useUpdateRoom } from "../../container/useRoomMutation";
import { useRoomTypes } from "../../container/useRoomTypesQuery";
import { RoomStatusEnum } from "~/services/types/room.types";

const UpdateRoomFormSchema = z.object({
  roomName: z.string().min(1, "Tên phòng là bắt buộc"),
  roomTypeId: z.string().min(1, "Loại phòng là bắt buộc"),
  status: z.string().min(1, "Trạng thái là bắt buộc"),
  locked: z.boolean(),
});

type UpdateRoomFormData = z.infer<typeof UpdateRoomFormSchema>;

interface UpdateRoomSheetProps {
  open: boolean;
  onClose: () => void;
  room: RoomListItemDto | null;
}

function UpdateRoomSheet({ open, onClose, room }: UpdateRoomSheetProps) {
  const { mutate, isPending } = useUpdateRoom();
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const { data: roomTypes } = useRoomTypes();
  const form = useForm<UpdateRoomFormData>({
    resolver: zodResolver(UpdateRoomFormSchema),
    defaultValues: {
      roomName: room?.roomName || "",
      roomTypeId: room?.roomTypeId || "",
      status: room?.status || "",
      locked: room?.isOccupied || false,
    },
  });

  const handleSubmit = (data: UpdateRoomFormData) => {
    if (!room) return;

    mutate(
      {
        roomId: room.roomId,
        ...data,
      },
      {
        onSuccess: () => {
          onClose();
        },
      }
    );
  };

  const handleClose = () => {
    if (form.formState.isDirty) {
      setShowCancelDialog(true);
    } else {
      onClose();
    }
  };

  const handleConfirmClose = () => {
    form.reset();
    setShowCancelDialog(false);
    onClose();
  };

  if (!room) return null;

  return (
    <>
      <Sheet open={open} onOpenChange={handleClose}>
        <SheetContent className="sm:max-w-[500px] overflow-y-auto">
          <SheetHeader>
            <SheetTitle>Cập nhật thông tin phòng</SheetTitle>
            <SheetDescription>
              Chỉnh sửa thông tin chi tiết của phòng. Nhấn Lưu để cập nhật.
            </SheetDescription>
          </SheetHeader>

          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(handleSubmit)}
              className="space-y-4 px-4"
            >
              <div className="rounded-md border p-3 bg-muted/50">
                <p className="text-xs text-muted-foreground mb-1">Mã phòng</p>
                <p className="font-mono text-sm font-semibold">{room.roomId}</p>
              </div>

              {/* Room Name */}
              <FormField
                control={form.control}
                name="roomName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Tên phòng <span className="text-destructive">*</span>
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder="VD: R101, Villa Ocean View"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Room Type */}
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <FormField
                  control={form.control}
                  name="roomTypeId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        Loại phòng <span className="text-destructive">*</span>
                      </FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value}
                      >
                        <FormControl>
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="Chọn loại phòng" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {roomTypes?.map((type) => (
                            <SelectItem key={type.id} value={type.id}>
                              {type.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Status */}
                <FormField
                  control={form.control}
                  name="status"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        Trạng thái <span className="text-destructive">*</span>
                      </FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value}
                      >
                        <FormControl>
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="Chọn trạng thái" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {Object.entries(RoomStatusEnum).map(
                            ([key, value]) => (
                              <SelectItem key={key} value={key}>
                                {value}
                              </SelectItem>
                            )
                          )}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Locked */}
              <FormField
                control={form.control}
                name="locked"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <Label className="hover:bg-accent/50 flex items-start gap-3 rounded-lg border p-3 has-[[aria-checked=true]]:border-blue-600 has-[[aria-checked=true]]:bg-blue-50 dark:has-[[aria-checked=true]]:border-blue-900 dark:has-[[aria-checked=true]]:bg-blue-950">
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                          className="data-[state=checked]:border-blue-600 data-[state=checked]:bg-blue-600 data-[state=checked]:text-white dark:data-[state=checked]:border-blue-700 dark:data-[state=checked]:bg-blue-700"
                        />
                        <div className="grid gap-1.5 font-normal">
                          <p className="text-sm leading-none font-medium">
                            Khóa phòng
                          </p>
                          <p className="text-muted-foreground text-sm">
                            {room.isOccupied && field.value ? (
                              <span className="text-yellow-600">
                                <AlertCircle /> Phòng đang được sử dụng
                              </span>
                            ) : (
                              "Phòng bị khóa sẽ không thể đặt được"
                            )}
                          </p>
                        </div>
                      </Label>
                    </FormControl>
                  </FormItem>
                )}
              />

              <SheetFooter className="gap-2 p-0">
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
              </SheetFooter>
            </form>
          </Form>
        </SheetContent>
      </Sheet>

      {/* Cancel Confirmation Dialog */}
      <AlertDialog open={showCancelDialog} onOpenChange={setShowCancelDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Hủy thay đổi?</AlertDialogTitle>
            <AlertDialogDescription>
              Bạn có thay đổi chưa được lưu. Bạn có chắc chắn muốn hủy?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setShowCancelDialog(false)}>
              Tiếp tục chỉnh sửa
            </AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmClose}>
              Hủy thay đổi
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

export default UpdateRoomSheet;
