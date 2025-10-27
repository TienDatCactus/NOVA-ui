import http from "~/lib/http";
import useUnitSchema from "~/services/schema/unit.schema";
import { Units } from "~/services/url";
import type {
  CreateUnitRequestDto,
  CreateUnitResponseDto,
  UnitListResponseDto,
  UpdateUnitRequestDto,
  UpdateUnitResponseDto,
} from "./dto";
import type { UnitListParams } from "~/services/types/unit.types";

const {
  CreateUnitRequestSchema,
  CreateUnitResponseSchema,
  UnitItemDetailResponseSchema,
  UnitListResponseSchema,
  UpdateUnitRequestSchema,
  UpdateUnitResponseSchema,
} = useUnitSchema();

async function getUnitList(
  params?: UnitListParams
): Promise<UnitListResponseDto> {
  try {
    const resp = await http.get(Units.list, { params });
    return UnitListResponseSchema.parse(resp.data);
  } catch (error) {
    console.error("Get units error:", error);
    return Promise.reject(error);
  }
}

async function createUnit(
  data: CreateUnitRequestDto
): Promise<CreateUnitResponseDto> {
  try {
    const resp = await http.post(
      Units.create,
      CreateUnitRequestSchema.parse(data)
    );
    return CreateUnitResponseSchema.parse(resp.data);
  } catch (error) {
    console.error(error);
    return Promise.reject(error);
  }
}

async function updateUnit(
  id: string,
  data: UpdateUnitRequestDto
): Promise<UpdateUnitResponseDto> {
  try {
    const resp = await http.put(
      Units.update(id),
      UpdateUnitRequestSchema.parse(data)
    );
    return UpdateUnitResponseSchema.parse(resp.data);
  } catch (error) {
    console.error(error);
    return Promise.reject(error);
  }
}
export const UnitsService = {
  getUnitList,
  createUnit,
  updateUnit,
};
