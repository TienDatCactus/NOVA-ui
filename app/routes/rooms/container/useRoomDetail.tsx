import { useQuery } from "@tanstack/react-query";
import { RoomsService } from "~/services/api/rooms";
import type { RoomDetailParams } from "~/services/types/room.types";

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
export default useRoomDetail;
