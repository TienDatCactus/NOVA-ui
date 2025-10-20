import type { RoomDetailParams } from "~/services/types/room.types";
import type { RoomDetailResponseDto } from "./dto";
import http from "~/lib/http";
import { Rooms } from "~/services/url";
import useRoomSchema from "~/services/schema/room.schema";
const { RoomDetailSchema, UpdateRoomStatusResponseSchema } = useRoomSchema();
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

async function updateRoomStatus(data: { roomId: string; status: string }) {
  try {
    const resp = await http.post(Rooms.updateStatus, data);
    return UpdateRoomStatusResponseSchema.parse(resp.data);
  } catch (error) {
    console.error(error);
    return Promise.reject(error);
  }
}
export const RoomsService = {
  getRoomDetails,
  updateRoomStatus,
};
