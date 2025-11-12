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
  description: z.string().optional().nullable(),
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
  id: z.string("ID phòng không hợp lệ"),
  code: z.string("Mã phòng không hợp lệ"),
  name: z.string("Tên phòng không hợp lệ"),
  description: z.string("Mô tả không hợp lệ").optional().nullable(),
  baseRate: z.number("Giá cơ bản không hợp lệ"),
  active: z.boolean("Trạng thái không hợp lệ"),
  maxOccupancy: z
    .number("Sức chứa không hợp lệ")
    .min(0, "Sức chứa không được nhỏ hơn 0"),
  createdAt: z.string("Ngày tạo không hợp lệ"),
  images: z.array(
    z.object({
      mediaId: z.string("ID media không hợp lệ"),
      url: z.string("URL hình ảnh không hợp lệ"),
      caption: z.string("Chú thích không hợp lệ").nullable(),
      contentType: z.string("Kiểu nội dung không hợp lệ"),
      displayOrder: z.number("Thứ tự hiển thị không hợp lệ"),
    }),
    "Danh sách hình ảnh không hợp lệ"
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
