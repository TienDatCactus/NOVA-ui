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
];

export const BOOKING_SOURCE = [
  "DirectStaff",
  "DirectCustomer",
  "OTA",
  "Agency",
];
