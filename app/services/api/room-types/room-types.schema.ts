import z from "zod";

const RoomTypesListItem = z.object({
  id: z.string(),
  code: z.string().max(100),
  translations: z.array(
    z.object({
      languageCode: z.string(),
      name: z.string(),
      description: z.string().nullable(),
    })
  ),
  imageUrls: z.array(z.url()),
  currencyCode: z.string().length(3),
  baseRate: z.number().min(0),
  active: z.boolean(),
  roomsCount: z.number().min(0),
});

const RoomTypesListResponseSchema = z.array(RoomTypesListItem);

const RoomTypesDetailResponseSchema = z.object({
  id: z.string(),
  code: z.string(),
  translations: z.array(
    z.object({
      languageCode: z.string(),
      name: z.string(),
      description: z.string().nullable(),
    })
  ),
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
  code: z
    .string()
    .min(1, "Mã hạng phòng là bắt buộc")
    .max(100, "Mã hạng phòng tối đa 100 ký tự"),
  translations: z
    .array(
      z.object({
        languageCode: z.string(),
        name: z.string().min(1, "Tên hạng phòng là bắt buộc"),
        description: z.string().optional().nullable(),
      })
    )
    .optional(),
  baseRate: z
    .number("Giá cơ bản là bắt buộc")
    .min(1, "Giá cơ bản phải lớn hơn 0"),
  active: z.boolean(),
  maxOccupancy: z
    .number()
    .min(1, "Sức chứa tối thiểu là 1 người")
    .max(20, "Sức chứa tối đa là 20 người"),
  images: z.array(z.instanceof(File)).optional(),
});

const UpdateRoomTypesDetailRequestSchema = EditRoomTypesRequestSchema.extend({
  removeMediaIds: z.array(z.string()).optional(),
});

const CreateRoomTypesRequestSchema = EditRoomTypesRequestSchema;
const EditRoomTypesResponseSchema = z.object({
  id: z.string("ID phòng không hợp lệ"),
  code: z.string("Mã phòng không hợp lệ"),
  translations: z
    .array(
      z.object({
        languageCode: z.string(),
        name: z.string().min(1, "Tên hạng phòng là bắt buộc"),
        description: z.string().optional().nullable(),
      })
    )
    .optional(),
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
