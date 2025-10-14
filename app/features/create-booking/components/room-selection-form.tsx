import { eachDayOfInterval } from "date-fns";
import { ChevronDown } from "lucide-react";
import { useState } from "react";
import { useFieldArray, type UseFormReturn } from "react-hook-form";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "~/components/ui/collapsible";
import { Divider } from "~/components/ui/divider";
import { Form, FormControl, FormField, FormItem } from "~/components/ui/form";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { ScrollArea } from "~/components/ui/scroll-area";
import { Switch } from "~/components/ui/switch";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "~/components/ui/table";
import { useCreateBookingStore } from "~/store/create-booking.store";
import { Combobox } from "../fragments/room-breakfast-combobox.fragment";
import RoomDataTable from "../fragments/room-data-table.fragment";
import useBookingSchema from "~/schema/booking.schema";
import { toast } from "sonner";
import { set } from "zod";
const AVAILABLE_ROOMS = [
  {
    roomId: "1",
    roomName: "salam",
    price: 2500000,
    roomType: "Chalet" as const,
  },
  {
    roomId: "2",
    roomName: "nigga town",
    price: 2500000,
    roomType: "Chalet" as const,
  },
];

const SUGGESTED_ROOMS = [
  {
    roomId: "1",
    roomName: "salam",
    price: 2500000,
    roomType: "Chalet" as const,
    quantity: 1,
  },
];
function RoomSelectionForm({ form }: { form: UseFormReturn<any> }) {
  const [breakfast, setBreakfast] = useState(false);
  const [open, setOpen] = useState(false);
  const { updateFormData, formData } = useCreateBookingStore();
  const { RoomSelectionSchema, RoomSchema, SelectedRoomSchema } =
    useBookingSchema();
  const { fields, update } = useFieldArray({
    control: form.control,
    name: "roomSelection.rooms",
  });
  console.log(formData);
  if (
    !form.getValues("roomSelection.rooms") ||
    form.getValues("roomSelection.rooms").length === 0
  ) {
    form.setValue(
      "roomSelection.rooms",
      AVAILABLE_ROOMS.map((room) => ({ ...room, quantity: 0 }))
    );
  }
  const handleSelectSuggestedRoom = (suggestedRoom: {
    roomId: string;
    quantity: number;
    roomName: string;
  }) => {
    const roomIndex = fields.findIndex(
      (field) => (field as any).roomId === suggestedRoom.roomId
    );
    if (roomIndex !== -1) {
      const currentQuantity =
        form.getValues(`roomSelection.rooms.${roomIndex}.quantity`) || 0;
      form.setValue(
        `roomSelection.rooms.${roomIndex}.quantity`,
        currentQuantity + suggestedRoom.quantity
      );
      toast.success(
        `Đã thêm ${suggestedRoom.quantity} ${suggestedRoom.roomName} vào đơn đặt!`
      );
    }
  };

  return (
    <ScrollArea className="h-120 min-h-0">
      <Form {...form}>
        <div className="space-y-6 w-full">
          <Collapsible defaultOpen={true}>
            <CollapsibleTrigger>
              <p className="text-sm hover:underline">
                Gợi ý 1 phòng cho (1 người lớn)
              </p>
              <ChevronDown />
            </CollapsibleTrigger>
            <CollapsibleContent className="space-y-2 overflow-hidden">
              {/* suggested rooms */}
              <RoomDataTable
                rooms={SUGGESTED_ROOMS}
                onRoomSelect={handleSelectSuggestedRoom}
              />
            </CollapsibleContent>
          </Collapsible>
          <Divider weight="thin" className="mb-6" />
          <div className="grid grid-cols-2 md:grid-cols-4">
            <div className="md:col-span-3 col-span-1">
              <Table>
                <TableCaption> Lựa chọn phòng khác.</TableCaption>
                <TableHeader>
                  <TableRow>
                    <TableHead className="">Phòng</TableHead>
                    <TableHead className="text-right">Giá</TableHead>
                    <TableHead className="text-right">Số lượng</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {fields.map((field, index) => (
                    <TableRow key={field.id}>
                      <TableCell>
                        <h1>{AVAILABLE_ROOMS[index].roomName}</h1>
                        <p className="text-sm text-muted-foreground">
                          {AVAILABLE_ROOMS[index].roomType}
                        </p>
                      </TableCell>
                      <TableCell className="text-right">
                        <data>${AVAILABLE_ROOMS[index].price.toFixed(2)}</data>
                      </TableCell>
                      <TableCell className="flex flex-col items-end justify-end">
                        <div className="w-16">
                          {/* ✅ Đăng ký input với tên động */}
                          <Input
                            type="number"
                            min={0}
                            max={10}
                            {...form.register(
                              `roomSelection.rooms.${index}.quantity`,
                              { valueAsNumber: true }
                            )}
                          />
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
            <div className="md:col-span-1 col-span-1 flex h-full justify-center items-center gap-3 border-l pl-4">
              <div className="space-y-4">
                <div className="flex gap-2 items-center justify-center">
                  <Switch
                    id="breakfast"
                    checked={breakfast}
                    onCheckedChange={() => setBreakfast(!breakfast)}
                  />
                  <Label htmlFor="breakfast">Bữa sáng</Label>
                </div>
                <FormField
                  control={form.control}
                  name="roomSelection.selectedBreakfastDates"
                  render={({ field }) => (
                    <FormItem>
                      <Combobox
                        value={field.value ?? []}
                        onChange={field.onChange}
                        open={open}
                        onOpenChange={setOpen}
                        items={eachDayOfInterval({
                          start: formData.customerInfo?.checkIn!,
                          end: formData.customerInfo?.checkOut!,
                        })}
                        disabled={breakfast}
                      />
                    </FormItem>
                  )}
                />
              </div>
            </div>
          </div>
        </div>
      </Form>
    </ScrollArea>
  );
}

export default RoomSelectionForm;
