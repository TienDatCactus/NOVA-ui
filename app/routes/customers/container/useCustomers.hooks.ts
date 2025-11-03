import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { CustomerService } from "~/services/api/customer";

export function useCustomers() {
  return useQuery({
    queryKey: ["customers"],
    queryFn: async () => await CustomerService.getCustomerList(),
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    refetchOnMount: false,
  });
}

export function useCustomerDetail(id: string) {
  return useQuery({
    queryKey: ["customers", id],
    queryFn: async () => await CustomerService.getCustomerDetail(id),
    enabled: !!id, // Only fetch if id exists
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    refetchOnMount: false,
  });
}

export function useCreateCustomer() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: CustomerService.createCustomer,
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["customers"] });
    },
  });
}

export function useUpdateCustomer() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) =>
      CustomerService.updateCustomer(id, data),
    onSettled: (_, __, variables) => {
      // Always invalidate both list and specific customer detail after mutation completes
      queryClient.invalidateQueries({ queryKey: ["customers"] });
      queryClient.invalidateQueries({ queryKey: ["customers", variables.id] });
    },
  });
}

export function useRoles() {
  return useQuery({
    queryKey: ["roles"],
    queryFn: async () => await CustomerService.getRoleList(),
    staleTime: 60 * 60 * 1000, // 1 hour - roles don't change often
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    refetchOnMount: false,
  });
}

export function useLockUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) =>
      CustomerService.lockUser(id, data),
    onSettled: (_, __, variables) => {
      queryClient.invalidateQueries({ queryKey: ["customers"] });
      queryClient.invalidateQueries({ queryKey: ["customers", variables.id] });
    },
  });
}

export function useUnlockUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => CustomerService.unlockUser(id),
    onSettled: (_, __, id) => {
      queryClient.invalidateQueries({ queryKey: ["customers"] });
      queryClient.invalidateQueries({ queryKey: ["customers", id] });
    },
  });
}

export function useAssignRoles() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) =>
      CustomerService.assignRoles(id, data),
    onSettled: (_, __, variables) => {
      queryClient.invalidateQueries({ queryKey: ["customers"] });
      queryClient.invalidateQueries({ queryKey: ["customers", variables.id] });
    },
  });
}

export function useRemoveRoles() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) =>
      CustomerService.removeRoles(id, data),
    onSettled: (_, __, variables) => {
      queryClient.invalidateQueries({ queryKey: ["customers"] });
      queryClient.invalidateQueries({ queryKey: ["customers", variables.id] });
    },
  });
}
