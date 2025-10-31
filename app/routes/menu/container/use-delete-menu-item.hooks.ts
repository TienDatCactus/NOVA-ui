import { useMutation, useQueryClient } from "@tanstack/react-query";
import { MenuItemService } from "~/services/api/menu-item";

function useDeleteMenuItem() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      return await MenuItemService.deleteMenuItem(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["menu-list"] });
    },
  });
}

export default useDeleteMenuItem;
