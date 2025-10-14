import { eachDayOfInterval } from "date-fns";
import { ChevronDown } from "lucide-react";
import { useEffect, useState } from "react";
import { useFieldArray, type UseFormReturn } from "react-hook-form";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "~/components/ui/collapsible";
import { Divider } from "~/components/ui/divider";
import { Form, FormField, FormItem } from "~/components/ui/form";
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
import useBookingSchema from "~/schema/booking.schema";
import { useCreateBookingStore } from "~/store/create-booking.store";
import { Combobox } from "../fragments/room-breakfast-combobox.fragment";
import RoomDataTable from "../fragments/room-data-table.fragment";
import type z from "zod";

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
    roomId: "3",
    roomName: "sieu nhan nigger",
    price: 2500000,
    roomType: "Chalet" as const,
    quantity: 1,
  },
];

function RoomSelectionForm({
  form,
}: {
  form: UseFormReturn<
    z.infer<ReturnType<typeof useBookingSchema>["BookingSchema"]>
  >;
}) {
  const [breakfast, setBreakfast] = useState(false);
  const [open, setOpen] = useState(false);
  const { formData, updateFormData, nextStep } = useCreateBookingStore();
  const { SelectedRoomSchema } = useBookingSchema();
  const dateRange =
    formData.customerInfo?.checkIn && formData.customerInfo?.checkOut
      ? eachDayOfInterval({
          start: formData.customerInfo.checkIn,
          end: formData.customerInfo.checkOut,
        })
      : [];

  const { fields, append, remove, update } = useFieldArray({
    control: form.control,
    name: "roomSelection.rooms",
  });

  const handleRoomSelect = (
    room: z.infer<typeof SelectedRoomSchema>,
    quantity = 1
  ) => {
    const index = fields.findIndex((f) => f.roomId === room.roomId);

    if (index === -1 && quantity > 0) {
      append({
        roomId: room.roomId,
        roomName: room.roomName,
        price: room.price,
        roomType: room.roomType,
        quantity: quantity,
      });

      const updatedFormData = form.getValues();
      updateFormData(updatedFormData);
      return;
    }

    if (index !== -1 && quantity > 0) {
      update(index, {
        roomId: room.roomId,
        roomName: room.roomName,
        price: room.price,
        roomType: room.roomType,
        quantity: quantity,
      });

      const updatedFormData = form.getValues();
      updateFormData(updatedFormData);
      return;
    }

    if (index !== -1 && quantity === 0) {
      remove(index);

      const updatedFormData = form.getValues();
      updateFormData(updatedFormData);
    }

    form.trigger("roomSelection.rooms");
  };

  useEffect(() => {
    const currentRooms = form.getValues("roomSelection.rooms");
    if (!currentRooms) {
      form.setValue("roomSelection.rooms", []);
    }
  }, [form]);

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
                onRoomSelect={handleRoomSelect}
                form={form}
                nextStep={nextStep}
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
                  {AVAILABLE_ROOMS.map((room) => {
                    const existingIndex = fields.findIndex(
                      (f) => f.roomId === room.roomId
                    );
                    const existingQuantity =
                      existingIndex !== -1
                        ? form.getValues(
                            `roomSelection.rooms.${existingIndex}.quantity`
                          )
                        : 0;
                    return (
                      <TableRow key={room.roomId}>
                        <TableCell>
                          <h1>{room.roomName}</h1>
                          <p className="text-sm text-muted-foreground">
                            {room.roomType}
                          </p>
                        </TableCell>
                        <TableCell className="text-right">
                          <data>${room.price.toFixed(2)}</data>
                        </TableCell>
                        <TableCell className="flex flex-col items-end justify-end">
                          <div className="w-16">
                            <Input
                              type="number"
                              min={0}
                              max={10}
                              value={
                                existingQuantity ||
                                formData.roomSelection?.rooms?.find(
                                  (r) => r.roomId === room.roomId
                                )?.quantity ||
                                0
                              }
                              onChange={(e) => {
                                const quantity = Number(e.target.value);
                                handleRoomSelect(
                                  { ...room, quantity },
                                  quantity
                                );
                              }}
                            />
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
              {form.formState.errors.roomSelection?.rooms && (
                <p className="text-destructive text-sm mt-2">
                  {form.formState.errors.roomSelection.rooms.message}
                </p>
              )}
            </div>
            <div className="md:col-span-1 col-span-1 flex h-full justify-center items-center gap-3 border-l pl-4">
              <div className="space-y-4">
                <div className="flex gap-2 items-center justify-center">
                  <Switch
                    id="breakfast"
                    checked={breakfast}
                    onCheckedChange={(checked) => {
                      setBreakfast(!breakfast);
                      if (!checked) {
                        form.setValue(
                          "roomSelection.selectedBreakfastDates",
                          []
                        );
                      }
                    }}
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
                        items={dateRange}
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
