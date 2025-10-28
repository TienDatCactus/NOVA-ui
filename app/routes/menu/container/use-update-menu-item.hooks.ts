import { useMutation, useQueryClient } from "@tanstack/react-query";
import { MenuItemService } from "~/services/api/menu-item";
import type { UpdateMenuItemRequestDto } from "~/services/api/menu-item/dto";

function useUpdateMenuItem(id: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: UpdateMenuItemRequestDto) => {
      return await MenuItemService.updateMenuItem(id, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["menu-list"] });
      queryClient.invalidateQueries({ queryKey: ["menu-item-detail", id] });
    },
  });
}

export default useUpdateMenuItem;
