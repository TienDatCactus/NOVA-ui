export interface RoomDetailParams {
  date?: string;
  recent?: number;
}
export const RoomStatus = [
  "Available",
  "Occupied",
  "Dirty",
  "OutOfService",
  "Reserved",
  "Cleaning",
  "Locked",
];

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
