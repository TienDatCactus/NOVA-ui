import { badgeVariants } from "~/components/ui/badge";

export type Room = {
  roomId: string;
  roomName: string;
  price: number;
  images?: string[];
  description?: string;
  roomType: string;
  status: string;
  quantity: number;
  amenities?: string[];
};

export interface BookingListParams {
  weekStart?: string;
  date?: string;
  code?: string;
  id?: string;
}

export const BOOKING_STEPS = [
  "THÔNG TIN KHÁCH",
  "CHỌN PHÒNG",
  "DỊCH VỤ THÊM",
  "XÁC NHẬN / THANH TOÁN",
] as const;

export const BOOKING_STATUSES = [
  { value: "all", label: "Tất cả trạng thái", variant: "secondary" },
  { value: "Confirmed", label: "Đã xác nhận", variant: "default" },
  { value: "CheckedIn", label: "Đã nhận phòng", variant: "success" },
  { value: "CheckedOut", label: "Đã trả phòng", variant: "outline" },
  { value: "Pending", label: "Chờ xử lý", variant: "warning" },
  { value: "Cancelled", label: "Đã hủy", variant: "destructive" },
] as const;

// Mapping booking status từ tiếng Anh sang tiếng Việt
export const BookingStatusEnum = {
  Pending: "Chờ xử lý",
  Confirmed: "Đã xác nhận",
  CheckedIn: "Đã nhận phòng",
  InHouse: "Đang ở",
  CheckedOut: "Đã trả phòng",
  Cancelled: "Đã hủy",
} as const;

// Type-safe keys
export type BookingStatus = keyof typeof BookingStatusEnum;

export const BOOKING_SOURCES = [
  { value: 0, label: "Trực tiếp (Nhân viên)", key: "DirectStaff" },
  { value: 2, label: "OTA", key: "OTA" },
  { value: 3, label: "Đại lý", key: "Agency" },
] as const;

export const BOOKING_SOURCE_ENUM = [
  "DirectStaff",
  "DirectCustomer",
  "OTA",
  "Agency",
];
