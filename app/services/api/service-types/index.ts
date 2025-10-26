import http from "~/lib/http";
import useServiceTypeSchema from "~/services/schema/service-type.schema";
import { ServiceTypes } from "~/services/url";

const { ServiceTypesListResponseSchema } = useServiceTypeSchema();

async function getServiceTypesList() {
  try {
    const resp = await http.get(ServiceTypes.list);
    const result = ServiceTypesListResponseSchema.safeParse(resp);

    if (!result.success) {
      console.error("ServiceTypes validation errors:", result.error.format());
      return Promise.reject(result.error);
    }

    return result.data;
  } catch (error) {
    console.error("Get service types error:", error);
    return Promise.reject(error);
  }
}

export const ServiceTypesService = {
  getServiceTypesList,
};
