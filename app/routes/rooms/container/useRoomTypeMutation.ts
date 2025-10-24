import { useMutation, useQueryClient } from "@tanstack/react-query";
import { RoomTypesService } from "~/services/api/room-types";
import { toast } from "sonner";

export function useCreateRoomType() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: {
      code: string;
      name: string;
      baseRate: number;
      active: boolean;
    }) => RoomTypesService.createRoomTypes(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["room-types"] });
      toast.success("Tạo hạng phòng thành công");
    },
    onError: (error) => {
      console.error("Create room type error:", error);
    },
  });
}

export function useUpdateRoomType() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string;
      data: { code: string; name: string; baseRate: number; active: boolean };
    }) => RoomTypesService.updateRoomTypesDetail(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["room-types"] });
      toast.success("Cập nhật hạng phòng thành công");
    },
    onError: (error) => {
      console.error("Update room type error:", error);
    },
  });
}
