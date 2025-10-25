import { useQueryClient, useMutation } from "@tanstack/react-query";
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

export { useCreateRoom, useUpdateRoom, useUpdateRoomStatus };
