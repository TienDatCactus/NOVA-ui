import type z from "zod";
import { RoomTypesSchema } from "~/services/api/room-types/room-types.schema";

const {
  RoomTypesListItem,
  RoomTypesListResponseSchema,
  RoomTypesDetailResponseSchema,
  UpdateRoomTypesDetailRequestSchema,
  CreateRoomTypesRequestSchema,
  CreateRoomTypesResponseSchema,
  UpdateRoomTypesDetailResponseSchema,
} = RoomTypesSchema;

export type RoomTypesListItemDto = z.infer<typeof RoomTypesListItem>;
export type RoomTypesListResponseDto = z.infer<
  typeof RoomTypesListResponseSchema
>;
export type RoomTypesDetailResponseDto = z.infer<
  typeof RoomTypesDetailResponseSchema
>;
export type UpdateRoomTypesDetailRequestDto = z.infer<
  typeof UpdateRoomTypesDetailRequestSchema
>;
export type UpdateRoomTypesDetailResponseDto = z.infer<
  typeof UpdateRoomTypesDetailResponseSchema
>;
export type CreateRoomTypesRequestDto = z.infer<
  typeof CreateRoomTypesRequestSchema
>;
export type CreateRoomTypesResponseDto = z.infer<
  typeof CreateRoomTypesResponseSchema
>;
