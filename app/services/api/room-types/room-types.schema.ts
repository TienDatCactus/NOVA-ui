import z from "zod";

const RoomTypesListItem = z.object({
  id: z.string(),
  code: z.string().min(2).max(100),
  name: z.string().min(2).max(100),
  baseRate: z.number().min(0),
  active: z.boolean(),
  roomsCount: z.number().min(0),
});

const RoomTypesListResponseSchema = z.array(RoomTypesListItem);

const RoomTypesDetailResponseSchema = z.object({
  id: z.string(),
  code: z.string(),
  name: z.string(),
  description: z.string(),
  baseRate: z.number(),
  active: z.boolean(),
  maxOccupancy: z.number(),
  createdAt: z.string(),
  images: z.array(
    z.object({
      mediaId: z.string(),
      url: z.string(),
      caption: z.string().nullable(),
      contentType: z.string(),
      displayOrder: z.number(),
    })
  ),
});

const EditRoomTypesRequestSchema = z.object({
  code: z.string(),
  name: z.string(),
  description: z.string().optional(),
  baseRate: z.number(),
  active: z.boolean(),
  maxOccupancy: z.number().optional(),
  images: z.array(z.instanceof(File).optional()),
});

const UpdateRoomTypesDetailRequestSchema = EditRoomTypesRequestSchema.extend({
  removeMediaIds: z.array(z.string()).optional(),
});

const CreateRoomTypesRequestSchema = EditRoomTypesRequestSchema;
const EditRoomTypesResponseSchema = z.object({
  id: z.string(),
  code: z.string(),
  name: z.string(),
  description: z.string(),
  baseRate: z.number(),
  active: z.boolean(),
  maxOccupancy: z.number().min(0),
  createdAt: z.string(),
  images: z.array(
    z.object({
      mediaId: z.string(),
      url: z.string(),
      caption: z.string().nullable(),
      contentType: z.string(),
      displayOrder: z.number(),
    })
  ),
});
const UpdateRoomTypesDetailResponseSchema = EditRoomTypesResponseSchema;
const CreateRoomTypesResponseSchema = EditRoomTypesResponseSchema;

export const RoomTypesSchema = {
  RoomTypesListItem,
  RoomTypesListResponseSchema,
  RoomTypesDetailResponseSchema,
  UpdateRoomTypesDetailRequestSchema,
  CreateRoomTypesRequestSchema,
  UpdateRoomTypesDetailResponseSchema,
  CreateRoomTypesResponseSchema,
};
