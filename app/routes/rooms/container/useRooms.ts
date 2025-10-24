import { useQuery } from "@tanstack/react-query";
import { RoomsService } from "~/services/api/rooms";
import type { RoomListParams } from "~/services/types/room.types";

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

export default useRooms;
