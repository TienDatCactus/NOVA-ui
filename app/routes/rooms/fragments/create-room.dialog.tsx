import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
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
import useRoomSchema from "~/services/schema/room.schema";

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
  onSubmit: (data: CreateRoomFormData) => void;
}

function CreateRoomDialog({ open, onClose, onSubmit }: CreateRoomDialogProps) {
  const form = useForm<CreateRoomFormData>({
    resolver: zodResolver(CreateRoomFormSchema),
    defaultValues: {
      roomName: "",
      roomTypeId: "",
      status: ROOM_MANAGEMENT_STATUS.Available.toString(),
    },
  });

  const handleSubmit = (data: CreateRoomFormData) => {
    onSubmit(data);
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

            {/* Room Type - From API */}
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
                      <SelectTrigger>
                        <SelectValue placeholder="Chọn loại phòng" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {roomTypes.map((type) => (
                        <SelectItem
                          key={type.roomTypeId}
                          value={type.roomTypeId}
                        >
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
                      <SelectTrigger>
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

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={handleClose}
                disabled={isLoading}
              >
                Hủy
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? "Đang thêm..." : "Thêm phòng"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

export default CreateRoomDialog;
