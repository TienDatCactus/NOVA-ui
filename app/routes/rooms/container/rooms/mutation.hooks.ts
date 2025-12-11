import { useMutation, useQueryClient } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { toast } from "sonner";
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
      queryClient.invalidateQueries({ queryKey: ["rooms"] });
      toast.success("Tạo phòng thành công");
    },
    onError: (error) => {
      if (error instanceof AxiosError)
        toast.error(error.response?.data.message);
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
      queryClient.invalidateQueries({ queryKey: ["rooms"] });
      toast.success("Cập nhật phòng thành công");
    },
    onError: (error) => {
      if (error instanceof AxiosError)
        toast.error(error.response?.data.message);
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
      toast.success("Cập nhật trạng thái phòng thành công");
    },
    onError: (error) => {
      if (error instanceof AxiosError)
        toast.error(error.response?.data.message);
    },
  });
}

function useDeleteRoom() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationKey: ["delete-room"],
    mutationFn: async (id: string) => await RoomsService.deleteRoom(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["rooms"] });
      toast.success("Xóa phòng thành công");
    },
    onError: (error) => {
      if (error instanceof AxiosError)
        toast.error(error.response?.data.message);
    },
  });
}

function useRegenerateRoomQRCode() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationKey: ["regenerate-room-qrcode"],
    mutationFn: async (data: { roomId: string; baseUrl?: string }) =>
      await RoomsService.regenerateQRCode(data.roomId, data.baseUrl),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["room-qr-code", variables.roomId],
      });
      toast.success("Tạo lại mã QR thành công");
    },
    onError: (error) => {
      if (error instanceof AxiosError)
        toast.error(error.response?.data.message);
    },
  });
}

export {
  useCreateRoom,
  useDeleteRoom,
  useRegenerateRoomQRCode,
  useUpdateRoom,
  useUpdateRoomStatus,
};
