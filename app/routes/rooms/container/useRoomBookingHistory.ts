import { useQuery } from "@tanstack/react-query";
import { RoomsService } from "~/services/api/rooms";
import type { RoomBookingHistoryParams } from "~/services/types/room.types";

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
export default useRoomBookingHistory;
