import type z from "zod";
import useRoomTypesSchema from "~/services/schema/room-types.schema";

const {
  RoomTypesListItem,
  RoomTypesListResponseSchema,
  RoomTypesDetailResponseSchema,
  UpdateRoomTypesDetailResponseSchema,
  CreateRoomTypesResponseSchema,
} = useRoomTypesSchema();

type RoomTypesListItemDto = z.infer<typeof RoomTypesListItem>;
type RoomTypesListResponseDto = z.infer<typeof RoomTypesListResponseSchema>;
type RoomTypesDetailResponseDto = z.infer<typeof RoomTypesDetailResponseSchema>;
type UpdateRoomTypesDetailResponseDto = z.infer<
  typeof UpdateRoomTypesDetailResponseSchema
>;
type CreateRoomTypesResponseDto = z.infer<typeof CreateRoomTypesResponseSchema>;

export type {
  RoomTypesListItemDto,
  RoomTypesListResponseDto,
  RoomTypesDetailResponseDto,
  UpdateRoomTypesDetailResponseDto,
  CreateRoomTypesResponseDto,
};
