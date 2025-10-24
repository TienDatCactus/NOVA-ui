import type z from "zod";
import useRoomSchema from "~/services/schema/room.schema";

const {
  RoomBookingHistoryResponseSchema,
  RoomDetailSchema,
  UpdateRoomStatusResponseSchema,
  RoomListResponseSchema,
  RoomListItemSchema,
  CreateRoomResponseSchema,
  UpdateRoomDetailResponseSchema,
} = useRoomSchema();

type RoomDetailResponseDto = z.infer<typeof RoomDetailSchema>;
type RoomBookingHistoryResponseDto = z.infer<
  typeof RoomBookingHistoryResponseSchema
>;
type UpdateRoomStatusResponseDto = z.infer<
  typeof UpdateRoomStatusResponseSchema
>;
type RoomListResponseDto = z.infer<typeof RoomListResponseSchema>;
type RoomListItemDto = z.infer<typeof RoomListItemSchema>;
type CreateRoomResponseDto = z.infer<typeof CreateRoomResponseSchema>;
type UpdateRoomDetailResponseDto = z.infer<
  typeof UpdateRoomDetailResponseSchema
>;
export type {
  RoomDetailResponseDto,
  RoomListItemDto,
  RoomListResponseDto,
  UpdateRoomStatusResponseDto,
  RoomBookingHistoryResponseDto,
  CreateRoomResponseDto,
  UpdateRoomDetailResponseDto,
};
