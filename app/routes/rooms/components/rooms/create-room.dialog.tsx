import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, type SubmitHandler } from "react-hook-form";
import type z from "zod";
import { BedDouble, Hash, Plus, X, Loader2, Activity } from "lucide-react";

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
  FormDescription,
} from "~/components/ui/form";
import { Input } from "~/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  SelectGroup,
  SelectLabel,
} from "~/components/ui/select";
import { Separator } from "~/components/ui/separator";

import { RoomSchema } from "~/services/api/rooms/room.schema";
import { RoomStatusEnum } from "~/services/api/rooms/room.types";
import { useCreateRoom } from "../../container/rooms/mutation.hooks";
import { useRoomTypes } from "../../container/room-types/query.hooks";
import { cn } from "~/lib/utils";
import { ROOM_STATUS_CONFIG } from "../../fragments/rooms/status.cell";

const { CreateRoomRequestSchema } = RoomSchema;

type CreateRoomFormData = z.infer<typeof CreateRoomRequestSchema>;

interface CreateRoomDialogProps {
  open: boolean;
  onClose: () => void;
}

function CreateRoomDialog({ open, onClose }: CreateRoomDialogProps) {
  const { data: roomTypes, isLoading: isLoadingTypes } = useRoomTypes();
  const { mutate, isPending } = useCreateRoom();

  const form = useForm<CreateRoomFormData>({
    resolver: zodResolver(CreateRoomRequestSchema),
    defaultValues: {
      roomName: "",
      roomTypeId: "",
      status: "Ready", // Smart default
    },
  });

  const handleSubmit: SubmitHandler<CreateRoomFormData> = (data) => {
    mutate(data, {
      onSuccess: () => {
        form.reset();
        onClose();
      },
    });
  };

  const handleClose = () => {
    form.reset();
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px] p-0 gap-0 overflow-hidden">
        {/* === HEADER === */}
        <DialogHeader className="px-6 py-5 border-b bg-muted/30">
          <DialogTitle className="text-xl flex items-center gap-2.5">
            Thêm phòng mới
          </DialogTitle>
          <DialogDescription>
            Tạo mới phòng vào hệ thống quản lý.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            className="flex flex-col"
          >
            {/* === BODY === */}
            <div className="p-6 space-y-6">
              {/* Room Name Input */}
              <FormField
                control={form.control}
                name="roomName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-foreground font-semibold">
                      Tên / Số phòng
                    </FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Hash className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input
                          placeholder="VD: 101, 202, VIP-A..."
                          className="pl-9 font-medium"
                          {...field}
                        />
                      </div>
                    </FormControl>
                    <FormDescription className="text-xs">
                      Mã định danh phòng phải là duy nhất.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Separator className="bg-border/60" />

              <div className="grid grid-cols-2 gap-5">
                {/* Room Type Select */}
                <FormField
                  control={form.control}
                  name="roomTypeId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Loại phòng</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                        disabled={isLoadingTypes}
                      >
                        <FormControl>
                          <SelectTrigger className="h-10">
                            <div className="flex items-center gap-2">
                              <BedDouble className="h-4 w-4 text-muted-foreground" />
                              <SelectValue placeholder="Chọn loại" />
                            </div>
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectGroup>
                            <SelectLabel>Danh mục</SelectLabel>
                            {roomTypes?.map((type) => (
                              <SelectItem key={type.id} value={type.id}>
                                <div className="flex flex-col items-start gap-0.5">
                                  <span className="font-medium">
                                    {type.name}
                                  </span>
                                  <span className="text-[10px] text-muted-foreground font-mono">
                                    {type.code}
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

                {/* Status Select */}
                <FormField
                  control={form.control}
                  name="status"
                  render={({ field }) => {
                    return (
                      <FormItem>
                        <FormLabel>Trạng thái đầu</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger
                              className={cn("h-10 transition-colors")}
                            >
                              <div className="flex items-center">
                                <Activity className={cn("h-4 w-4")} />
                                <SelectValue placeholder="Chọn trạng thái" />
                              </div>
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {Object.entries(ROOM_STATUS_CONFIG).map(
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
                                      <span>{value.label}</span>
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
            <DialogFooter className="px-6 py-4 border-t bg-muted/20">
              <div className="flex items-center gap-2 w-full justify-end">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={handleClose}
                  disabled={isPending}
                >
                  Hủy bỏ
                </Button>
                <Button
                  type="submit"
                  disabled={isPending}
                  className="min-w-[120px]"
                >
                  {isPending ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Đang tạo...
                    </>
                  ) : (
                    <>
                      <Plus className="w-4 h-4 mr-2" /> Tạo phòng
                    </>
                  )}
                </Button>
              </div>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

export default CreateRoomDialog;
