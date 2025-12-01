import { zodResolver } from "@hookform/resolvers/zod";
import { AlertTriangle, BedDouble, Hash, Loader2, Save } from "lucide-react";
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
import { Badge } from "~/components/ui/badge";
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
import { Input } from "~/components/ui/input";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { Separator } from "~/components/ui/separator";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog";
import { cn } from "~/lib/utils";
import type {
  RoomListItemDto,
  UpdateRoomDetailRequestDto,
} from "~/services/api/rooms/dto";
import { RoomSchema } from "~/services/api/rooms/room.schema";
import { RoomStatusEnum } from "~/services/api/rooms/room.types";
import { useRoomTypes } from "../../container/room-types/query.hooks";
import { useUpdateRoom } from "../../container/rooms/mutation.hooks";

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
  const { data: roomTypes, isLoading: isLoadingTypes } = useRoomTypes();

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
    if (room && open) {
      form.reset({
        roomName: room.roomName,
        roomTypeId: room.roomTypeId,
        status: room.status,
      });
    }
  }, [room, open, form]);

  // --- Handlers ---
  const handleSubmit = (data: UpdateRoomDetailRequestDto) => {
    if (!room) return;
    mutate(
      { id: room.roomId, data: data },
      {
        onSuccess: () => {
          form.reset(); // Reset form state để tránh trigger dirty check
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
      <Dialog open={open} onOpenChange={handleClose}>
        <DialogContent className="sm:max-w-lg w-full p-0 flex flex-col gap-0 bg-background overflow-hidden">
          {/* === HEADER === */}
          <DialogHeader className="px-6 py-5 border-b bg-muted/30">
            <div className="flex items-start justify-between">
              <div className="space-y-1.5">
                <DialogTitle className="text-xl flex items-center gap-2.5">
                  Chỉnh sửa thông tin phòng
                </DialogTitle>
                <DialogDescription>
                  Cập nhật tên, loại phòng và trạng thái vận hành.
                </DialogDescription>
              </div>

              <Badge
                variant="outline"
                className="font-mono text-[10px] text-muted-foreground uppercase tracking-wider bg-background"
              >
                ID: {room.roomId.split("-")[0]}
              </Badge>
            </div>
          </DialogHeader>

          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(handleSubmit)}
              className="flex flex-col"
            >
              {/* === BODY === */}
              <div className="p-6 space-y-6">
                {/* 1. Primary Info */}
                <div className="grid gap-6">
                  <FormField
                    control={form.control}
                    name="roomName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-foreground font-semibold">
                          Tên định danh phòng
                        </FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Hash className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                            <Input
                              {...field}
                              className="pl-9 font-medium text-base h-10"
                              placeholder="VD: P.101, VIP-01..."
                            />
                          </div>
                        </FormControl>
                        <FormDescription className="text-xs">
                          Tên hiển thị trên bảng điều khiển và hóa đơn.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <Separator className="bg-border/60" />

                {/* 2. Configuration Grid */}
                <div className="grid grid-cols-2 gap-6">
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
                          disabled={isLoadingTypes}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <div className="flex items-center gap-2">
                                <BedDouble className="h-4 w-4 text-muted-foreground" />
                                <SelectValue placeholder="Chọn loại phòng" />
                              </div>
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectGroup>
                              <SelectLabel>Danh sách loại phòng</SelectLabel>
                              {roomTypes?.map((type) => (
                                <SelectItem key={type.id} value={type.id}>
                                  <div className="flex flex-col items-start gap-0.5">
                                    <span className="font-medium">
                                      {type.name}
                                    </span>
                                    <span className="text-[10px] text-muted-foreground font-mono">
                                      CODE: {type.code}
                                    </span>
                                  </div>
                                </SelectItem>
                              ))}
                            </SelectGroup>
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
                    render={({ field }) => {
                      return (
                        <FormItem>
                          <FormLabel>Trạng thái hiện tại</FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            value={field.value}
                          >
                            <FormControl>
                              <SelectTrigger
                                className={cn("h-10 transition-colors")}
                              >
                                <div className="flex items-center gap-2">
                                  <span
                                    className={cn(
                                      "h-2.5 w-2.5 rounded-full shadow-sm"
                                    )}
                                  />
                                  <SelectValue placeholder="Chọn trạng thái" />
                                </div>
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {Object.entries(RoomStatusEnum).map(
                                ([key, value]) => {
                                  return (
                                    <SelectItem
                                      key={key}
                                      value={key}
                                      className="cursor-pointer"
                                    >
                                      <div className="flex items-center gap-2">
                                        <span
                                          className={cn("h-2 w-2 rounded-full")}
                                        />
                                        <span>{value}</span>
                                      </div>
                                    </SelectItem>
                                  );
                                }
                              )}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      );
                    }}
                  />
                </div>
              </div>

              {/* === FOOTER === */}
              <DialogFooter className="px-6 py-4 border-t bg-muted/20 gap-2 sm:gap-0">
                <div className="flex items-center gap-2 w-full sm:w-auto sm:mr-auto">
                  {/* Placeholder for future delete button if needed */}
                </div>

                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={handleClose}
                    disabled={isPending}
                    className="flex-1 sm:flex-none"
                  >
                    Hủy bỏ
                  </Button>
                  <Button
                    type="submit"
                    disabled={isPending || !form.formState.isDirty}
                    className="min-w-[120px] flex-1 sm:flex-none"
                  >
                    {isPending ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Đang lưu
                      </>
                    ) : (
                      <>
                        <Save className="w-4 h-4 mr-2" /> Lưu thay đổi
                      </>
                    )}
                  </Button>
                </div>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Cancel Confirmation Dialog */}
      <AlertDialog open={showCancelDialog} onOpenChange={setShowCancelDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-yellow-100 rounded-full text-yellow-600">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <AlertDialogTitle>Hủy thay đổi?</AlertDialogTitle>
            </div>
            <AlertDialogDescription>
              Bạn đã thực hiện một số thay đổi đối với phòng{" "}
              <strong>{room.roomName}</strong>. Nếu đóng ngay bây giờ, các thay
              đổi này sẽ bị mất.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Quay lại chỉnh sửa</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmClose}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Hủy bỏ thay đổi
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

export default UpdateRoomSheet;
