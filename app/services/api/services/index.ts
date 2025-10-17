import useServiceSchema from "~/services/schema/service.schema";
import type { ServiceListParams } from "~/services/types/booking.types";
import type { ServiceListResponseDto } from "./dto";
import { Service } from "~/services/url";
import http from "~/lib/http";
const { ServiceListResponseSchema } = useServiceSchema();

async function getServiceList(
  params: ServiceListParams
): Promise<ServiceListResponseDto> {
  try {
    const resp = await http.get(Service.list, { params });
    return ServiceListResponseSchema.parse(resp.data);
  } catch (error) {
    console.error(error);
    return Promise.reject(error);
  }
}
