import { useQueryClient, useMutation } from "@tanstack/react-query";
import { RoomsService } from "~/services/api/rooms";
import type { UpdateRoomDetailRequestDto } from "~/services/api/rooms/dto";

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
    onSuccess: () => {
      queryClient.refetchQueries({ queryKey: ["rooms"] });
    },
  });
}

function useUpdateRoom() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationKey: ["update-room"],
    mutationFn: async ({
      id,
      data,
    }: {
      id: string;
      data: UpdateRoomDetailRequestDto;
    }) => await RoomsService.updateRoomDetail(id, data),
    onSuccess: () => {
      queryClient.refetchQueries({ queryKey: ["rooms"] });
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
      queryClient.refetchQueries({ queryKey: ["rooms"] });
    },
  });
}

export { useCreateRoom, useUpdateRoom, useUpdateRoomStatus };
