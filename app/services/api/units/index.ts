import http from "~/lib/http";
import type { UnitListParams } from "~/services/api/units/unit.types";
import { Units } from "~/services/url";
import type {
  CreateUnitRequestDto,
  CreateUnitResponseDto,
  UnitListResponseDto,
  UpdateUnitRequestDto,
  UpdateUnitResponseDto,
} from "./dto";
import { UnitSchema } from "./unit.schema";

const {
  CreateUnitRequestSchema,
  CreateUnitResponseSchema,
  UnitListResponseSchema,
} = UnitSchema;

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
    const resp = await http.put(Units.update(id), data);
    return resp.data;
  } catch (error) {
    console.error(error);
    return Promise.reject(error);
  }
}

async function deleteUnit(id: string): Promise<void> {
  try {
    const resp = await http.delete(Units.delete(id));
    return resp.data;
  } catch (error) {
    console.error(error);
    return Promise.reject(error);
  }
}

export const UnitsService = {
  getUnitList,
  createUnit,
  updateUnit,
  deleteUnit,
};
