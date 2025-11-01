import type z from "zod";
import { RoomTypesSchema } from "~/services/schema/room-types.schema";

const {
  RoomTypesListItem,
  RoomTypesListResponseSchema,
  RoomTypesDetailResponseSchema,
  UpdateRoomTypesDetailRequestSchema,
  CreateRoomTypesRequestSchema,
  CreateRoomTypesResponseSchema,
  UpdateRoomTypesDetailResponseSchema,
} = RoomTypesSchema;

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
  CreateRoomTypesRequestDto,
  CreateRoomTypesResponseDto,
  RoomTypesDetailResponseDto,
  RoomTypesListItemDto,
  RoomTypesListResponseDto,
  UpdateRoomTypesDetailRequestDto,
  UpdateRoomTypesDetailResponseDto,
};
