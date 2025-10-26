import http from "~/lib/http";
import useUnitSchema from "~/services/schema/unit.schema";
import { Units } from "~/services/url";

const { UnitsListResponseSchema } = useUnitSchema();

async function getUnitsList() {
  try {
    const resp = await http.get(Units.list);
    const result = UnitsListResponseSchema.safeParse(resp);

    if (!result.success) {
      console.error("Units validation errors:", result.error.format());
      return Promise.reject(result.error);
    }
    // Return the data array from the wrapped response
    return result.data.data;
  } catch (error) {
    console.error("Get units error:", error);
    return Promise.reject(error);
  }
}

export const UnitsService = {
  getUnitsList,
};
