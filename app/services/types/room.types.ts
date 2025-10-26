export interface RoomDetailParams {
  date?: string;
  recent?: number;
}
export const RoomStatusEnum = {
  Ready: "Có thể sử dụng",
  Dirty: "Bẩn",
  Cleaning: "Đang dọn dẹp",
  Inspecting: "Đang kiểm tra",
  Maintenance: "Bảo trì",
  OutOfService: "Ngoài dịch vụ",
  Locked: "Đã khóa",
};

export interface RoomListParams {
  typeId?: string;
  status?:
    | "Available"
    | "Occupied"
    | "Dirty"
    | "OutOfService"
    | "Reserved"
    | "Cleaning"
    | "Locked";
  date?: string;
}

export interface RoomBookingHistoryParams {
  limit?: number;
  from?: string;
  to?: string;
}

export const ROOM_TYPE = ["Traditional", "Romantic", "Unique", "Chalet"];

export interface GetAvailableRoomsInternalParams {
  CheckInDate: string;
  CheckOutDate: string;
  Guests: number;
}
