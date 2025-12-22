import BookingFlow from "~/features/create-booking-wizard";
import type { Route } from "./+types/new-booking";
import { AuthLoader, RouteModule, Permission } from "~/lib/auth/auth.loader";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Tạo Đặt Phòng - NOVA Hotel Management" },
    { name: "description", content: "Tạo đặt phòng mới cho khách" },
  ];
}

export const clientLoader = () =>
  AuthLoader.guard(RouteModule.Bookings, Permission.Create);

export default function Component({}: Route.ComponentProps) {
  return <BookingFlow />;
}
