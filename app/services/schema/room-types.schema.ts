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
      caption: z.string(),
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
  images: z
    .array(z.instanceof(File).optional())
    .refine((file: any) => file?.type.startsWith("image/"), {
      message: "Only image files are allowed",
    })
    .refine((file: any) => file?.size <= 5 * 1024 * 1024, {
      message: "Each image must be less than 5MB",
    }),
});

const UpdateRoomTypesDetailResponseSchema = EditRoomTypesRequestSchema.extend({
  removeMediaIds: z.array(z.string()),
});

const CreateRoomTypesResponseSchema = EditRoomTypesRequestSchema;

const useRoomTypesSchema = () => {
  return {
    RoomTypesListItem,
    RoomTypesListResponseSchema,
    RoomTypesDetailResponseSchema,
    UpdateRoomTypesDetailResponseSchema,
    CreateRoomTypesResponseSchema,
  };
};

export default useRoomTypesSchema;
