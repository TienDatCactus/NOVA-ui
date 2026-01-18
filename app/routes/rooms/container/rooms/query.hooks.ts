import { useQuery } from "@tanstack/react-query";
import { RoomsService } from "~/services/api/rooms";
import type { RoomDetailResponseDto } from "~/services/api/rooms/dto";
import type {
  AvailableRoomListParams,
  InternalAvailableRoomListParams,
  RoomBookingHistoryParams,
  RoomDetailParams,
  RoomListParams,
} from "~/services/api/rooms/room.types";

function useRooms(params?: RoomListParams) {
  return useQuery({
    queryKey: ["rooms", params],
    queryFn: async () => await RoomsService.getRoomList(params || {}),
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
    refetchOnMount: false,
  });
}

function useRoomDetail({
  id,
  params,
}: {
  id: string;
  params?: RoomDetailParams;
}) {
  return useQuery({
    queryKey: ["room-detail", id],
    queryFn: async () => RoomsService.getRoomDetails(id, params || {}),
    staleTime: 5 * 60 * 1000,
    enabled: !!id,
  });
}

function useRoomBookingHistory({
  id,
  params,
}: {
  id: string;
  params?: RoomBookingHistoryParams;
}) {
  return useQuery({
    queryKey: ["room-booking-history", id, params],
    queryFn: async () =>
      await RoomsService.getRoomBookingHistory(id, params ?? {}),
    staleTime: 5 * 60 * 1000,
    enabled: () => !!id,
  });
}

function useAvailableRoomsWithDetail(
  params: InternalAvailableRoomListParams,
  enabled: boolean = true,
) {
  return useQuery({
    queryKey: ["available-rooms-with-detail", params],
    queryFn: async () => await RoomsService.getAvailableRoomsWithDetail(params),
    staleTime: 5 * 60 * 1000,
    enabled: !!enabled && !!params.CheckInDate && !!params.CheckOutDate,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  });
}

function useAvailableRooms(
  params: AvailableRoomListParams,
  enabled: boolean = true,
) {
  return useQuery({
    queryKey: ["available-rooms", params],
    queryFn: async () => RoomsService.getAvailableRooms(params),
    enabled: !!enabled && !!params.CheckInDate && !!params.CheckOutDate,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  });
}

function useRoomsDetailsByIds(ids: string[]) {
  return useQuery<RoomDetailResponseDto[]>({
    queryKey: ["rooms-details", ids],
    queryFn: async () =>
      await Promise.all(ids.map((id) => RoomsService.getRoomDetails(id, {}))),
    enabled: Array.isArray(ids) && ids.length > 0,
    staleTime: 5 * 60 * 1000,
  });
}

function useGetRoomQrCode(roomId: string, options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: ["room-qr-code", roomId],
    queryFn: async () => {
      const blob = await RoomsService.generateQRCode(roomId);
      console.log(blob);
      return new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          if (typeof reader.result === "string") {
            resolve(reader.result);
          } else {
            reject(new Error("Failed to convert blob to data URL"));
          }
        };
        reader.onerror = reject;
        reader.readAsDataURL(blob as any);
      });
    },
    enabled: !!roomId && options?.enabled !== false,
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 2,
  });
}
export {
  useGetRoomQrCode,
  useRoomBookingHistory,
  useRoomDetail,
  useRooms,
  useRoomsDetailsByIds,
  useAvailableRooms,
  useAvailableRoomsWithDetail,
};
