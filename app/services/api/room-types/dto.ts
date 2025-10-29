import type z from "zod";
import useRoomTypesSchema from "~/services/schema/room-types.schema";

const {
  RoomTypesListItem,
  RoomTypesListResponseSchema,
  RoomTypesDetailResponseSchema,
  UpdateRoomTypesDetailRequestSchema,
  CreateRoomTypesRequestSchema,
  CreateRoomTypesResponseSchema,
  UpdateRoomTypesDetailResponseSchema,
} = useRoomTypesSchema();

type RoomTypesListItemDto = z.infer<typeof RoomTypesListItem>;
type RoomTypesListResponseDto = z.infer<typeof RoomTypesListResponseSchema>;
type RoomTypesDetailResponseDto = z.infer<typeof RoomTypesDetailResponseSchema>;
type UpdateRoomTypesDetailRequestDto = z.infer<
  typeof UpdateRoomTypesDetailRequestSchema
>;
type UpdateRoomTypesDetailResponseDto = z.infer<
  typeof UpdateRoomTypesDetailResponseSchema
>;
type CreateRoomTypesRequestDto = z.infer<typeof CreateRoomTypesRequestSchema>;
type CreateRoomTypesResponseDto = z.infer<typeof CreateRoomTypesResponseSchema>;

export type {
  RoomTypesListItemDto,
  RoomTypesListResponseDto,
  RoomTypesDetailResponseDto,
  UpdateRoomTypesDetailRequestDto,
  CreateRoomTypesResponseDto,
  UpdateRoomTypesDetailResponseDto,
  CreateRoomTypesRequestDto,
};
