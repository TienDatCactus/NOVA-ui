import { useMutation, useQueryClient } from "@tanstack/react-query";
import { MenuItemService } from "~/services/api/menu-item";
import type { CreateMenuItemRequestDto } from "~/services/api/menu-item/dto";

function useCreateMenuItem() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateMenuItemRequestDto) => {
      return await MenuItemService.createMenuItem(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["menu-list"] });
    },
  });
}

export default useCreateMenuItem;
