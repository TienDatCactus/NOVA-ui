import {
  Ban,
  Building2,
  Check,
  ChevronsUpDown,
  Globe,
  Mail,
  Phone,
  User,
  Users,
} from "lucide-react";
import { type UseFormReturn } from "react-hook-form";
import { Button } from "~/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "~/components/ui/command";
import {
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { Separator } from "~/components/ui/separator";
import { Counter } from "~/components/ui/shadcn-io/button-group/advanced/counter";
import { cn } from "~/lib/utils";
import { BOOKING_SOURCES } from "~/services/api/booking/booking.types";
import { useOTAInfo } from "../container/create-booking-query.hooks";

interface CustomerInfoSectionProps {
  form: UseFormReturn<any>;
}

export function CustomerInfoSection({ form }: CustomerInfoSectionProps) {
  const bookingType = form.watch("bookingType");
  const source = form.watch("source");

  const { data: otaList } = useOTAInfo({
    selection: bookingType === "OTA",
  });

  // --- HANDLERS ---
  const handleTypeChange = (val: string) => {
    form.setValue("bookingType", val);
    if (val === "RoomBlock") {
      form.setValue("source", "RoomBlock"); // Assuming key matches value for simplicity in example
      form.setValue("guestFullName", "");
    } else if (val === "OTA") {
      form.setValue("source", "OTA");
    } else {
      form.setValue("source", "DirectStaff"); // Default for Direct
    }
  };

  // Define styles for active states to give clear visual cues
  const getTypeStyles = (type: string) => {
    if (bookingType === type) {
      if (type === "OTA")
        return "bg-blue-600 text-white hover:bg-blue-700 border-blue-600";
      if (type === "RoomBlock")
        return "bg-destructive text-destructive-foreground hover:bg-destructive/90 border-destructive";
      return "bg-primary text-primary-foreground hover:bg-primary/90 border-primary";
    }
    return "bg-white hover:bg-gray-50 text-muted-foreground border-gray-200";
  };

  return (
    <div className="grid gap-6">
      {/* --- 1. BOOKING MODE SELECTOR (Segmented Control Style) --- */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { id: "Direct", icon: Building2, label: "Khách lẻ / Trực tiếp" },
          { id: "OTA", icon: Globe, label: "Kênh OTA" },
          { id: "RoomBlock", icon: Ban, label: "Khóa phòng / Bảo trì" },
        ].map((type) => (
          <div
            key={type.id}
            onClick={() => handleTypeChange(type.id)}
            className={cn(
              "cursor-pointer rounded-lg border px-4 py-3 text-center transition-all duration-200 flex flex-col items-center justify-center gap-2 shadow-sm",
              getTypeStyles(type.id)
            )}
          >
            <type.icon className="h-5 w-5" />
            <span className="text-sm font-semibold">{type.label}</span>
          </div>
        ))}
      </div>

      {/* --- 2. MAIN FORM CONTAINER --- */}
      <div className="rounded-xl border bg-card shadow-sm">
        {/* A. SOURCE & CONTEXT HEADER */}
        <div className="border-b bg-muted/30 p-4">
          <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3">
            Nguồn & Thông tin đặt phòng
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Direct Source Selector */}
            {bookingType === "Direct" && (
              <FormField
                control={form.control}
                name="source"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs">Nguồn khách</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger className="bg-white h-9">
                          <SelectValue placeholder="Chọn nguồn" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {BOOKING_SOURCES.filter(
                          (s) => s.key !== "OTA" && s.key !== "RoomBlock"
                        ).map((bs) => (
                          <SelectItem value={bs.key} key={bs.key}>
                            {bs.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            {/* OTA Source Selector */}
            {bookingType === "OTA" && (
              <>
                <FormField
                  control={form.control}
                  name="otaInformationId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs">Kênh OTA</FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant="outline"
                              role="combobox"
                              className={cn(
                                "w-full justify-between bg-white h-9 px-3 font-normal",
                                !field.value && "text-muted-foreground"
                              )}
                            >
                              {field.value
                                ? otaList?.find((ota) => ota.id === field.value)
                                    ?.name
                                : "Chọn kênh"}
                              <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-[250px] p-0" align="start">
                          <Command>
                            <CommandInput placeholder="Tìm OTA..." />
                            <CommandList>
                              <CommandEmpty>Không tìm thấy.</CommandEmpty>
                              <CommandGroup>
                                {otaList?.map((ota) => (
                                  <CommandItem
                                    value={ota.name}
                                    key={ota.id}
                                    onSelect={() => {
                                      form.setValue("otaInformationId", ota.id);
                                    }}
                                  >
                                    <Check
                                      className={cn(
                                        "mr-2 h-4 w-4",
                                        ota.id === field.value
                                          ? "opacity-100"
                                          : "opacity-0"
                                      )}
                                    />
                                    {ota.name}
                                  </CommandItem>
                                ))}
                              </CommandGroup>
                            </CommandList>
                          </Command>
                        </PopoverContent>
                      </Popover>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="otaBookingCode"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs">Mã Booking OTA</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          placeholder="#123456789"
                          className="bg-white h-9 font-mono"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </>
            )}

            {/* Agency Code (Conditional) */}
            {source === "Agency" && bookingType === "Direct" && (
              <FormField
                control={form.control}
                name="otaBookingCode" // Reusing field for agency code? Or separate field
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs">
                      Mã Voucher / Đại lý
                    </FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        placeholder="Nhập mã..."
                        className="bg-white h-9"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}
          </div>
        </div>

        {/* B. GUEST DETAILS */}
        <div className="p-4">
          <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3 flex items-center gap-2">
            <User className="h-4 w-4" />
            Thông tin khách hàng
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Full Name - Full Width on Mobile, 1/2 on Desktop */}
            <div className="md:col-span-2">
              <FormField
                control={form.control}
                name="guestFullName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs">
                      {bookingType === "RoomBlock"
                        ? "Lý do khóa phòng"
                        : "Họ và tên khách đại diện"}{" "}
                      <span className="text-destructive">*</span>
                    </FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        placeholder={
                          bookingType === "RoomBlock"
                            ? "VD: Bảo trì máy lạnh, Sơn tường..."
                            : "VD: Nguyễn Văn A"
                        }
                        className="bg-white h-10 text-base" // Slightly larger for main input
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Contact Info (Hidden for RoomBlock) */}
            {bookingType !== "RoomBlock" && (
              <>
                <FormField
                  control={form.control}
                  name="guestPhone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs">Số điện thoại</FormLabel>
                      <div className="relative">
                        <Phone className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                        <FormControl>
                          <Input
                            {...field}
                            placeholder="09..."
                            className="bg-white pl-9 h-9"
                          />
                        </FormControl>
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="guestEmail"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs">Email</FormLabel>
                      <div className="relative">
                        <Mail className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                        <FormControl>
                          <Input
                            {...field}
                            placeholder="example@gmail.com"
                            className="bg-white pl-9 h-9"
                          />
                        </FormControl>
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </>
            )}
          </div>
        </div>

        <Separator />

        {/* C. OCCUPANCY */}
        <div className="p-4 bg-gray-50/50">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
              <Users className="h-4 w-4" />
              Số lượng khách
            </h3>
          </div>

          <div className="flex gap-6">
            <FormField
              control={form.control}
              name="adultsAmount"
              render={({ field }) => (
                <FormItem className="flex-1">
                  <div className="flex justify-between mb-1.5">
                    <FormLabel className="text-xs font-medium text-gray-700">
                      Người lớn
                    </FormLabel>
                  </div>
                  <FormControl>
                    <Counter
                      {...field}
                      minValue={1}
                      maxValue={50}
                      className="w-full bg-white h-9 border-gray-200"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="childrenAmount"
              render={({ field }) => (
                <FormItem className="flex-1">
                  <div className="flex justify-between mb-1.5">
                    <FormLabel className="text-xs font-medium text-gray-700">
                      Trẻ em
                    </FormLabel>
                  </div>
                  <FormControl>
                    <Counter
                      {...field}
                      minValue={0}
                      maxValue={20}
                      className="w-full bg-white h-9 border-gray-200"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
