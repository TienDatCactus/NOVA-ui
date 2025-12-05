import type z from "zod";
import type { PurchaseRequestsSchemas } from "./purchase-requests.schema";

export type PurchaseRequestListParams = {
  status:
    | z.infer<typeof PurchaseRequestsSchemas.PurchaseRequestStatusEnum>
    | undefined;
};

export const PURCHASE_REQUESTS_STATUS = [
  {
    label: "Nháp",
    value: "Draft",
  },
  {
    label: "Đã duyệt",
    value: "Approved",
  },
  {
    label: "Từ chối",
    value: "Rejected",
  },
  {
    label: "Đã nhận hàng",
    value: "Fulfilled",
  },

  {
    label: "Đã hủy",
    value: "Cancelled",
  },
];
