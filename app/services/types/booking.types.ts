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
  { value: "all", label: "Tất cả trạng thái" },
  { value: "Confirmed", label: "Đã xác nhận" },
  { value: "CheckedIn", label: "Đã nhận phòng" },
  { value: "CheckedOut", label: "Đã trả phòng" },
  { value: "Pending", label: "Chờ xử lý" },
  { value: "Cancelled", label: "Đã hủy" },
] as const;
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
