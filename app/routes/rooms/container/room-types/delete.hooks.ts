import { useMutation, useQueryClient } from "@tanstack/react-query";
import { RoomTypesService } from "~/services/api/room-types";
import { toast } from "sonner";

export function useDeleteRoomType() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => RoomTypesService.deleteRoomTypes(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["room-types"] });
      toast.success("Xóa hạng phòng thành công");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Không thể xóa hạng phòng");
    },
  });
}
