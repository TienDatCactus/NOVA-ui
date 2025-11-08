export type OrderStatus = "All" | "Open" | "Completed" | "Cancelled";
export const StatusOptions: Array<{
  value: OrderStatus;
  label: string;
  key: string;
}> = [
  { value: "All", label: "Tất cả", key: "all" },
  { value: "Open", label: "Đang mở", key: "open" },
  { value: "Completed", label: "Hoàn thành", key: "completed" },
  { value: "Cancelled", label: "Đã hủy", key: "cancelled" },
];
