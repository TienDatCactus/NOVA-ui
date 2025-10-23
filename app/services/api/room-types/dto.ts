import type z from "zod";
import useRoomTypesSchema from "~/services/schema/room-types.schema";

const {
  RoomTypesListResponseSchema,
  RoomTypesDetailResponseSchema,
  UpdateRoomTypesDetailResponseSchema,
  CreateRoomTypesResponseSchema,
} = useRoomTypesSchema();

type RoomTypesListResponseDto = z.infer<typeof RoomTypesListResponseSchema>;
type RoomTypesDetailResponseDto = z.infer<typeof RoomTypesDetailResponseSchema>;
type UpdateRoomTypesDetailResponseDto = z.infer<
  typeof UpdateRoomTypesDetailResponseSchema
>;
type CreateRoomTypesResponseDto = z.infer<typeof CreateRoomTypesResponseSchema>;

export type {
  RoomTypesListResponseDto,
  RoomTypesDetailResponseDto,
  UpdateRoomTypesDetailResponseDto,
  CreateRoomTypesResponseDto,
};
