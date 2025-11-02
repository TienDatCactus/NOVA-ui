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
      toast.success("Thêm món ăn thành công");
    },
    onError: (error) => {
      console.error("Create menu item error:", error);
      toast.error("Có lỗi xảy ra khi thêm món ăn");
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
      toast.success("Cập nhật món ăn thành công");
    },
    onError: (error) => {
      console.error("Update menu item error:", error);
      toast.error("Có lỗi xảy ra khi cập nhật món ăn");
    },
  });
}

export function useDeleteMenuItem() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (itemId: string) =>
      await MenuService.deleteMenuItem(itemId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["menu-list"] });
      queryClient.invalidateQueries({
        queryKey: ["menu-list-by-category"],
      });
      toast.success("Xóa món ăn thành công");
    },
    onError: (error) => {
      console.error("Delete menu item error:", error);
      toast.error("Có lỗi xảy ra khi xóa món ăn");
    },
  });
}
