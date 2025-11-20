import type z from "zod";
import type { PurchaseRequestsSchemas } from "./purchase-requests.schema";

export type PurchaseRequestListParams = {
  status: z.infer<
    typeof PurchaseRequestsSchemas.PurchaseRequestStatusEnum
  > | null;
};
