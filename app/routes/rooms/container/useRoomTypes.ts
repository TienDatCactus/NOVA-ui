import { useQuery } from "@tanstack/react-query";
import { RoomTypesService } from "~/services/api/room-types";
import type { RoomTypesListParams } from "~/services/types/room-types.types";

function useRoomTypes(params?: RoomTypesListParams) {
  return useQuery({
    queryKey: ["room-types", params],
    queryFn: async () => await RoomTypesService.getRoomTypesList(params),
    staleTime: 10 * 60 * 1000,
  });
}
export default useRoomTypes;
