import { zodResolver } from "@hookform/resolvers/zod";
import { format } from "date-fns";
import { FileUp, Loader2, Scan } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";
import { Textarea } from "~/components/ui/textarea";
import {
  useScanNationalIdMutation,
  useScanPassportMutation,
  useSaveNationalIdMutation,
  useSavePassportMutation,
} from "../container/container";

const PassportFormSchema = z.object({
  bookingId: z.string(),
  customerId: z.string(),
  name: z.string().min(1, "Vui lòng nhập họ tên"),
  passportNumber: z.string().min(1, "Vui lòng nhập số passport"),
  dateOfBirth: z.string().min(1, "Vui lòng nhập ngày sinh"),
  nationality: z.string().min(1, "Vui lòng nhập quốc tịch"),
  placeOfBirth: z.string(),
  sex: z.string().min(1, "Vui lòng chọn giới tính"),
  idNumber: z.string(),
  dateOfIssue: z.string(),
  dateOfExpiry: z.string(),
  scannedImageUrl: z.string(),
  note: z.string(),
});

// National ID Form Schema
const NationalIdFormSchema = z.object({
  bookingId: z.string(),
  customerId: z.string(),
  name: z.string().min(1, "Vui lòng nhập họ tên"),
  idNumber: z.string().min(1, "Vui lòng nhập số CMND/CCCD"),
  dateOfBirth: z.string().min(1, "Vui lòng nhập ngày sinh"),
  sex: z.string().min(1, "Vui lòng chọn giới tính"),
  home: z.string(),
  address: z.string(),
  scannedImageUrl: z.string(),
  note: z.string(),
});

type PassportFormData = z.infer<typeof PassportFormSchema>;
type NationalIdFormData = z.infer<typeof NationalIdFormSchema>;

interface DocumentScanDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  bookingId: string;
  customerId: string;
  onSuccess?: () => void;
}

