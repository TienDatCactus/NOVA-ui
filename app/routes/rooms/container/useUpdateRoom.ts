import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { RoomsService } from "~/services/api/rooms";

interface UpdateRoomData {
  roomId: string;
  roomName: string;
  roomTypeId: string;
  status: string;
  locked: boolean;
}

function useUpdateRoom() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: UpdateRoomData) => {
      const { roomId, ...updateData } = data;
      return await RoomsService.updateRoomDetail(roomId, updateData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["rooms"] });
    },
  });
}

export default useUpdateRoom;
