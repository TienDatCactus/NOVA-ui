export interface MenuFilters {
  categoryCode: string;
  activeFilter: "all" | "true" | "false";
  searchText: string;
}

export interface MenuListParams {
  includeInactive?: boolean;
  categoryCode?: string;
}
