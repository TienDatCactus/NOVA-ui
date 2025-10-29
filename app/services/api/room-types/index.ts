import type { RoomTypesListParams } from "~/services/types/room-types.types";
import type {
  CreateRoomTypesRequestDto,
  CreateRoomTypesResponseDto,
  RoomTypesDetailResponseDto,
  RoomTypesListResponseDto,
  UpdateRoomTypesDetailRequestDto,
  UpdateRoomTypesDetailResponseDto,
} from "./dto";
import useRoomTypesSchema from "~/services/schema/room-types.schema";
import { RoomTypes } from "~/services/url";
import http from "~/lib/http";

const {
  RoomTypesListResponseSchema,
  RoomTypesDetailResponseSchema,
  UpdateRoomTypesDetailRequestSchema,
  CreateRoomTypesRequestSchema,
  CreateRoomTypesResponseSchema,
  UpdateRoomTypesDetailResponseSchema,
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
  data: UpdateRoomTypesDetailRequestDto
): Promise<UpdateRoomTypesDetailResponseDto> {
  try {
    const validatedData = UpdateRoomTypesDetailRequestSchema.parse(data);
    const formData = new FormData();
    formData.append("code", validatedData.code);
    formData.append("name", validatedData.name);
    formData.append("baseRate", validatedData.baseRate.toString());
    formData.append("active", validatedData.active.toString());
    if (validatedData.description) {
      formData.append("description", validatedData.description);
    }
    if (validatedData.maxOccupancy !== undefined) {
      formData.append("maxOccupancy", validatedData.maxOccupancy.toString());
    }
    const validFiles = validatedData.images?.filter(
      (file): file is File => file instanceof File
    );
    validFiles?.forEach((file) => {
      formData.append("images", file);
    });

    if (
      validatedData.removeMediaIds &&
      validatedData.removeMediaIds.length > 0
    ) {
      validatedData.removeMediaIds.forEach((id) =>
        formData.append("removeMediaIds", id)
      );
    }
    const resp = await http.patch(RoomTypes.detail(id), formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });

    return UpdateRoomTypesDetailResponseSchema.parse(resp.data);
  } catch (error) {
    console.error(error);
    return Promise.reject(error);
  }
}

async function createRoomTypes(
  data: CreateRoomTypesRequestDto
): Promise<CreateRoomTypesResponseDto> {
  try {
    const validatedData = CreateRoomTypesRequestSchema.parse(data);

    const formData = new FormData();
    formData.append("code", validatedData.code);
    formData.append("name", validatedData.name);
    formData.append("baseRate", validatedData.baseRate.toString());
    formData.append("active", validatedData.active.toString());

    if (validatedData.description) {
      formData.append("description", validatedData.description);
    }
    if (validatedData.maxOccupancy !== undefined) {
      formData.append("maxOccupancy", validatedData.maxOccupancy.toString());
    }

    const validFiles = validatedData.images?.filter(
      (file): file is File => file instanceof File
    );
    validFiles?.forEach((file) => {
      formData.append("images", file);
    });

    const resp = await http.post(RoomTypes.create, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
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
