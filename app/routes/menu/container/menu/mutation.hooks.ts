import { useMutation, useQueryClient } from "@tanstack/react-query";
import { AxiosError } from "axios";
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
    onSuccess: (newItem) => {
      queryClient.invalidateQueries({
        queryKey: ["menu-list"],
        refetchType: "active", // Only refetch active queries
      });

      // Invalidate specific category list if item has category
      if (newItem.categoryId) {
        queryClient.invalidateQueries({
          queryKey: ["menu-list-by-category", newItem.categoryId],
        });
      }
      toast.success("Tạo món ăn thành công");
    },
    onError: (error) => {
      if (error instanceof AxiosError)
        toast.error(error.response?.data.message);
    },
  });
}

export function useUpdateMenuItem(itemId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: UpdateMenuItemRequestDto) =>
      await MenuService.updateMenuItem(itemId, data),
    onSuccess: (updatedItem) => {
      queryClient.invalidateQueries({
        queryKey: ["menu-list"],
        refetchType: "active",
      });

      if (updatedItem.categoryId) {
        queryClient.invalidateQueries({
          queryKey: ["menu-list-by-category", updatedItem.categoryId],
        });
      }

      queryClient.invalidateQueries({
        queryKey: ["menu-item-detail", itemId],
      });
      toast.success("Cập nhật món ăn thành công");
    },
    onError: (error) => {
      if (error instanceof AxiosError)
        toast.error(error.response?.data.message);
    },
  });
}

export function useDeleteMenuItem(itemId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => await MenuService.deleteMenuItem(itemId),
    onSuccess: () => {
      // Invalidate all menu lists
      queryClient.invalidateQueries({
        queryKey: ["menu-list"],
        refetchType: "active",
      });

      // Invalidate all category lists (can't know which category without the item data)
      queryClient.invalidateQueries({
        queryKey: ["menu-list-by-category"],
        refetchType: "active",
      });

      // Remove the deleted item from cache
      queryClient.removeQueries({
        queryKey: ["menu-item-detail", itemId],
      });
      toast.success("Xóa món ăn thành công");
    },
    onError: (error) => {
      if (error instanceof AxiosError)
        toast.error(error.response?.data.message);
    },
  });
}
