import {
  type RouteConfig,
  index,
  layout,
  prefix,
  route,
} from "@react-router/dev/routes";

export default [
  layout("layouts/auth.layout.tsx", [
    ...prefix("auth", [
      route("login", "routes/auth/login.tsx"),
      route("forgot-password", "routes/auth/forgot-password.tsx"),
      route("reset-password", "routes/auth/reset-password.tsx"),
    ]),
  ]),
  route("colors", "components/color-showcase.tsx"),
  ...prefix("dashboard", [
    route("menu-pos", "routes/orders/menu-pos.tsx"),
    route("service-pos", "routes/orders/service-pos.tsx"),
  ]),
  layout("layouts/dashboard.layout.tsx", [
    ...prefix("dashboard", [
      ...prefix("services", [
        index("routes/services/services.tsx"),
        route("types", "routes/services/types.tsx"),
        route("menu", "routes/menu/menu.tsx"),
        route("menu-categories", "routes/menu/menu-categories.tsx"),
      ]),
      ...prefix("bookings", [
        route("list", "routes/reservation/bookings/list.tsx"),
        route("reports", "routes/reservation/reports/reports.tsx"),
        route("grid", "routes/reservation/bookings/grid.tsx"),
        route(
          "detail/:bookingCode",
          "routes/reservation/booking-detail/booking-detail.tsx"
        ),
        route("new-booking", "routes/reservation/new-booking.tsx"),
      ]),
      ...prefix("orders", [
        route("menu-orders", "routes/orders/menu-orders.tsx"),
        route("service-orders", "routes/orders/service-orders.tsx"),
      ]),
      ...prefix("rooms", [
        index("routes/rooms/rooms.tsx"),
        route("types", "routes/rooms/types.tsx"),
      ]),
      route("units", "routes/units/units.tsx"),
      route("invoices", "routes/invoices/invoices.tsx"),
      route("chat", "routes/chat/chat.tsx"),
      route("users", "routes/users/users.tsx"),
      ...prefix("staff", [
        index("routes/staff/staff/staff.tsx"),
        route("work-shifts", "routes/staff/work-shifts/work-shifts.tsx"),
        route("holidays", "routes/staff/holidays/holidays.tsx"),
        route("schedules", "routes/staff/schedules/schedules.tsx"),
      ]),
    ]),
  ]),
  layout("layouts/customer.layout.tsx", [
    index("routes/customer/chat/inbox.tsx"),
    route("chat", "routes/customer/chat/chat.tsx"),
    route("map", "routes/customer/map/map.tsx"),
  ]),

  route("*", "routes/not-found.tsx"),
] satisfies RouteConfig;
