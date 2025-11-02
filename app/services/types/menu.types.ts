export interface MenuFilters {
  categoryCode: string;
  activeFilter: "active" | "all" | "";
  searchText: string;
}

export interface MenuListParams {
  includeInactive?: boolean;
  categoryCode?: string;
}
