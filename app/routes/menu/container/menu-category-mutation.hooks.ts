import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { MenuCategoryService } from "~/services/api/menu-category";
import type {
  CreateMenuCategoryRequestDto,
  UpdateMenuCategoryRequestDto,
} from "~/services/api/menu-category/dto";

export function useCreateMenuCategory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateMenuCategoryRequestDto) =>
      await MenuCategoryService.createMenuCategory(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["menu-categories"] });
      queryClient.invalidateQueries({ queryKey: ["menu-list"] }); // Update menu items list
    },
  });
}

export function useUpdateMenuCategory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id: string;
      data: UpdateMenuCategoryRequestDto;
    }) => await MenuCategoryService.updateMenuCategory(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["menu-categories"] });
      queryClient.invalidateQueries({ queryKey: ["menu-list"] }); // Update menu items list
    },
  });
}

export function useDeleteMenuCategory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) =>
      await MenuCategoryService.deleteMenuCategory(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["menu-categories"] });
      queryClient.invalidateQueries({ queryKey: ["menu-list"] }); // Update menu items list
      // Toast already shown by HTTP interceptor
    },
  });
}