export default function DocumentScanDialog({
  open,
  onOpenChange,
  bookingId,
  customerId,
  onSuccess,
}: DocumentScanDialogProps) {
  const [activeTab, setActiveTab] = useState<"passport" | "national-id">(
    "passport"
  );
  const [isScanning, setIsScanning] = useState(false);
  const [scannedImage, setScannedImage] = useState<string | null>(null);

  // Mutations
  const scanPassportMutation = useScanPassportMutation();
  const scanNationalIdMutation = useScanNationalIdMutation();
  const savePassportMutation = useSavePassportMutation();
  const saveNationalIdMutation = useSaveNationalIdMutation();

  // Forms
  const passportForm = useForm<PassportFormData>({
    resolver: zodResolver(PassportFormSchema),
    defaultValues: {
      bookingId,
      customerId,
      name: "",
      passportNumber: "",
      dateOfBirth: "",
      nationality: "",
      placeOfBirth: "",
      sex: "",
      idNumber: "",
      dateOfIssue: "",
      dateOfExpiry: "",
      scannedImageUrl: "",
      note: "",
    },
  });

  const nationalIdForm = useForm<NationalIdFormData>({
    resolver: zodResolver(NationalIdFormSchema),
    defaultValues: {
      bookingId,
      customerId,
      name: "",
      idNumber: "",
      dateOfBirth: "",
      sex: "",
      home: "",
      address: "",
      scannedImageUrl: "",
      note: "",
    },
  });

  const handleImageUpload = async (file: File) => {
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      toast.error("Vui lòng chọn file ảnh");
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error("File ảnh không được vượt quá 5MB");
      return;
    }

    setIsScanning(true);

    try {
      // Preview image
      const reader = new FileReader();
      reader.onloadend = () => {
        setScannedImage(reader.result as string);
      };
      reader.readAsDataURL(file);

      // Scan document
      if (activeTab === "passport") {
        const result = await scanPassportMutation.mutateAsync(file);

        passportForm.setValue("name", result.name || "");
        passportForm.setValue("passportNumber", result.passportNumber || "");
        passportForm.setValue("dateOfBirth", result.dateOfBirth || "");
        passportForm.setValue("nationality", result.nationality || "");
        passportForm.setValue("placeOfBirth", result.placeOfBirth || "");
        passportForm.setValue("sex", result.sex || "");
        passportForm.setValue("idNumber", result.idNumber || "");
        passportForm.setValue("dateOfIssue", result.dateOfIssue || "");
        passportForm.setValue("dateOfExpiry", result.dateOfExpiry || "");
        passportForm.setValue("scannedImageUrl", result.scannedImageUrl || "");

        toast.success("Đã quét passport thành công");
      } else {
        const result = await scanNationalIdMutation.mutateAsync(file);

        nationalIdForm.setValue("name", result.name || "");
        nationalIdForm.setValue("idNumber", result.idNumber || "");
        nationalIdForm.setValue("dateOfBirth", result.dateOfBirth || "");
        nationalIdForm.setValue("sex", result.sex || "");
        nationalIdForm.setValue("home", result.home || "");
        nationalIdForm.setValue("address", result.address || "");
        nationalIdForm.setValue(
          "scannedImageUrl",
          result.scannedImageUrl || ""
        );

        toast.success("Đã quét CMND/CCCD thành công");
      }
    } catch (error) {
      toast.error("Quét giấy tờ thất bại. Vui lòng thử lại hoặc nhập thủ công");
      console.error(error);
    } finally {
      setIsScanning(false);
    }
  };

  const handlePassportSubmit = async (data: PassportFormData) => {
    try {
      await savePassportMutation.mutateAsync(data);
      toast.success("Đã lưu thông tin passport thành công");
      onSuccess?.();
      onOpenChange(false);
      passportForm.reset();
      setScannedImage(null);
    } catch (error) {
      toast.error("Lưu thông tin thất bại");
    }
  };

  const handleNationalIdSubmit = async (data: NationalIdFormData) => {
    try {
      await saveNationalIdMutation.mutateAsync(data);
      toast.success("Đã lưu thông tin CMND/CCCD thành công");
      onSuccess?.();
      onOpenChange(false);
      nationalIdForm.reset();
      setScannedImage(null);
    } catch (error) {
      toast.error("Lưu thông tin thất bại");
    }
  };

  const handleClose = () => {
    onOpenChange(false);
    passportForm.reset();
    nationalIdForm.reset();
    setScannedImage(null);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Thêm giấy tờ tùy thân</DialogTitle>
          <DialogDescription>
            Chụp/tải ảnh giấy tờ để tự động điền thông tin hoặc nhập thủ công
          </DialogDescription>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="passport">Passport</TabsTrigger>
            <TabsTrigger value="national-id">CMND/CCCD</TabsTrigger>
          </TabsList>

          {/* Passport Tab */}
          <TabsContent value="passport" className="space-y-4">
            {/* Image Upload Section */}
            <div className="border-2 border-dashed rounded-lg p-6 bg-muted/10">
              <div className="flex flex-col items-center gap-4">
                {scannedImage && activeTab === "passport" ? (
                  <div className="w-full max-w-md">
                    <img
                      src={scannedImage}
                      alt="Scanned passport"
                      className="w-full h-auto rounded-lg border"
                    />
                  </div>
                ) : (
                  <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center">
                    <Scan className="w-10 h-10 text-muted-foreground" />
                  </div>
                )}

                <div className="text-center">
                  <h4 className="font-medium mb-1">
                    Tải ảnh Passport để tự động điền
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    PNG, JPG tối đa 5MB
                  </p>
                </div>

                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    disabled={isScanning}
                    onClick={() => {
                      const input = document.createElement("input");
                      input.type = "file";
                      input.accept = "image/*";
                      input.onchange = (e) => {
                        const file = (e.target as HTMLInputElement).files?.[0];
                        if (file) handleImageUpload(file);
                      };
                      input.click();
                    }}
                  >
                    <FileUp className="w-4 h-4 mr-2" />
                    Tải ảnh lên
                  </Button>
                </div>

                {isScanning && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Đang quét và trích xuất thông tin...
                  </div>
                )}
              </div>
            </div>

            {/* Passport Form */}
            <Form {...passportForm}>
              <form
                onSubmit={passportForm.handleSubmit(handlePassportSubmit)}
                className="space-y-4"
              >
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={passportForm.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Họ và tên *</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="Nguyễn Văn A" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={passportForm.control}
                    name="passportNumber"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Số Passport *</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="A12345678" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={passportForm.control}
                    name="dateOfBirth"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Ngày sinh *</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            type="date"
                            max={format(new Date(), "yyyy-MM-dd")}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={passportForm.control}
                    name="sex"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Giới tính *</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          value={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Chọn giới tính" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="NAM">Nam</SelectItem>
                            <SelectItem value="NU">Nữ</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={passportForm.control}
                    name="nationality"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Quốc tịch *</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="Vietnam" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={passportForm.control}
                    name="placeOfBirth"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nơi sinh</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="Hà Nội" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={passportForm.control}
                    name="dateOfIssue"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Ngày cấp</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            type="date"
                            max={format(new Date(), "yyyy-MM-dd")}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={passportForm.control}
                    name="dateOfExpiry"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Ngày hết hạn</FormLabel>
                        <FormControl>
                          <Input {...field} type="date" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={passportForm.control}
                  name="note"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Ghi chú</FormLabel>
                      <FormControl>
                        <Textarea
                          {...field}
                          placeholder="Thông tin bổ sung..."
                          rows={3}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <DialogFooter>
                  <Button type="button" variant="outline" onClick={handleClose}>
                    Hủy
                  </Button>
                  <Button
                    type="submit"
                    disabled={savePassportMutation.isPending}
                  >
                    {savePassportMutation.isPending ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Đang lưu...
                      </>
                    ) : (
                      "Lưu thông tin"
                    )}
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </TabsContent>

          {/* National ID Tab */}
          <TabsContent value="national-id" className="space-y-4">
            {/* Image Upload Section */}
            <div className="border-2 border-dashed rounded-lg p-6 bg-muted/10">
              <div className="flex flex-col items-center gap-4">
                {scannedImage && activeTab === "national-id" ? (
                  <div className="w-full max-w-md">
                    <img
                      src={scannedImage}
                      alt="Scanned ID"
                      className="w-full h-auto rounded-lg border"
                    />
                  </div>
                ) : (
                  <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center">
                    <Scan className="w-10 h-10 text-muted-foreground" />
                  </div>
                )}

                <div className="text-center">
                  <h4 className="font-medium mb-1">
                    Tải ảnh CMND/CCCD để tự động điền
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    PNG, JPG tối đa 5MB
                  </p>
                </div>

                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    disabled={isScanning}
                    onClick={() => {
                      const input = document.createElement("input");
                      input.type = "file";
                      input.accept = "image/*";
                      input.onchange = (e) => {
                        const file = (e.target as HTMLInputElement).files?.[0];
                        if (file) handleImageUpload(file);
                      };
                      input.click();
                    }}
                  >
                    <FileUp className="w-4 h-4 mr-2" />
                    Tải ảnh lên
                  </Button>
                </div>

                {isScanning && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Đang quét và trích xuất thông tin...
                  </div>
                )}
              </div>
            </div>

            {/* National ID Form */}
            <Form {...nationalIdForm}>
              <form
                onSubmit={nationalIdForm.handleSubmit(handleNationalIdSubmit)}
                className="space-y-4"
              >
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={nationalIdForm.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Họ và tên *</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="Nguyễn Văn A" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={nationalIdForm.control}
                    name="idNumber"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Số CMND/CCCD *</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="001234567890" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={nationalIdForm.control}
                    name="dateOfBirth"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Ngày sinh *</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            type="date"
                            max={format(new Date(), "yyyy-MM-dd")}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={nationalIdForm.control}
                    name="sex"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Giới tính *</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          value={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Chọn giới tính" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="NAM">Nam</SelectItem>
                            <SelectItem value="NU">Nữ</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={nationalIdForm.control}
                    name="home"
                    render={({ field }) => (
                      <FormItem className="col-span-2">
                        <FormLabel>Quê quán</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            placeholder="Xã/Phường, Quận/Huyện, Tỉnh/TP"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={nationalIdForm.control}
                    name="address"
                    render={({ field }) => (
                      <FormItem className="col-span-2">
                        <FormLabel>Địa chỉ thường trú</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            placeholder="Số nhà, Đường, Phường/Xã, Quận/Huyện, Tỉnh/TP"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={nationalIdForm.control}
                  name="note"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Ghi chú</FormLabel>
                      <FormControl>
                        <Textarea
                          {...field}
                          placeholder="Thông tin bổ sung..."
                          rows={3}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <DialogFooter>
                  <Button type="button" variant="outline" onClick={handleClose}>
                    Hủy
                  </Button>
                  <Button
                    type="submit"
                    disabled={saveNationalIdMutation.isPending}
                  >
                    {saveNationalIdMutation.isPending ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Đang lưu...
                      </>
                    ) : (
                      "Lưu thông tin"
                    )}
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
