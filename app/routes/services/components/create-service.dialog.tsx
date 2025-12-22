import { zodResolver } from "@hookform/resolvers/zod";
import { CircleDollarSign, FileText, Layers, Power, Tag } from "lucide-react";
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
  FormDescription,
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
import { Switch } from "~/components/ui/switch";
import { Textarea } from "~/components/ui/textarea";
import { useUnits } from "~/routes/units/container/unit-query.hooks";
import { ServiceSchema } from "~/services/api/services/service.schema";
import { useServiceTypes } from "../container/service-types/query.hooks";
import { useCreateService } from "../container/services/mutation.hooks";

const { CreateServiceItemRequestSchema } = ServiceSchema;
type CreateServiceFormData = z.infer<typeof CreateServiceItemRequestSchema>;

interface CreateServiceDialogProps {
  open: boolean;
  onClose: () => void;
}

export default function CreateServiceDialog({
  open,
  onClose,
}: CreateServiceDialogProps) {
  const form = useForm<CreateServiceFormData>({
    resolver: zodResolver(CreateServiceItemRequestSchema),
    defaultValues: {
      code: "",
      name: "",
      description: "",
      serviceTypeId: "",
      unitId: "",
      basePrice: 0,
      active: false,
    },
  });

  const { mutate, isPending } = useCreateService();
  const { data: units } = useUnits();
  const { data: servicesTypesData } = useServiceTypes();

  const handleSubmit = (data: CreateServiceFormData) => {
    mutate(data, {
      onSuccess: () => {
        handleClose();
      },
    });
  };

  const handleClose = () => {
    form.reset();
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[700px] gap-0 p-0 overflow-hidden">
        {/* Header */}
        <DialogHeader className="px-6 py-4 border-b bg-muted/10">
          <div>
            <DialogTitle className="text-xl">Thêm dịch vụ mới</DialogTitle>
            <DialogDescription className="mt-1">
              Thiết lập thông tin cơ bản cho dịch vụ hoặc sản phẩm mới.
            </DialogDescription>
          </div>
        </DialogHeader>

        {/* Body */}
        <div className="p-6 max-h-[75vh] overflow-y-auto">
          <Form {...form}>
            <form
              id="create-service-form"
              onSubmit={form.handleSubmit(handleSubmit)}
              className="space-y-6"
            >
              {/* Group 1: Classification */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="serviceTypeId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-1.5">
                        <Layers className="w-3.5 h-3.5 text-muted-foreground" />
                        Loại dịch vụ <span className="text-destructive">*</span>
                      </FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Chọn nhóm dịch vụ" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {servicesTypesData?.map((type) => (
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

                <FormField
                  control={form.control}
                  name="code"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-1.5">
                        <Tag className="w-3.5 h-3.5 text-muted-foreground" />
                        Mã dịch vụ <span className="text-destructive">*</span>
                      </FormLabel>
                      <FormControl>
                        <Input
                          placeholder="VD: SVC-001"
                          className="font-mono"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Group 2: Basic Info */}
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Tên hiển thị <span className="text-destructive">*</span>
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder="VD: Massage Thụy Điển 60p"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Group 3: Pricing & Unit */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="unitId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        Đơn vị tính <span className="text-destructive">*</span>
                      </FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Chọn đơn vị" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {units?.map((unit) => (
                            <SelectItem key={unit.id} value={unit.id}>
                              {unit.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="basePrice"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-1.5">
                        <CircleDollarSign className="w-3.5 h-3.5 text-muted-foreground" />
                        Đơn giá niêm yết{" "}
                        <span className="text-destructive">*</span>
                      </FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Input
                            type="number"
                            placeholder="0"
                            className="pr-12 text-right font-mono"
                            {...field}
                            onChange={(e) =>
                              field.onChange(Number(e.target.value))
                            }
                          />
                          <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none">
                            <span className="text-xs text-muted-foreground font-medium">
                              VNĐ
                            </span>
                          </div>
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Description */}
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-1.5">
                      <FileText className="w-3.5 h-3.5 text-muted-foreground" />
                      Mô tả
                    </FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Thông tin chi tiết về dịch vụ..."
                        className="resize-none min-h-[80px]"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Status Switch (Card Style) */}
              <FormField
                control={form.control}
                name="active"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4 shadow-sm bg-card">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base flex items-center gap-2">
                        <Power className="w-4 h-4 text-primary" />
                        Kích hoạt ngay
                      </FormLabel>
                      <FormDescription>
                        Dịch vụ sẽ xuất hiện trong menu bán hàng ngay khi tạo
                        xong.
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
            </form>
          </Form>
        </div>

        {/* Footer */}
        <DialogFooter className="px-6 py-4 bg-muted/10 border-t">
          <div className="flex justify-end gap-2 w-full">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={isPending}
            >
              Đóng
            </Button>
            <Button
              type="submit"
              onClick={form.handleSubmit(handleSubmit)}
              disabled={isPending}
              className="bg-primary hover:bg-primary/90"
            >
              {isPending ? "Đang xử lý..." : "Tạo dịch vụ"}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
