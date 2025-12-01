import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { RoomTypesService } from "~/services/api/room-types";
import type {
  CreateRoomTypesRequestDto,
  UpdateRoomTypesDetailRequestDto,
} from "~/services/api/room-types/dto";

export function useCreateRoomType() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateRoomTypesRequestDto) =>
      RoomTypesService.createRoomTypes(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["room-types"] });
      toast.success("Tạo loại phòng thành công");
    },
  });
}

export function useUpdateRoomType(id: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ data }: { data: UpdateRoomTypesDetailRequestDto }) =>
      RoomTypesService.updateRoomTypesDetail(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["room-types"] });
      queryClient.invalidateQueries({ queryKey: ["room-type", id] });
      toast.success("Cập nhật loại phòng thành công");
    },
  });
}

export function useDeleteRoomType(id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => RoomTypesService.deleteRoomTypes(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["room-types"] });
      queryClient.invalidateQueries({ queryKey: ["room-type", id] });
      toast.success("Xóa loại phòng thành công");
    },
  });
}
