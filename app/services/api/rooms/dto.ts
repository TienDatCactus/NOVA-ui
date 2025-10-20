import type z from "zod";
import useRoomSchema from "~/services/schema/room.schema";

const { RoomDetailSchema, UpdateRoomStatusResponseSchema } = useRoomSchema();
type RoomDetailResponseDto = z.infer<typeof RoomDetailSchema>;
type UpdateRoomStatusResponseDto = z.infer<
  typeof UpdateRoomStatusResponseSchema
>;
export type { RoomDetailResponseDto, UpdateRoomStatusResponseDto };
