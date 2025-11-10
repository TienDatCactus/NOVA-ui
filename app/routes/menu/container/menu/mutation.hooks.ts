import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { MenuService } from "~/services/api/menu";
import type {
  CreateMenuItemRequestDto,
  UpdateMenuItemRequestDto,
} from "~/services/api/menu/dto";

export function useCreateMenuItem() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateMenuItemRequestDto) =>
      await MenuService.createMenuItem(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["menu-list"] });
      queryClient.invalidateQueries({
        queryKey: ["menu-list-by-category"],
      });
    },
  });
}

export function useUpdateMenuItem(itemId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: UpdateMenuItemRequestDto) =>
      await MenuService.updateMenuItem(itemId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["menu-list"] });
      queryClient.invalidateQueries({
        queryKey: ["menu-list-by-category"],
      });
      queryClient.invalidateQueries({
        queryKey: ["menu-item-detail", itemId],
      });
    },
  });
}

export function useDeleteMenuItem(itemId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => await MenuService.deleteMenuItem(itemId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["menu-list"] });
      queryClient.invalidateQueries({
        queryKey: ["menu-list-by-category"],
      });
      queryClient.invalidateQueries({
        queryKey: ["menu-item-detail", itemId],
      });
    },
  });
}
