export interface ServiceListParams {
  includeInactive?: boolean;
  typeCode?: string;
}
export type ServiceCategory = "Dịch vụ" | "Thức ăn" | "Đồ uống";

export interface ServiceFilters {
  typeCode: string;
  activeFilter: "all" | "true" | "false";
  searchText: string;
}
