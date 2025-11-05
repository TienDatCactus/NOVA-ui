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
