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
  route("buttons", "components/button-showcase.tsx"),
  route("colors", "components/color-showcase.tsx"),

  ...prefix("dashboard", [
    ...prefix("orders", [route("pos", "routes/orders/pos.tsx")]),
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
        index("routes/reservation/reports/reports.tsx"),
        route("grid", "routes/reservation/bookings/grid.tsx"),
        route("list", "routes/reservation/bookings/list.tsx"),
        route(
          "detail/:bookingCode",
          "routes/reservation/booking-detail/booking-detail.tsx"
        ),
        route("invoices", "routes/reservation/invoices/invoices.tsx"),
        route("new-booking", "routes/reservation/new-booking.tsx"),
      ]),
      ...prefix("orders", [index("routes/orders/orders.tsx")]),
      ...prefix("rooms", [
        index("routes/rooms/rooms.tsx"),
        route("types", "routes/rooms/types.tsx"),
      ]),
      route("chat", "routes/chat/chat.tsx"),
      route("units", "routes/units/units.tsx"),
      route("invoices", "routes/invoices/invoices.tsx"),
      route("users", "routes/users/users.tsx"),
      route("staff", "routes/staff/staff.tsx"),
    ]),
  ]),

  route("*", "routes/not-found.tsx"),
] satisfies RouteConfig;
