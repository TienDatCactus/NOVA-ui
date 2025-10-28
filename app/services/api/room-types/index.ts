import type { RoomTypesListParams } from "~/services/types/room-types.types";
import type {
  CreateRoomTypesResponseDto,
  RoomTypesDetailResponseDto,
  RoomTypesListResponseDto,
  UpdateRoomTypesDetailResponseDto,
} from "./dto";
import useRoomTypesSchema from "~/services/schema/room-types.schema";
import { RoomTypes } from "~/services/url";
import http from "~/lib/http";

const {
  RoomTypesListResponseSchema,
  RoomTypesDetailResponseSchema,
  UpdateRoomTypesDetailResponseSchema,
  CreateRoomTypesResponseSchema,
} = useRoomTypesSchema();

async function getRoomTypesList(
  params?: RoomTypesListParams
): Promise<RoomTypesListResponseDto> {
  try {
    const resp = await http.get(RoomTypes.list, { params });
    return RoomTypesListResponseSchema.parse(resp.data);
  } catch (error) {
    console.error(error);
    return Promise.reject(error);
  }
}

async function getRoomTypesDetail(
  id: string
): Promise<RoomTypesDetailResponseDto> {
  try {
    const resp = await http.get(RoomTypes.detail(id));
    return RoomTypesDetailResponseSchema.parse(resp.data);
  } catch (error) {
    console.error(error);
    return Promise.reject(error);
  }
}

async function updateRoomTypesDetail(
  id: string,
  data: {
    code: string;
    name: string;
    baseRate: number;
    active: boolean;
  }
): Promise<UpdateRoomTypesDetailResponseDto> {
  try {
    const resp = await http.patch(RoomTypes.detail(id), data);
    return UpdateRoomTypesDetailResponseSchema.parse(resp.data);
  } catch (error) {
    console.error(error);
    return Promise.reject(error);
  }
}

async function createRoomTypes(data: {
  code: string;
  name: string;
  baseRate: number;
  active: boolean;
}): Promise<CreateRoomTypesResponseDto> {
  try {
    const resp = await http.post(RoomTypes.create, data);
    return CreateRoomTypesResponseSchema.parse(resp.data);
  } catch (error) {
    console.error(error);
    return Promise.reject(error);
  }
}
export const RoomTypesService = {
  getRoomTypesList,
  getRoomTypesDetail,
  updateRoomTypesDetail,
  createRoomTypes,
};
