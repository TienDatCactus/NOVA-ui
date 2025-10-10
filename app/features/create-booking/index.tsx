import { zodResolver } from "@hookform/resolvers/zod";
import { format } from "date-fns";
import { CalendarIcon, ChevronDown } from "lucide-react";
import { useState } from "react";
import { vi } from "react-day-picker/locale";
import { useForm } from "react-hook-form";
import type z from "zod";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import { Calendar } from "~/components/ui/calendar";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog";
import { Divider } from "~/components/ui/divider";
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
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "~/components/ui/popover";
import ProgressSteps from "~/components/ui/progress-step";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { Counter } from "~/components/ui/shadcn-io/counter";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "~/components/ui/table";
import { BOOKING_CHANNEL, ROOM_TYPE } from "~/lib/constants";
import { cn } from "~/lib/utils";
import useBookingSchema from "~/schema/booking.schema";
import { useCreateBookingStore } from "~/store/create-booking.store";
import RoomDataTable from "./fragments/room-data-table.fragment";
import { ScrollArea } from "~/components/ui/scroll-area";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "~/components/ui/collapsible";
import { Checkbox } from "~/components/ui/checkbox";
import { Label } from "~/components/ui/label";
import { Switch } from "~/components/ui/switch";
import { Combobox } from "./fragments/room-breakfast-combobox.fragment";

