import { zodResolver } from "@hookform/resolvers/zod";
import { Activity, BedDouble, DoorOpen, Hash, Save, X } from "lucide-react";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";

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
import { Badge } from "~/components/ui/badge";
import { Separator } from "~/components/ui/separator";

import type {
  RoomListItemDto,
  UpdateRoomDetailRequestDto,
} from "~/services/api/rooms/dto";
import { RoomStatusEnum } from "~/services/api/rooms/room.types";
import { useRoomTypes } from "../../container/room-types/query.hooks";
import { useUpdateRoom } from "../../container/rooms/mutation.hooks";
import { RoomSchema } from "~/services/api/rooms/room.schema";

const { UpdateRoomDetailRequestSchema } = RoomSchema;

interface UpdateRoomSheetProps {
  open: boolean;
  onClose: () => void;
  room: RoomListItemDto | null;
}

function UpdateRoomSheet({ open, onClose, room }: UpdateRoomSheetProps) {
  // --- Hooks ---
  const { mutate, isPending } = useUpdateRoom();
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const { data: roomTypes } = useRoomTypes();

  const form = useForm<UpdateRoomDetailRequestDto>({
    resolver: zodResolver(UpdateRoomDetailRequestSchema),
    defaultValues: {
      roomName: "",
      roomTypeId: "",
      status: "",
    },
  });

  // --- Effects ---
  useEffect(() => {
    if (room) {
      form.reset({
        roomName: room.roomName,
        roomTypeId: room.roomTypeId,
        status: room.status,
      });
    }
  }, [room, form]);

  // --- Handlers ---
  const handleSubmit = (data: UpdateRoomDetailRequestDto) => {
    if (!room) return;
    mutate({ id: room.roomId, data: data }, { onSuccess: () => onClose() });
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
        <SheetContent className="sm:max-w-[500px] w-full p-0 flex flex-col bg-background">
          {/* === HEADER === */}
          <SheetHeader className="px-6 py-4 border-b shrink-0 flex flex-row items-start justify-between space-y-0">
            <div className="space-y-1">
              <SheetTitle className="text-xl flex items-center gap-2">
                <DoorOpen className="w-5 h-5 text-primary" />
                Cập nhật phòng
              </SheetTitle>
              <SheetDescription>
                Điều chỉnh thông tin vận hành cho phòng.
              </SheetDescription>
            </div>

            {/* Technical ID Badge */}
            <Badge
              variant="outline"
              className="font-mono text-[10px] text-muted-foreground"
            >
              {room.roomId.split("-")[0]}...
            </Badge>
          </SheetHeader>

          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(handleSubmit)}
              className="flex-1 flex flex-col min-h-0"
            >
              {/* === BODY === */}
              <div className="flex-1 px-6 space-y-6 overflow-y-auto">
                {/* 1. HERO SECTION: NAME & CODE */}
                <div className="space-y-4">
                  <FormField
                    control={form.control}
                    name="roomName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                          Tên / Số phòng{" "}
                          <span className="text-destructive">*</span>
                        </FormLabel>
                        <FormControl>
                          <Input
                            startAddon={
                              <Hash className=" h-5 w-5 text-muted-foreground" />
                            }
                            className="text-lg font-bold "
                            placeholder="VD: 101, 202..."
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <Separator />

                {/* 2. CONFIGURATION */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2 text-xs font-bold text-muted-foreground uppercase tracking-wider">
                    <Activity className="w-3.5 h-3.5" /> Cấu hình vận hành
                  </div>

                  <div className="grid gap-5">
                    {/* Room Type */}
                    <FormField
                      control={form.control}
                      name="roomTypeId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Loại phòng</FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            value={field.value}
                          >
                            <FormControl>
                              <SelectTrigger className="h-11 pl-9 relative">
                                <BedDouble className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                <SelectValue placeholder="Chọn loại phòng" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {roomTypes?.map((type) => (
                                <SelectItem key={type.id} value={type.id}>
                                  <div className="flex items-center justify-between w-full gap-2">
                                    <span>{type.name}</span>
                                    <span className="text-xs text-muted-foreground font-mono">
                                      Code: {type.code}
                                    </span>
                                  </div>
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
                          <FormLabel>Trạng thái phòng</FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            value={field.value}
                          >
                            <FormControl>
                              <SelectTrigger className="h-11 pl-9 relative">
                                <Activity className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                <SelectValue placeholder="Chọn trạng thái" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {Object.entries(RoomStatusEnum).map(
                                ([key, value]) => (
                                  <SelectItem key={key} value={key}>
                                    {/* You can map colors here based on status if needed */}
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
                </div>
              </div>

              {/* === FOOTER === */}
              <SheetFooter className="p-6 pt-4 border-t shrink-0 bg-background">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleClose}
                  disabled={isPending}
                >
                  <X className="w-4 h-4 mr-2" /> Hủy bỏ
                </Button>
                <Button
                  type="submit"
                  disabled={isPending}
                  className="min-w-[140px]"
                >
                  {isPending ? (
                    <>
                      <div className="animate-spin mr-2 h-4 w-4 border-2 border-current border-t-transparent rounded-full" />
                      Đang lưu...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4 mr-2" /> Lưu thay đổi
                    </>
                  )}
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

export default UpdateRoomSheet;
