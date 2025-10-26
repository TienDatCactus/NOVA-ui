import useServiceSchema from "~/services/schema/service.schema";
import type { ServiceListParams } from "~/services/types/service.types";
import type {
  ServiceListResponseDto,
  CreateServiceRequestDto,
  CreateServiceResponseDto,
  ServiceByTypeResponseDto,
} from "./dto";
import { Service } from "~/services/url";
import http from "~/lib/http";

const {
  ServiceListResponseSchema,
  CreateServiceResponseSchema,
  ServiceByTypeResponseSchema,
} = useServiceSchema();

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

async function getServicesByType(
  serviceTypeId: string
): Promise<ServiceByTypeResponseDto> {
  try {
    const resp = await http.get(Service.byServiceType(serviceTypeId));
    return ServiceByTypeResponseSchema.parse(resp);
  } catch (error) {
    console.error(error);
    return Promise.reject(error);
  }
}

async function createService(
  data: CreateServiceRequestDto
): Promise<CreateServiceResponseDto> {
  try {
    const resp = await http.post(Service.create, data);
    const result = CreateServiceResponseSchema.safeParse(resp);

    if (!result.success) {
      console.error("Create validation errors:", result.error.format());
      console.error("Response data:", resp);
      return Promise.reject(new Error("Validation failed"));
    }
    return result.data;
  } catch (error: any) {
    console.error(error);
    return Promise.reject(error);
  }
}

export const ServicesService = {
  getServiceList,
  getServicesByType,
  createService,
};
