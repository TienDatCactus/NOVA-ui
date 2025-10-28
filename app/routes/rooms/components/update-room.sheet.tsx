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

import type {
  RoomListItemDto,
  UpdateRoomDetailRequestDto,
} from "~/services/api/rooms/dto";
import { useUpdateRoom } from "../container/useRoomMutation";
import { useRoomTypes } from "../container/useRoomTypesQuery";
import { RoomStatusEnum } from "~/services/types/room.types";
import useRoomSchema from "~/services/schema/room.schema";

const { UpdateRoomDetailRequestSchema } = useRoomSchema();

interface UpdateRoomSheetProps {
  open: boolean;
  onClose: () => void;
  room: RoomListItemDto | null;
}

function UpdateRoomSheet({ open, onClose, room }: UpdateRoomSheetProps) {
  const { mutate, isPending } = useUpdateRoom();
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const { data: roomTypes } = useRoomTypes();
  const form = useForm<UpdateRoomDetailRequestDto>({
    resolver: zodResolver(UpdateRoomDetailRequestSchema),
    defaultValues: {
      roomName: room?.roomName || "",
      roomTypeId: room?.roomTypeId || "",
      status: room?.status || "",
    },
  });

  const handleSubmit = (data: UpdateRoomDetailRequestDto) => {
    if (!room) return;

    mutate(
      {
        id: room.roomId,
        data: data,
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

              <SheetFooter className="gap-2 p-0">
                <Button type="submit" disabled={isPending}>
                  {isPending ? "Đang lưu..." : "Lưu thay đổi"}
                </Button>{" "}
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleClose}
                  disabled={isPending}
                >
                  Hủy
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
