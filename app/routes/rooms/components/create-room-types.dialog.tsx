import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog";
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
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import useRoomTypesSchema from "~/services/schema/room-types.schema";
import type z from "zod";
import { useCreateRoomType } from "../container/room-types-mutation.hooks";

const { CreateRoomTypesResponseSchema } = useRoomTypesSchema();
const CreateRoomTypeFormSchema = CreateRoomTypesResponseSchema.pick({
  code: true,
  name: true,
  baseRate: true,
  active: true,
});

type CreateRoomTypeFormData = z.infer<typeof CreateRoomTypeFormSchema>;

interface CreateRoomTypeDialogProps {
  open: boolean;
  onClose: () => void;
}

export function CreateRoomTypeDialog({
  open,
  onClose,
}: CreateRoomTypeDialogProps) {
  const form = useForm<CreateRoomTypeFormData>({
    resolver: zodResolver(CreateRoomTypeFormSchema),
    defaultValues: {
      code: "",
      name: "",
      baseRate: 0,
      active: true,
    },
  });
  const { mutate, isPending } = useCreateRoomType();
  const handleSubmit = (data: CreateRoomTypeFormData) => {
    mutate(data);
    form.reset();
    onClose();
  };
  const handleClose = () => {
    form.reset();
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Thêm hạng phòng mới</DialogTitle>
          <DialogDescription>
            Nhập thông tin để tạo hạng phòng mới
          </DialogDescription>
        </DialogHeader>

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
                {isPending ? "Đang tạo..." : "Tạo hạng phòng"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
