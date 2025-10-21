import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
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
import { Button } from "~/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { Checkbox } from "~/components/ui/checkbox";
import { Label } from "~/components/ui/label";
import {
  ROOM_TYPE,
  ROOM_MANAGEMENT_STATUS,
  ROOM_MANAGEMENT_STATUS_LABELS,
} from "~/lib/constants";
import useRoomSchema from "~/services/schema/room.schema";

const { RoomStatusEnum } = useRoomSchema();

// Create Room Schema - All fields required
const CreateRoomSchema = z.object({
  roomName: z.string().min(1, "Tên phòng là bắt buộc"),
  roomTypeId: z.string().min(1, "Loại phòng là bắt buộc"),
  dailyPrice: z.coerce
    .number("Giá phòng là bắt buộc")
    .min(0, "Giá phòng phải >= 0"),
  status: z.coerce
    .number("Trạng thái là bắt buộc")
    .int()
    .min(0)
    .max(6, "Trạng thái không hợp lệ"),
  locked: z.boolean().default(false),
});

type CreateRoomFormData = z.infer<typeof CreateRoomSchema>;

interface CreateRoomDialogProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: CreateRoomFormData) => void;
  isLoading?: boolean;
}

function CreateRoomDialog({
  open,
  onClose,
  onSubmit,
  isLoading = false,
}: CreateRoomDialogProps) {
  const form = useForm<CreateRoomFormData>({
    // resolver: zodResolver(CreateRoomSchema),
    defaultValues: {
      roomName: "",
      roomTypeId: "",
      dailyPrice: 0,
      status: ROOM_MANAGEMENT_STATUS.Available,
      locked: false,
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

            {/* Room Type */}
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
                      {ROOM_TYPE.map((type) => (
                        <SelectItem key={type} value={type}>
                          {type}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Daily Price */}
            <FormField
              control={form.control}
              name="dailyPrice"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Giá phòng/đêm (VND){" "}
                    <span className="text-destructive">*</span>
                  </FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      placeholder="VD: 500000"
                      min={0}
                      step={10000}
                      {...field}
                    />
                  </FormControl>
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
                    onValueChange={(value) => field.onChange(Number(value))}
                    value={field.value?.toString()}
                  >
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

            {/* Locked */}
            <FormField
              control={form.control}
              name="locked"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel>Khóa phòng</FormLabel>
                    <p className="text-sm text-muted-foreground">
                      Phòng bị khóa sẽ không thể đặt được
                    </p>
                  </div>
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
