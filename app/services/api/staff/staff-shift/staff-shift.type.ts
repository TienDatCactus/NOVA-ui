// Query params for GET list
export type StaffShiftListParams = {
  staffId?: string;
  from?: string; // "yyyy-MM-dd"
  to?: string; // "yyyy-MM-dd"
};

// Delete scope enum
export enum DeleteScope {
  Single = "Single",
  FromThisDateForward = "FromThisDateForward",
  AllInSeries = "AllInSeries",
}

// Apply scope enum for update
export enum ApplyScope {
  ThisOnly = "ThisOnly",
  Forward = "Forward",
  All = "All",
}

export const WEEKDAYS = [
  { value: 1, label: "Thứ 2" },
  { value: 2, label: "Thứ 3" },
  { value: 3, label: "Thứ 4" },
  { value: 4, label: "Thứ 5" },
  { value: 5, label: "Thứ 6" },
  { value: 6, label: "Thứ 7" },
  { value: 7, label: "Chủ nhật" },
];