interface CreateBookingDialogProps {
  close?: () => void;
  open?: boolean;
}
const { CustomerBookingInfoSchema } = useBookingSchema();
function CustomerInfoForm() {
  const [contact, setContact] = useState<"email" | "phone" | "none">("none");
  const form = useForm<z.infer<typeof CustomerBookingInfoSchema>>({
    resolver: zodResolver(CustomerBookingInfoSchema),
    defaultValues: {
      fullName: "",
      phoneNumber: "",
      email: "",
      bookingChannel: "Direct",
      bookingCode: "",
      adults: 0,
      children: 0,
      checkIn: new Date(),
      checkOut: new Date(),
    },
  });
  function onSubmit(values: z.infer<typeof CustomerBookingInfoSchema>) {
    console.log(values);
  }

  return (
    <>
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="space-y-6 w-3xl max-w-full "
        >
          <div className="grid grid-cols-1 gap-2">
            <FormField
              control={form.control}
              name="fullName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Họ và Tên</FormLabel>
                  <FormControl>
                    <Input className="" placeholder="Nguyễn Văn A" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <div
            className={cn("grid grid-cols-1 gap-2", {
              "grid-cols-3": contact !== "none",
            })}
          >
            <FormItem>
              <FormLabel>Phương thức liên lạc</FormLabel>
              <Select
                value={contact}
                onValueChange={(value) =>
                  setContact(value as "email" | "phone" | "none")
                }
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Chọn phương thức liên lạc" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectLabel>Phương thức liên lạc</SelectLabel>
                    <SelectItem value="none">Không xác định</SelectItem>
                    <SelectItem value="phone">Số điện thoại</SelectItem>
                    <SelectItem value="email">Email</SelectItem>
                  </SelectGroup>
                </SelectContent>
              </Select>
            </FormItem>
            {contact !== "none" && (
              <FormField
                control={form.control}
                name={contact === "phone" ? "phoneNumber" : "email"}
                render={({ field }) => (
                  <FormItem className="col-span-2">
                    <FormLabel>
                      {contact === "phone" ? "Số Điện Thoại" : "Email"}
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder={
                          contact === "phone"
                            ? "0123456789"
                            : "example@email.com"
                        }
                        type={contact === "phone" ? "tel" : "email"}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}
          </div>

          <div className="grid grid-cols-4 gap-2">
            <FormField
              control={form.control}
              name="adults"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Số lượng người lớn</FormLabel>
                  <FormControl>
                    <Counter
                      number={field.value}
                      setNumber={(value) => field.onChange(value)}
                      max={20}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="children"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Trẻ em ( &lt; 3 tuổi)</FormLabel>
                  <FormControl>
                    <Counter
                      number={field.value ? field.value : 0}
                      setNumber={(value) => field.onChange(value)}
                      max={20}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="bookingChannel"
              render={({ field }) => (
                <FormItem className="col-span-2">
                  <FormLabel>Kênh Đặt Phòng</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Chọn kênh đặt phòng" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {BOOKING_CHANNEL.map((channel) => (
                        <SelectItem key={channel} value={channel}>
                          {channel}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="checkIn"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Ngày Nhận Phòng</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant={"outline"}
                          className={cn(
                            "w-full pl-3 text-left font-normal",
                            !field.value && "text-muted-foreground"
                          )}
                        >
                          {field.value ? (
                            format(field.value, "PPP")
                          ) : (
                            <span>Chọn ngày</span>
                          )}
                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={field.value}
                        onSelect={field.onChange}
                        disabled={(date) => date < new Date()}
                      />
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="checkOut"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Ngày Trả Phòng</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant={"outline"}
                          className={cn(
                            "w-full pl-3 text-left font-normal",
                            !field.value && "text-muted-foreground"
                          )}
                        >
                          {field.value ? (
                            format(field.value, "PPP")
                          ) : (
                            <span>Chọn ngày</span>
                          )}
                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={field.value}
                        onSelect={field.onChange}
                        disabled={(date) => date < new Date()}
                        locale={vi}
                      />
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </form>
      </Form>
      <DialogFooter>
        <div className="flex gap-2 items-center">
          <Button
            variant="destructive"
            type="reset"
            onClick={() => form.reset()}
          >
            Xóa
          </Button>
          <Button type="submit" onClick={() => form.handleSubmit(onSubmit)()}>
            Tiếp theo
          </Button>
        </div>
      </DialogFooter>
    </>
  );
}

function RoomSelectionForm({ ...props }) {
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState<string[] | undefined>([]);
  const [breakfast, setBreakfast] = useState(false);
  const onValueChange = (values: string[]) => setValue(values);
  console.log(breakfast);
  return (
    <ScrollArea className="max-h-[60vh] pr-2">
      <div className="w-5xl space-y-6 max-w-full">
        <Collapsible defaultOpen={true}>
          <CollapsibleTrigger>
            <p className="text-sm hover:underline">
              Gợi ý 1 phòng cho (1 người lớn)
            </p>
            <ChevronDown />
          </CollapsibleTrigger>
          <CollapsibleContent className="space-y-2">
            <RoomDataTable />
          </CollapsibleContent>
        </Collapsible>
        <Divider weight="thin" className="mb-6" />
        <div className="grid  grid-cols-1 md:grid-cols-4">
          <div className="col-span-3">
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
                <TableRow key={"1"}>
                  <TableCell>
                    <h1>U no reverse</h1>
                    <p className="text-sm text-muted-foreground">
                      Phòng Deluxe Giường Đôi
                    </p>
                  </TableCell>
                  <TableCell className="text-right">
                    <data>$2,500.00</data>
                  </TableCell>
                  <TableCell className="flex flex-col items-end justify-end">
                    <div className="w-16">
                      <Input type="number" defaultValue={0} min={0} max={13} />
                    </div>
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </div>
          <div>
            <div className="flex h-full justify-center items-center gap-3 border-l pl-4">
              <div className="space-y-4">
                <div className="flex gap-2 items-center justify-center">
                  <Switch
                    onCheckedChange={() => setBreakfast(!breakfast)}
                    id="breakfast"
                  />
                  <Label htmlFor="breakfast">Bữa sáng</Label>
                </div>
                <Combobox
                  onChange={onValueChange}
                  value={value ?? []}
                  open={open}
                  onOpenChange={setOpen}
                  disabled={breakfast}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
      <DialogFooter>
        <div className="flex gap-2 items-center">
          <Button variant="outline">Quay lại</Button>
          <Button>Xác nhận</Button>
        </div>
      </DialogFooter>
    </ScrollArea>
  );
}

const StepComponents = [<CustomerInfoForm />, <RoomSelectionForm />];
export default function CreateBookingDialog({
  close,
  open = false,
  ...props
}: CreateBookingDialogProps) {
  const steps = ["Thông tin khách hàng", "Chọn phòng", "Xác nhận đặt phòng"];
  const { currentStep, nextStep, prevStep } = useCreateBookingStore();
  return (
    <Dialog open={open} onOpenChange={close}>
      <DialogContent className="w-auto max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-4">
            {steps[currentStep - 1]}
          </DialogTitle>
          <DialogDescription>
            <ProgressSteps
              controlled={true}
              totalSteps={steps.length}
              steps={steps}
              currentStep={currentStep}
              nextStep={nextStep}
              prevStep={prevStep}
            />
          </DialogDescription>
        </DialogHeader>
        {StepComponents[currentStep - 1]}
      </DialogContent>
    </Dialog>
  );
}
