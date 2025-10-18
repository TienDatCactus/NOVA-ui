import { useQuery } from "@tanstack/react-query";
import { ServicesService } from "~/services/api/services";
import type { ServiceListParams } from "~/services/types/booking.types";

function useServices(params?: ServiceListParams) {
  return useQuery({
    queryKey: ["services", params],
    queryFn: async () => await ServicesService.getServiceList(params || {}),
  });
}

export default useServices;
