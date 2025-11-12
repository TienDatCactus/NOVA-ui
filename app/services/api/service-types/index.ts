import http from "~/lib/http";
import type { ServiceTypeListParams } from "~/services/api/service-types/service-types.types";
import { ServiceTypes } from "~/services/url";
import type {
  CreateServiceTypeRequestDto,
  CreateServiceTypeResponseDto,
  ServiceTypeItemDetailDto,
  ServiceTypeListResponseDto,
  UpdateServiceTypeRequestDto,
  UpdateServiceTypeResponseDto,
} from "./dto";
import { ServiceTypesSchema } from "~/services/api/service-types/service-types.schema";

const {
  CreateServiceTypeResponseSchema,
  ServiceTypeItemDetailSchema,
  UpdateServiceTypeResponseSchema,
  CreateServiceTypeRequestSchema,
  UpdateServiceTypeRequestSchema,
  ServiceTypeListResponseSchema,
} = ServiceTypesSchema;

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
    const parsed = UpdateServiceTypeRequestSchema.parse(data);

    const formData = new FormData();
    formData.append("code", parsed.code);
    formData.append("name", parsed.name);
    formData.append("description", parsed.description ?? "");
    formData.append("active", String(parsed.active));
    if (Array.isArray(parsed.newImages)) {
      parsed.newImages.forEach((f) => {
        if (f instanceof File) formData.append("newImages", f);
      });
    }
    if (Array.isArray(parsed.removeMediaIds)) {
      parsed.removeMediaIds.forEach((id) =>
        formData.append("removeMediaIds", id)
      );
    }

    const resp = await http.put(ServiceTypes.update(id), formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
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
    const parsed = CreateServiceTypeRequestSchema.parse(data);
    const formData = new FormData();
    formData.append("code", parsed.code);
    formData.append("name", parsed.name);
    formData.append("description", parsed.description);
    formData.append("active", String(parsed.active));
    if (Array.isArray(parsed.images)) {
      parsed.images.forEach((f) => {
        if (f instanceof File) formData.append("images", f);
      });
    }

    const resp = await http.post(ServiceTypes.create, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
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
