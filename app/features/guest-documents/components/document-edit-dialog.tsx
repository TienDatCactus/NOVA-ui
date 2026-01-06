import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { useEffect } from "react";
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
import { Textarea } from "~/components/ui/textarea";
import type { BookingDocumentItemDto } from "~/services/api/guest-documents/dto";
import { useUpdateDocumentMutation } from "../container/container";

const EditDocumentFormSchema = z.object({
  fullName: z.string().min(1, "Vui lòng nhập họ tên"),
  documentNumber: z.string().min(1, "Vui lòng nhập số giấy tờ"),
  dateOfBirth: z.string().min(1, "Vui lòng nhập ngày sinh"),
  nationality: z.string(),
  placeOfBirth: z.string(),
  gender: z.string().min(1, "Vui lòng chọn giới tính"),
  address: z.string(),
  dateOfIssue: z.string(),
  dateOfExpire: z.string(),
  idCardNumber: z.string(),
  note: z.string(),
});

type EditDocumentFormData = z.infer<typeof EditDocumentFormSchema>;

interface DocumentEditDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  document: BookingDocumentItemDto | null;
  onSuccess?: () => void;
}

export default function DocumentEditDialog({
  open,
  onOpenChange,
  document,
  onSuccess,
}: DocumentEditDialogProps) {
  const updateMutation = useUpdateDocumentMutation();

  const form = useForm<EditDocumentFormData>({
    resolver: zodResolver(EditDocumentFormSchema),
    defaultValues: {
      fullName: "",
      documentNumber: "",
      dateOfBirth: "",
      nationality: "",
      placeOfBirth: "",
      gender: "",
      address: "",
      dateOfIssue: "",
      dateOfExpire: "",
      idCardNumber: "",
      note: "",
    },
  });

  // Reset form when document changes
  useEffect(() => {
    if (document) {
      form.reset({
        fullName: document.fullName || "",
        documentNumber: document.documentNumber || "",
        dateOfBirth: document.dateOfBirth || "",
        nationality: document.nationality || "",
        placeOfBirth: document.placeOfBirth || "",
        gender: document.gender || "",
        address: document.address || "",
        dateOfIssue: document.dateOfIssue || "",
        dateOfExpire: document.dateOfExpire || "",
        idCardNumber: document.idCardNumber || "",
        note: document.note || "",
      });
    }
  }, [document, form]);

  const handleSubmit = async (data: EditDocumentFormData) => {
    if (!document?.id) return;

    try {
      await updateMutation.mutateAsync({
        id: document.id,
        data,
      });
      toast.success("Cập nhật giấy tờ thành công");
      onOpenChange(false);
      onSuccess?.();
    } catch (error) {
      toast.error("Cập nhật giấy tờ thất bại");
    }
  };

  const isPassport = document?.documentType === "Passport";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Chỉnh sửa giấy tờ tùy thân</DialogTitle>
          <DialogDescription>
            {isPassport
              ? "Chỉnh sửa thông tin Passport"
              : "Chỉnh sửa thông tin CMND/CCCD"}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            className="space-y-4"
          >
            {/* Full Name */}
            <FormField
              control={form.control}
              name="fullName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Họ và tên <span className="text-destructive">*</span>
                  </FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Nguyễn Văn A" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Document Number & ID Card Number */}
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="documentNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      {isPassport ? "Số Passport" : "Số CMND/CCCD"}{" "}
                      <span className="text-destructive">*</span>
                    </FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        placeholder={isPassport ? "A12345678" : "079123456789"}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {isPassport && (
                <FormField
                  control={form.control}
                  name="idCardNumber"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Số CMND/CCCD (nếu có)</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="079123456789" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}
            </div>

            {/* Date of Birth & Gender */}
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="dateOfBirth"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Ngày sinh <span className="text-destructive">*</span>
                    </FormLabel>
                    <FormControl>
                      <Input {...field} type="date" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="gender"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Giới tính <span className="text-destructive">*</span>
                    </FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Chọn giới tính" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="Nam">Nam</SelectItem>
                        <SelectItem value="Nữ">Nữ</SelectItem>
                        <SelectItem value="Khác">Khác</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Nationality & Place of Birth (Passport only) */}
            {isPassport && (
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="nationality"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Quốc tịch</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="Việt Nam" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
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
              </div>
            )}

            {/* Address */}
            <FormField
              control={form.control}
              name="address"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Địa chỉ</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder="Số nhà, đường, phường/xã, quận/huyện, tỉnh/thành phố"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Date of Issue & Expiry */}
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="dateOfIssue"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Ngày cấp</FormLabel>
                    <FormControl>
                      <Input {...field} type="date" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="dateOfExpire"
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

            {/* Note */}
            <FormField
              control={form.control}
              name="note"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Ghi chú</FormLabel>
                  <FormControl>
                    <Textarea
                      {...field}
                      placeholder="Thêm ghi chú nếu cần..."
                      rows={3}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={updateMutation.isPending}
              >
                Hủy
              </Button>
              <Button type="submit" disabled={updateMutation.isPending}>
                {updateMutation.isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Đang lưu...
                  </>
                ) : (
                  "Lưu thay đổi"
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
