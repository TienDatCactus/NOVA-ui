import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { ServicesService } from "~/services/api/services";
import type { CreateServiceRequestDto } from "~/services/api/services/dto";

export function useCreateService() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateServiceRequestDto) =>
      ServicesService.createService(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["services"] });
      toast.success("Tạo dịch vụ thành công!");
    },
  });
}
