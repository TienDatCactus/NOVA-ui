import { useQuery } from "@tanstack/react-query";
import { RoomsService } from "~/services/api/rooms";
import type {
  GetAvailableRoomsInternalParams,
  RoomBookingHistoryParams,
  RoomDetailParams,
  RoomListParams,
} from "~/services/types/room.types";

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

function useAvailableRoomsInternal(params: GetAvailableRoomsInternalParams) {
  return useQuery({
    queryKey: ["available-rooms-internal", params],
    queryFn: async () => await RoomsService.getAvailableRoomsInternal(params),
    staleTime: 5 * 60 * 1000,
    enabled: () => !!params,
  });
}
export {
  useRooms,
  useRoomDetail,
  useRoomBookingHistory,
  useAvailableRoomsInternal,
};
