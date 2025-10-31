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

function useRoomTypeDetail(params?: { id: string; open: boolean }) {
  return useQuery({
    queryKey: ["room-type", params?.id],
    queryFn: async () => {
      if (!params?.id) throw new Error("Room type ID is required");
      return await RoomTypesService.getRoomTypesDetail(params.id);
    },
    staleTime: 10 * 60 * 1000,
    enabled: !!params?.id && params?.open === true,
  });
}
export { useRoomTypes, useRoomTypeDetail };
