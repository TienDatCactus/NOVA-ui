import type z from "zod";
import useBookingSchema from "~/services/schema/booking.schema";
import useMenuSchema from "~/services/schema/menu.schema";

const { MenuListResponseSchema } = useMenuSchema();

type MenuListResponseDto = z.infer<typeof MenuListResponseSchema>;

export type { MenuListResponseDto };
