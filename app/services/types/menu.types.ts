export interface MenuFilters {
  categoryId: string;
  activeFilter: "active" | "all" | "";
  searchText: string;
}

export interface MenuListParams {
  includeInactive?: boolean;
  categoryCode?: string;
  q?: string;
}
