import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, type SubmitHandler } from "react-hook-form";
import type z from "zod";
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
  ROOM_MANAGEMENT_STATUS,
  ROOM_MANAGEMENT_STATUS_LABELS,
} from "~/lib/constants";
import type { RoomTypesListResponseDto } from "~/services/api/room-types/dto";
import useRoomTypesSchema from "~/services/schema/room-types.schema";
import useRoomSchema from "~/services/schema/room.schema";
import { useCreateRoom } from "../../container/useRoomMutation";

const { CreateRoomResponseSchema } = useRoomSchema();
const CreateRoomFormSchema = CreateRoomResponseSchema.pick({
  roomName: true,
  roomTypeId: true,
  status: true,
});

type CreateRoomFormData = z.infer<typeof CreateRoomFormSchema>;

interface CreateRoomDialogProps {
  open: boolean;
  onClose: () => void;
  roomTypes?: RoomTypesListResponseDto;
}

function CreateRoomDialog({ open, onClose, roomTypes }: CreateRoomDialogProps) {
  const form = useForm<CreateRoomFormData>({
    resolver: zodResolver(CreateRoomFormSchema),
    defaultValues: {
      roomName: "",
      roomTypeId: "",
      status: ROOM_MANAGEMENT_STATUS.Available.toString(),
    },
  });
  const { mutate, isPending } = useCreateRoom();

  const handleSubmit: SubmitHandler<CreateRoomFormData> = (data) => {
    mutate(data);
    form.reset();
  };

  const handleClose = () => {
    form.reset();
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Thêm phòng mới</DialogTitle>
          <DialogDescription>
            Điền thông tin chi tiết cho phòng mới. Tất cả các trường đều bắt
            buộc.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            className="space-y-4"
          >
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
                      defaultValue={field.value}
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
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Chọn trạng thái" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {Object.entries(ROOM_MANAGEMENT_STATUS).map(
                          ([key, value]) => (
                            <SelectItem key={value} value={value.toString()}>
                              {ROOM_MANAGEMENT_STATUS_LABELS[value]}
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
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={handleClose}
                disabled={isPending}
              >
                Hủy
              </Button>
              <Button type="submit" disabled={isPending}>
                {isPending ? "Đang thêm..." : "Thêm phòng"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

export default CreateRoomDialog;
