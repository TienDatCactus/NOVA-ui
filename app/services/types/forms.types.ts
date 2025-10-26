import useFormSchema from "../schema/forms.schema";

const { CustomerInfoFormSchema } = useFormSchema();
export type CustomerInfoFormData = z.infer<typeof CustomerInfoFormSchema>;
