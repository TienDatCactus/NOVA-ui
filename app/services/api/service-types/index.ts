import useServiceTypesSchema from "~/services/schema/service-types.schema";
import type { ServiceTypeListParams } from "~/services/types/service-types.types";
import type {
  CreateServiceTypeRequestDto,
  CreateServiceTypeResponseDto,
  ServiceTypeItemDetailDto,
  ServiceTypeListResponseDto,
  UpdateServiceTypeRequestDto,
  UpdateServiceTypeResponseDto,
} from "./dto";
import http from "~/lib/http";
import { ServiceTypes } from "~/services/url";

const {
  CreateServiceTypeResponseSchema,
  ServiceTypeItemDetailSchema,
  UpdateServiceTypeResponseSchema,
  CreateServiceTypeRequestSchema,
  UpdateServiceTypeRequestSchema,
  ServiceTypeListResponseSchema,
} = useServiceTypesSchema();

async function getServiceTypeList(
  params: ServiceTypeListParams
): Promise<ServiceTypeListResponseDto> {
  try {
    const resp = await http.get(ServiceTypes.list, { params });
    return ServiceTypeListResponseSchema.parse(resp.data);
  } catch (error) {
    console.error(error);
    return Promise.reject(error);
  }
}

async function updateServiceType(
  id: string,
  data: UpdateServiceTypeRequestDto
): Promise<UpdateServiceTypeResponseDto> {
  try {
    const resp = await http.put(ServiceTypes.update(id), data);
    return UpdateServiceTypeResponseSchema.parse(resp.data);
  } catch (error) {
    console.error(error);
    return Promise.reject(error);
  }
}

async function createServiceType(
  data: CreateServiceTypeRequestDto
): Promise<CreateServiceTypeResponseDto> {
  try {
    const resp = await http.post(ServiceTypes.create, data);
    return CreateServiceTypeResponseSchema.parse(resp.data);
  } catch (error) {
    console.error(error);
    return Promise.reject(error);
  }
}

async function getServiceTypeDetail(
  id: string
): Promise<ServiceTypeItemDetailDto> {
  try {
    const resp = await http.get(ServiceTypes.detail(id));
    return ServiceTypeItemDetailSchema.parse(resp.data);
  } catch (error) {
    console.error(error);
    return Promise.reject(error);
  }
}

async function deleteServiceType(id: string) {
  try {
    await http.delete(ServiceTypes.delete(id));
  } catch (error) {
    console.error(error);
    return Promise.reject(error);
  }
}
export const ServiceTypesService = {
  getServiceTypeList,
  updateServiceType,
  createServiceType,
  getServiceTypeDetail,
  deleteServiceType,
};
