import { useQuery } from "@tanstack/react-query";
import { RoomsService } from "~/services/api/rooms";
import type {
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
  expanded,
}: {
  id: string;
  params?: RoomDetailParams;
  expanded: boolean;
}) {
  return useQuery({
    queryKey: ["room-detail", id, expanded],
    queryFn: async () => RoomsService.getRoomDetails(id, params || {}),
    staleTime: 5 * 60 * 1000,
    enabled: () => !!id && expanded,
  });
}

function useRoomBookingHistory({
  id,
  params,
  expanded,
}: {
  id: string;
  params: RoomBookingHistoryParams;
  expanded: boolean;
}) {
  return useQuery({
    queryKey: ["room-booking-history", id, params],
    queryFn: async () => await RoomsService.getRoomBookingHistory(id, params),
    staleTime: 5 * 60 * 1000,
    enabled: () => !!id && expanded,
  });
}
export { useRooms, useRoomDetail, useRoomBookingHistory };
