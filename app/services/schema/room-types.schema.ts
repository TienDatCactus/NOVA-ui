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
  code: z.string().min(2).max(100),
  name: z.string().min(2).max(100),
  baseRate: z.number().min(0),
  active: z.boolean(),
  createdAt: z.string(),
});

const UpdateRoomTypesDetailResponseSchema = z.object({
  id: z.string(),
  code: z.string().min(2).max(100),
  name: z.string().min(2).max(100),
  baseRate: z.number().min(0),
  active: z.boolean(),
  createdAt: z.string(),
});

const CreateRoomTypesResponseSchema = z.object({
  id: z.string(),
  code: z.string().min(2).max(100),
  name: z.string().min(2).max(100),
  baseRate: z.number().min(0),
  active: z.boolean(),
  createdAt: z.string(),
});

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
