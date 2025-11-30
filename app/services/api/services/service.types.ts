import type { ServiceOrderDetailDto } from "../orders/dto";

export interface ServiceListParams {
  includeInactive?: boolean;
  typeCode?: string;
}
export type ServiceCategory = "Dịch vụ" | "Thức ăn" | "Đồ uống";

export interface ServiceFilters {
  typeCode: string;
  activeFilter: "" | "active" | "all";
  searchText: string;
}

export const STATUS_OPTIONS: {
  value: ServiceOrderDetailDto["status"] | "All";
  label: string;
}[] = [
  { value: "All", label: "Tất cả" },
  { value: "Scheduled", label: "Đã lên lịch" },
  { value: "Completed", label: "Hoàn thành" },
  { value: "Cancelled", label: "Đã hủy" },
  { value: "NoShow", label: "Không đến" },
];
