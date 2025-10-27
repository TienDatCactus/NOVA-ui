import http from "~/lib/http";
import useServiceSchema from "~/services/schema/service.schema";
import type { ServiceListParams } from "~/services/types/service.types";
import { Service } from "~/services/url";
import type {
  CreateServiceRequestDto,
  CreateServiceResponseDto,
  ServiceItemDetailResponseDto,
  ServiceListByTypeResponseDto,
  ServiceListResponseDto,
  UpdateServiceRequestDto,
  UpdateServiceResponseDto,
} from "./dto";

const {
  ServiceListResponseSchema,
  CreateServiceItemResponseSchema,
  ServiceListByTypeResponseSchema,
  CreateServiceItemRequestSchema,
  UpdateServiceItemRequestSchema,
  UpdateServiceItemResponseSchema,
  ServiceItemDetailResponseSchema,
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
  serviceTypeId: string,
  params?: ServiceListParams
): Promise<ServiceListByTypeResponseDto> {
  try {
    const resp = await http.get(Service.byServiceType(serviceTypeId), {
      params,
    });
    return ServiceListByTypeResponseSchema.parse(resp);
  } catch (error) {
    console.error(error);
    return Promise.reject(error);
  }
}

async function createService(
  data: CreateServiceRequestDto
): Promise<CreateServiceResponseDto> {
  try {
    const resp = await http.post(
      Service.create,
      CreateServiceItemRequestSchema.parse(data)
    );
    return CreateServiceItemResponseSchema.parse(resp);
  } catch (error) {
    console.error(error);
    return Promise.reject(error);
  }
}

async function updateService(
  id: string,
  params: UpdateServiceRequestDto
): Promise<UpdateServiceResponseDto> {
  try {
    const resp = await http.put(
      Service.update(id),
      UpdateServiceItemRequestSchema.parse(params)
    );
    return UpdateServiceItemResponseSchema.parse(resp);
  } catch (error) {
    console.error(error);
    return Promise.reject(error);
  }
}

async function deleteService(id: string) {
  try {
    await http.delete(Service.delete(id));
  } catch (error) {
    console.error(error);
    return Promise.reject(error);
  }
}

async function getServiceDetail(
  id: string
): Promise<ServiceItemDetailResponseDto> {
  try {
    const resp = await http.get(Service.detail(id));
    return ServiceItemDetailResponseSchema.parse(resp);
  } catch (error) {
    console.error(error);
    return Promise.reject(error);
  }
}
export const ServicesService = {
  getServiceList,
  getServicesByType,
  createService,
  updateService,
  getServiceDetail,
  deleteService,
};
