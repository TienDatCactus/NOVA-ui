import type z from "zod";
import { RoomSchema } from "~/services/api/rooms/room.schema";

const {
  RoomBookingHistoryResponseSchema,
  RoomDetailSchema,
  UpdateRoomStatusResponseSchema,
  RoomListResponseSchema,
  RoomListItemSchema,
  CreateRoomResponseSchema,
  UpdateRoomDetailResponseSchema,
  CreateRoomRequestSchema,
  UpdateRoomDetailRequestSchema,
  AvailableRoomsInternalResponseSchema,
} = RoomSchema;

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
type AvailableRoomsInternalResponseDto = z.infer<
  typeof AvailableRoomsInternalResponseSchema
>;

type CreateRoomRequestDto = z.infer<typeof CreateRoomRequestSchema>;
type UpdateRoomDetailRequestDto = z.infer<typeof UpdateRoomDetailRequestSchema>;
export type {
  AvailableRoomsInternalResponseDto,
  CreateRoomRequestDto,
  CreateRoomResponseDto,
  RoomBookingHistoryResponseDto,
  RoomDetailResponseDto,
  RoomListItemDto,
  RoomListResponseDto,
  UpdateRoomDetailRequestDto,
  UpdateRoomDetailResponseDto,
  UpdateRoomStatusResponseDto,
};
