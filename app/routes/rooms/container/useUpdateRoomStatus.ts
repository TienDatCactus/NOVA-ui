import { useMutation, useQueryClient } from "@tanstack/react-query";
import { RoomsService } from "~/services/api/rooms";

function useUpdateRoomStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationKey: ["update-room-status"],
    mutationFn: async (data: { roomId: string; status: string }) =>
      await RoomsService.updateRoomStatus(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["rooms"] });
    },
  });
}
export default useUpdateRoomStatus;
