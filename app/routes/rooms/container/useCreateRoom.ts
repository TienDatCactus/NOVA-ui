import { useMutation, useQueryClient } from "@tanstack/react-query";
import { RoomsService } from "~/services/api/rooms";

function useCreateRoom() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationKey: ["create-room"],
    mutationFn: async (data: {
      roomName: string;
      roomTypeId: string;
      status: string;
    }) =>
      await RoomsService.createRoom({
        roomName: data.roomName,
        roomTypeId: data.roomTypeId,
        status: data.status,
      }),
    onSuccess() {
      queryClient.invalidateQueries({ queryKey: ["rooms"] });
    },
  });
}

export default useCreateRoom;
