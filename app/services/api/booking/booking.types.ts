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
  { value: "InHouse", label: " Đang ở", variant: "success" },
  { value: "CheckedOut", label: "Đã trả phòng", variant: "outline" },
  { value: "Pending", label: "Chờ xử lý", variant: "warning" },
  { value: "Cancelled", label: "Đã hủy", variant: "destructive" },
  { value: "NoShow", label: "Không đến", variant: "destructive" },
] as const;
export const BOOKING_SOURCES = [
  { value: 0, label: "Trực tiếp (Nhân viên)", key: "DirectStaff" },
  { value: 2, label: "OTA", key: "OTA" },
  { value: 3, label: "Đại lý", key: "Agency" },
  { value: 4, label: "Khóa phòng (Room Block)", key: "RoomBlock" },
] as const;

export const BOOKING_SOURCE_ENUM = [
  "DirectStaff",
  "DirectCustomer",
  "OTA",
  "Agency",
  "RoomBlock",
];
