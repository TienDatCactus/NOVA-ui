import type {
  GetAvailableRoomsInternalParams,
  RoomBookingHistoryParams,
  RoomDetailParams,
  RoomListParams,
} from "~/services/api/rooms/room.types";
import type {
  RoomDetailResponseDto,
  UpdateRoomStatusResponseDto,
  RoomListResponseDto,
  RoomBookingHistoryResponseDto,
  CreateRoomResponseDto,
  UpdateRoomDetailResponseDto,
  AvailableRoomsInternalResponseDto,
  UpdateRoomDetailRequestDto,
  CreateRoomRequestDto,
  QRCodeResponseDto,
} from "./dto";
import http from "~/lib/http";
import { Rooms } from "~/services/url";
import { RoomSchema } from "~/services/api/rooms/room.schema";

const {
  RoomDetailSchema,
  UpdateRoomStatusResponseSchema,
  RoomListResponseSchema,
  RoomBookingHistoryResponseSchema,
  CreateRoomResponseSchema,
  UpdateRoomDetailResponseSchema,
  AvailableRoomsInternalResponseSchema,
  CreateRoomRequestSchema,
  UpdateRoomDetailRequestSchema,
  QRCodeResponseSchema,
} = RoomSchema;

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
): Promise<AvailableRoomsInternalResponseDto> {
  try {
    const resp = await http.get(Rooms.getAvailableRoomsInternal, { params });
    return AvailableRoomsInternalResponseSchema.parse(resp.data);
  } catch (error) {
    console.error(error);
    return Promise.reject(error);
  }
}

async function deleteRoom(id: string) {
  try {
    await http.delete(Rooms.delete(id));
  } catch (error) {
    console.error(error);
    return Promise.reject(error);
  }
}
// !Lấy QR code image (PNG) cho phòng với ChatToken hiện tại. Endpoint này CHỈ trả về QR code từ ChatToken đã tồn tại, KHÔNG tạo token mới.
async function generateQRCode(roomId: string, baseUrl?: string) {
  try {
    const resp = await http.get(
      Rooms.generateQRCode(
        roomId,
        (baseUrl = import.meta.env.VITE_CHAT_BASE_URL)
      )
    );
    return resp.data;
  } catch (error) {
    console.error(error);
    return Promise.reject(error);
  }
}
//! Tạo lại ChatToken MỚI và trả về QR code image (PNG). Endpoint này sẽ TẠO token mới, vô hiệu hóa QR code cũ, và trả về QR code mới.
async function regenerateQRCode(roomId: string, baseUrl?: string) {
  try {
    const resp = await http.get(
      Rooms.regenerateQRCode(
        roomId,
        (baseUrl = import.meta.env.VITE_CHAT_BASE_URL)
      )
    );
    return resp.data;
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
  deleteRoom,
  generateQRCode,
  regenerateQRCode,
};
