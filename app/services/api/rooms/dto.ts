import type z from "zod";
import useRoomSchema from "~/services/schema/room.schema";

const {
  RoomDetailSchema,
  UpdateRoomStatusResponseSchema,
  RoomListResponseSchema,
  RoomListItemSchema,
} = useRoomSchema();

type RoomDetailResponseDto = z.infer<typeof RoomDetailSchema>;
type UpdateRoomStatusResponseDto = z.infer<
  typeof UpdateRoomStatusResponseSchema
>;
type RoomListResponseDto = z.infer<typeof RoomListResponseSchema>;
type RoomListItemDto = z.infer<typeof RoomListItemSchema>;

export type {
  RoomDetailResponseDto,
  UpdateRoomStatusResponseDto,
  RoomListResponseDto,
  RoomListItemDto,
};
