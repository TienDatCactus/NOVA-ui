import { useQuery } from "@tanstack/react-query";
import { MenuService } from "~/services/api/menu";
import { MenuCategoryService } from "~/services/api/menu-category";
import { ServicesService } from "~/services/api/services";
import { ServiceTypesService } from "~/services/api/service-types";

/**
 * Hook để lấy danh sách menu categories cho customer
 */
export function useCustomerMenuCategories() {
  return useQuery({
    queryKey: ["customer-menu-categories"],
    queryFn: async () => await MenuCategoryService.getMenuCategoryList({}),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

/**
 * Hook để lấy danh sách menu items cho customer
 */
export function useCustomerMenuList() {
  return useQuery({
    queryKey: ["customer-menu-list"],
    queryFn: async () => await MenuService.getMenuList({}),
    staleTime: 5 * 60 * 1000,
  });
}

/**
 * Hook để lấy danh sách service types cho customer
 */
export function useCustomerServiceTypes() {
  return useQuery({
    queryKey: ["customer-service-types"],
    queryFn: async () => await ServiceTypesService.getServiceTypeList({}),
    staleTime: 5 * 60 * 1000,
  });
}

/**
 * Hook để lấy danh sách services cho customer
 */
export function useCustomerServices() {
  return useQuery({
    queryKey: ["customer-services"],
    queryFn: async () => await ServicesService.getServiceList({}),
    staleTime: 5 * 60 * 1000,
  });
}
