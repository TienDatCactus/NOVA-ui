import type z from "zod";
import useServiceSchema from "~/services/schema/service.schema";
const { ServiceListResponseSchema } = useServiceSchema();
type ServiceListResponseDto = z.infer<typeof ServiceListResponseSchema>;
export type { ServiceListResponseDto };
