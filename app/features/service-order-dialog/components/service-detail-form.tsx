import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, type UseFormReturn } from "react-hook-form";
import z from "zod";

import { Button } from "~/components/ui/button";
import { DatePicker } from "~/components/ui/date-picker";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "~/components/ui/form";
import { Input } from "~/components/ui/input";
import { Textarea } from "~/components/ui/textarea";
import useServiceSchema from "~/services/schema/service.schema";
import type { ServiceItem } from "~/services/api/services/dto";
import { Counter } from "~/components/ui/shadcn-io/button-group/advanced/counter";
import { onError } from "~/lib/utils";

const { ServiceOrderSchema, ServiceOrderItemSchema } = useServiceSchema();
type ServiceOrderDto = z.infer<typeof ServiceOrderSchema>;
type ServiceOrderItemDto = z.infer<typeof ServiceOrderItemSchema>;

// Schema for the detail form fields (subset of ServiceOrderItemSchema)
const ServiceDetailFormSchema = z.object({
  quantity: z.coerce.number().int().min(1, "Số lượng tối thiểu là 1"),
  scheduledDate: z.date(),
  note: z
    .string()
    .max(500, "Ghi chú không quá 500 ký tự")
    .optional()
    .transform((v) => v ?? ""),
});

type ServiceDetailFormInput = z.input<typeof ServiceDetailFormSchema>;
type ServiceDetailFormOutput = z.output<typeof ServiceDetailFormSchema>;

interface ServiceDetailFormProps {
  form: UseFormReturn<ServiceOrderDto>;
  selectedService: ServiceItem;
  onCancel: () => void;
  onSuccess?: () => void;
}

function ServiceDetailForm({
  form: parentForm,
  selectedService,
  onCancel,
  onSuccess,
}: ServiceDetailFormProps) {
  const detailForm = useForm<
    ServiceDetailFormInput,
    any,
    ServiceDetailFormOutput
  >({
    resolver: zodResolver(ServiceDetailFormSchema),
    defaultValues: {
      quantity: 1 as unknown as ServiceDetailFormInput["quantity"],
      scheduledDate: new Date(),
      note: "",
    },
  });

  const handleSubmit = (values: ServiceDetailFormOutput) => {
    const currentServices = parentForm.getValues("services") || [];
    const newServiceItem: ServiceOrderItemDto = {
      itemType: "ServiceItem",
      itemId: selectedService.serviceItemId,
      quantity: values.quantity,
      scheduledDate: values.scheduledDate.toISOString().slice(0, 10),
      note: values.note,
    };

    parentForm.setValue("services", [...currentServices, newServiceItem], {
      shouldValidate: true,
      shouldDirty: true,
    });

    detailForm.reset();
    onSuccess?.();
  };

  return (
    <Form {...detailForm}>
      <form
        className="grid gap-4 border rounded-lg p-4"
        onSubmit={detailForm.handleSubmit(handleSubmit)}
      >
        <div className="grid grid-cols-2 gap-3">
          <FormField
            control={detailForm.control}
            name="quantity"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Số lượng</FormLabel>
                <FormControl>
                  <Counter
                    value={field.value as number | undefined}
                    onChange={field.onChange}
                    onBlur={field.onBlur}
                    name={field.name}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={detailForm.control}
            name="scheduledDate"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Ngày thực hiện</FormLabel>
                <FormControl>
                  <DatePicker value={field.value} onChange={field.onChange} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <FormField
          control={detailForm.control}
          name="note"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Ghi chú</FormLabel>
              <FormControl>
                <Textarea
                  {...field}
                  placeholder="Thêm ghi chú..."
                  className="min-h-[80px]"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="flex justify-end gap-2">
          <Button type="button" variant="secondary" onClick={onCancel}>
            Hủy
          </Button>
          <Button onClick={detailForm.handleSubmit(handleSubmit, onError)}>
            Thêm vào booking
          </Button>
        </div>
      </form>
    </Form>
  );
}
export default ServiceDetailForm;
