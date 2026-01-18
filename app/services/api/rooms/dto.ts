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
  QRCodeResponseSchema,
  AvailableRoomsResponseSchema,
  AvailableRoomsWithDetailResponseSchema,
} = RoomSchema;

export type RoomDetailResponseDto = z.infer<typeof RoomDetailSchema>;
export type RoomBookingHistoryResponseDto = z.infer<
  typeof RoomBookingHistoryResponseSchema
>;
export type UpdateRoomStatusResponseDto = z.infer<
  typeof UpdateRoomStatusResponseSchema
>;
export type RoomListResponseDto = z.infer<typeof RoomListResponseSchema>;
export type RoomListItemDto = z.infer<typeof RoomListItemSchema>;
export type CreateRoomResponseDto = z.infer<typeof CreateRoomResponseSchema>;
export type UpdateRoomDetailResponseDto = z.infer<
  typeof UpdateRoomDetailResponseSchema
>;

export type CreateRoomRequestDto = z.infer<typeof CreateRoomRequestSchema>;
export type UpdateRoomDetailRequestDto = z.infer<
  typeof UpdateRoomDetailRequestSchema
>;

export type QRCodeResponseDto = z.infer<typeof QRCodeResponseSchema>;

export type AvailableRoomsResponseDto = z.infer<
  typeof AvailableRoomsResponseSchema
>;
export type AvailableRoomsWithDetailResponseDto = z.infer<
  typeof AvailableRoomsWithDetailResponseSchema
>;
