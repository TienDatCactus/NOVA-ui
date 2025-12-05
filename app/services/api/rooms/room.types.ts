export interface RoomDetailParams {
  date?: string;
  recent?: number;
}
export const RoomStatusEnum = {
  Ready: "Có thể sử dụng",
  Dirty: "Bẩn",
  Cleaning: "Đang dọn dẹp",
  Maintenance: "Bảo trì",
  OutOfService: "Ngừng phục vụ",
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

export interface AvailableRoomListParams {
  CheckInDate: string;
  CheckOutDate: string;
  Adults: number;
  ChildrenUnder6: number;
  RoomCount: number;
}

export interface InternalAvailableRoomListParams {
  CheckInDate: string;
  CheckOutDate: string;
  Guests: number;
}

export enum RoomAvailabilityStatus {
  Available = "Available",
  SwapPossible = "SwapPossible",
  Occupied = "Occupied",
}

export const RoomAvailabilityStatusLabel: Record<
  RoomAvailabilityStatus,
  string
> = {
  [RoomAvailabilityStatus.Available]: "Trống",
  [RoomAvailabilityStatus.SwapPossible]: "Có thể đổi",
  [RoomAvailabilityStatus.Occupied]: "Đã đặt",
};

export const RoomAvailabilityStatusColor: Record<
  RoomAvailabilityStatus,
  { bg: string; text: string }
> = {
  [RoomAvailabilityStatus.Available]: {
    bg: "bg-green-100",
    text: "text-green-900",
  },
  [RoomAvailabilityStatus.SwapPossible]: {
    bg: "bg-yellow-100",
    text: "text-yellow-900",
  },
  [RoomAvailabilityStatus.Occupied]: {
    bg: "bg-red-100",
    text: "text-red-900",
  },
};

export function getRoomAvailabilityLabel(status: string): string {
  return (
    RoomAvailabilityStatusLabel[status as RoomAvailabilityStatus] || status
  );
}

export function getRoomAvailabilityColor(status: string): {
  bg: string;
  text: string;
} {
  return (
    RoomAvailabilityStatusColor[status as RoomAvailabilityStatus] || {
      bg: "bg-gray-100",
      text: "text-gray-600",
    }
  );
}
