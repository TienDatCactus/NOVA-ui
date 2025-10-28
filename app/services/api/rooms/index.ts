import type {
  GetAvailableRoomsInternalParams,
  RoomBookingHistoryParams,
  RoomDetailParams,
  RoomListParams,
} from "~/services/types/room.types";
import type {
  RoomDetailResponseDto,
  UpdateRoomStatusResponseDto,
  RoomListResponseDto,
  RoomBookingHistoryResponseDto,
  CreateRoomResponseDto,
  UpdateRoomDetailResponseDto,
  GetAvailableRoomsInternalResponseDto,
  UpdateRoomDetailRequestDto,
  CreateRoomRequestDto,
} from "./dto";
import http from "~/lib/http";
import { Rooms } from "~/services/url";
import useRoomSchema from "~/services/schema/room.schema";

const {
  RoomDetailSchema,
  UpdateRoomStatusResponseSchema,
  RoomListResponseSchema,
  RoomBookingHistoryResponseSchema,
  CreateRoomResponseSchema,
  UpdateRoomDetailResponseSchema,
  GetAvailableRoomsInternalResponseSchema,
  CreateRoomRequestSchema,
  UpdateRoomDetailRequestSchema,
} = useRoomSchema();

async function getRoomList(
  params: RoomListParams
): Promise<RoomListResponseDto> {
  try {
    const resp = await http.get(Rooms.list, { params });
    return RoomListResponseSchema.parse(resp.data);
  } catch (error) {
    console.error(error);
    return Promise.reject(error);
  }
}

async function getRoomDetails(
  id: string,
  params: RoomDetailParams
): Promise<RoomDetailResponseDto> {
  try {
    const resp = await http.get(Rooms.detail(id), {
      params,
    });
    return RoomDetailSchema.parse(resp.data);
  } catch (error) {
    console.error(error);
    return Promise.reject(error);
  }
}

async function getRoomBookingHistory(
  id: string,
  params: RoomBookingHistoryParams
): Promise<RoomBookingHistoryResponseDto> {
  try {
    const resp = await http.get(Rooms.bookingHistory(id), {
      params,
    });
    return RoomBookingHistoryResponseSchema.parse(resp.data);
  } catch (error) {
    console.error(error);
    return Promise.reject(error);
  }
}

async function updateRoomStatus(data: {
  roomId: string;
  status: string;
}): Promise<UpdateRoomStatusResponseDto> {
  try {
    const resp = await http.post(Rooms.updateStatus, data);
    return UpdateRoomStatusResponseSchema.parse(resp.data);
  } catch (error) {
    console.error(error);
    return Promise.reject(error);
  }
}
async function createRoom(
  data: CreateRoomRequestDto
): Promise<CreateRoomResponseDto> {
  try {
    const resp = await http.post(
      Rooms.create,
      CreateRoomRequestSchema.parse(data)
    );
    return CreateRoomResponseSchema.parse(resp.data);
  } catch (error) {
    console.error(error);
    return Promise.reject(error);
  }
}

async function updateRoomDetail(
  id: string,
  data: UpdateRoomDetailRequestDto
): Promise<UpdateRoomDetailResponseDto> {
  try {
    const resp = await http.patch(
      Rooms.update(id),
      UpdateRoomDetailRequestSchema.parse(data)
    );
    return UpdateRoomDetailResponseSchema.parse(resp.data);
  } catch (error) {
    console.error(error);
    return Promise.reject(error);
  }
}

async function getAvailableRoomsInternal(
  params: GetAvailableRoomsInternalParams
): Promise<GetAvailableRoomsInternalResponseDto> {
  try {
    const resp = await http.get(Rooms.getAvailableRoomsInternal, { params });
    return GetAvailableRoomsInternalResponseSchema.parse(resp.data);
  } catch (error) {
    console.error(error);
    return Promise.reject(error);
  }
}
export const RoomsService = {
  getRoomList,
  getRoomDetails,
  updateRoomStatus,
  getRoomBookingHistory,
  createRoom,
  updateRoomDetail,
  getAvailableRoomsInternal,
};
